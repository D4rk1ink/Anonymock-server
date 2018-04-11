import { Request, Response, preResponse } from '../utils/express.util';
import { Folder } from '../models/folder'
import { Endpoint } from '../models/endpoint'
import { Response as ResponseModel } from '../models/response'
import { Project } from '../models/project'
import { Method } from '../models/method'
import * as encrypt from '../utils/encrypt.util'
import * as verify from './verify.controller'

export const create = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || await verify.verifyMember(req, res)) {
        try {
            const { projectid } = req.headers
            const { folder } = req.body
            const myProject = await Project.findById(projectid)
            const myFolder = await Folder.findById(folder)
            const myMethod = await Method.findOne({ name: 'GET' }, 'id name')
            if (myProject && myFolder && myMethod && myFolder.project === myProject.id) {
                const endpointId = encrypt.virtualId(4)
                const endpoint = await Endpoint.create({
                    _id: endpointId,
                    name: 'New Endpoint',
                    method: myMethod.id,
                    path: `/new-endpoint-${endpointId}`,
                    folder: myFolder.id,
                    project: myProject.id
                })
                endpoint.method = myMethod
                const updateFolder = await Folder.update(folder, { $push: { endpoints: endpoint.id }})
                res.json(preResponse.data(endpoint))
            } else {
                res.json(preResponse.error(null, 'Folder not found'))
            }
        } catch (err) {
            res.json(preResponse.error(null, 'Create fail'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const getById = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || await verify.verifyMember(req, res)) {
        const id = req.params.id
        const myEndpoint = await Endpoint.findById(id, 'id name method path folder')
        if (myEndpoint) {
            res.json(preResponse.data(myEndpoint))
        } else {
            res.json(preResponse.error(null, 'Project not found'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const update = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || await verify.verifyMember(req, res)) {
        const id = req.params.id
        const { projectid } = req.headers
        const { name, path, method, folder } = req.body
        const myProject =  await Project.findById(projectid)
        const myFolder =  await Folder.findById(folder)
        const myMethod =  await Method.findById(method)
        const myEndpoint = await Endpoint.findById(id)
        if (myProject && myFolder && myMethod && myFolder.project === myProject.id) {
            if (myEndpoint && myEndpoint.project === myProject.id) {
                if (myFolder.id !== myEndpoint.folder) {
                    await Folder.update(myEndpoint.folder, { $pull: { endpoints: myEndpoint.id }}) // remove endpoint from old folder
                    await Folder.update(myFolder.id, { $push: { endpoints: myEndpoint.id }}) // add endpoint to new folder
                }
                await Endpoint.update(id, { name, path, method, folder })
                const endpoint = await Endpoint.findById(id)
                res.json(preResponse.data(endpoint))
            } else {
                res.json(preResponse.error(null, 'Endpoint not found'))
            }
        } else {
            res.json(preResponse.error(null, 'Folder or method not found'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const search = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || await verify.verifyMember(req, res)) {
        const { project, folder, search, page } = req.query
        let folders: any[] = [folder]
        const myProject = await Project.findById(project, 'folders')
        if (myProject) {
            folders = myProject.folders
        }
        const endpointsCount = await Endpoint.search(folders, search, page, 'id method name path').count()
        const endpoints = await Endpoint.search(folders, search, page, 'id method name path')
            .skip((page - 1) * 10)
            .limit(10)
        const data = {
            endpoints: endpoints,
            limitPage: Math.ceil(endpointsCount / 10)
        }
        res.json(preResponse.data(data))
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const deleteEndpoint = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || await verify.verifyMember(req, res)) {
        try {
            const id = req.params.id
            const myEndpoint = await Endpoint.findById(id)
            if (myEndpoint) {
                await ResponseModel.getModel().deleteMany({ endpoint: myEndpoint.id })
                await Endpoint.remove(myEndpoint.id)
                await Folder.update(myEndpoint.folder, { $pull: { endpoints: myEndpoint.id }})
                res.json(preResponse.data('Successfully'))
            } else {
                res.json(preResponse.error(null, 'Endpoint not found'))
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