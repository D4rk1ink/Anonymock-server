import { Request, Response, preResponse } from '../utils/express.util';
import { Log } from '../models/log'
import { Project } from '../models/project'
import * as verify from './verify.controller'

export const search = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || await verify.verifyMember(req, res)) {
        const { projectid } = req.headers
        const { search, page } = req.query
        const logsCount = await Log.search(projectid, search).count()
        const logs = await Log.search(projectid, search)
            .skip((page - 1) * 20)
            .limit(20)
            .sort({'createdAt': 'desc'})
        const data = {
            logs: logs,
            limitPage: Math.ceil(logsCount / 20)
        }
        res.json(preResponse.data(data))
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const clear = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || await verify.verifyMember(req, res)) {
        const { projectid } = req.headers
        const myProject = await Project.findById(projectid)
        if (myProject) {
            await Log.getModel().deleteMany({ project: myProject.id })
            const logs = await Log.findAll({ project: myProject.id })
            res.json(preResponse.data({
                logs: logs
            }))
        } else {
            res.json(preResponse.error(null, 'Project not found'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}