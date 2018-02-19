import { Request, Response, preResponse } from '../utils/express.util'
import { Project } from '../models/project'
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
            const { id } = req.params
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

export const create = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res)) {
        try {
            const { name } = req.body
            const projectId = encrypt.virtualId(3)
            const project = await Project.create({ _id: projectId, name: name })
            const smallProject = {
                id: project.id,
                name: project.name,
                status: project.status
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