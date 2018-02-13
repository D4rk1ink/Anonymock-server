import { Request, Response, preResponse } from '../utils/express.util'
import { Project } from '../models/project'
import { User } from '../models/user'
import * as encrypt from '../utils/encrypt.util'
import * as verify from './verify.controller'

export const getAll = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res)) {
        try {
            const projects = await Project.findAll({}, 'id name status')
            res.json(preResponse.data(projects))
        } catch (err) {
            res.json(preResponse.error(null, err.message))
        }
    } else {
        const id = req.certificate.id
        const projects = await Project.findAll({ members: { user: id }}, 'id name status')
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const getById = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res)) {
        try {
            const { id } = req.params
            const project = await Project.findById(id, 'id name status description repository environment')
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