import { Request, Response, preResponse } from '../utils/express.util';
import { Log } from '../models/log'
import * as verify from './verify.controller'

export const search = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || await verify.verifyMember(req, res)) {
        const { project, search, page } = req.query
        const logsCount = await Log.getModel().find({ project: project }).count()
        const logs = await Log.search(project, search, page)
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