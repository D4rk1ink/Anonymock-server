import { Request, Response, preResponse } from '../utils/express.util';
import { Project } from '../models/project'
import { Scraper } from '../models/scraper'
import { ScraperEndpoint } from '../models/scraper-endpoint'
import { ScraperRequest } from '../models/scraper-request'
import { Folder } from '../models/folder'
import { Endpoint } from '../models/endpoint'
import { Log } from '../models/log'
import { Response as ResponseModel } from '../models/response'
import { User } from '../models/user'
import * as encrypt from '../utils/encrypt.util'
import * as verify from './verify.controller'

export const getAll = async (req: Request, res: Response) => {
    try {
        let projects: any[] = []
        if (await verify.verifyAdmin(req, res)) {
            projects = await Project.findAll({}, 'id name status')
        } else {
            projects = await Project.findAll({ 'members.user': req.certificate.id }, 'id name status')
        }
        res.json(preResponse.data(projects))
    } catch (err) {
        res.json(preResponse.error(null, err.message))
    }
}

export const getById = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || await verify.verifyMember(req, res)) {
        try {
            const id = req.headers.projectid
            const project = await Project.findById(id, 'id name status description repository environments')
            let data: any = {}
            if (project) {
                data = {...project.toJSON()}
                data.isManager = await verify.verifyAdmin(req, res) || await verify.verifyManager(req, res)
            }
            res.json(preResponse.data(data))
        } catch (err) {
            res.json(preResponse.error(null, err.message))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const create = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res)) {
        try {
            const { name } = req.body
            const projectId = encrypt.virtualId(3)
            const scraperId = encrypt.virtualId(3)
            const project = await Project.create({ _id: projectId, name: name })
            const scraper = await Scraper.create({ _id: scraperId, project: project.id })
            const smallProject = {
                id: project.id,
                name: project.name,
                status: project.status,
            }
            res.json(preResponse.data(smallProject))
        } catch (err) {
            res.json(preResponse.error(null, err.message))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const update = async (req: Request, res: Response) => {
    const id = req.params.id
    if (await verify.verifyAdmin(req, res) || await verify.verifyManager(req, res)) {
        try {
            const { name, status, descripition, repository, environments } = req.body
            await Project.update(id, { name, status, descripition, repository, environments })
            const project = await Project.findById(id, 'id name status description repository environments')
            res.json(preResponse.data(project))
        } catch (err) {
            res.json(preResponse.error(null, err.message))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const deleteProject = async (req: Request, res: Response) => {
    const id = req.headers.projectid
    if (await verify.verifyAdmin(req, res) || await verify.verifyManager(req, res)) {
        try {
            const findProject = await Project.findById(id)
            const myScraper = await Scraper.findOne({ project: id })
            if (findProject && myScraper) {
                const endpointIds = (await Endpoint.findAll({ folder: { $in: findProject.folders }})).map(endpoint => endpoint.id)
                await ScraperRequest.getModel().deleteMany({ endpoint: { $in: myScraper.endpoints } })
                await ScraperEndpoint.getModel().deleteMany({ scraper: myScraper.id })
                await Scraper.getModel().deleteMany({ project: findProject.id })
                await Log.getModel().deleteMany({ project: findProject.id })
                await Folder.getModel().deleteMany({ project: findProject.id })
                await Endpoint.getModel().deleteMany({ folder: { $in: findProject.folders } })
                await ResponseModel.getModel().deleteMany({ endpoint: { $in: endpointIds } })
                await User.getModel().updateMany({ projects: findProject.id }, { $pull: { projects: findProject.id }})
                await Project.remove(id)
                res.json(preResponse.data('Successfully'))
            } else {
                res.json(preResponse.error(null, 'Project not found'))
            }
        } catch (err) {
            res.json(preResponse.error(null, err.message))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}