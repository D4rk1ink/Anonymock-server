import { Request, Response, NextFunction, preResponse } from '../utils/express.util'
import { Project } from '../models/project'
import { User } from '../models/user'
import { ADDRGETNETWORKPARAMS } from 'dns';

export const verifyMyself = async (id: string, req: Request) => {
    const user = await User.findById(req.certificate.id)
    return user && user.id === id
}

export const verifyAdmin = async (req: Request) => {
    const user = await User.findById(req.certificate.id)
    return user && user.isAdmin
}

export const verifyManager = async (req: Request) => {
    const { projectid } = req.headers
    const project = await Project.findOne({ _id: projectid, 'members.user': req.certificate.id }, 'members')
    let isManager = false
    if (project) {
        const member = project.members.find(member => member.user.toString() === req.certificate.id)
        isManager = member && member.isManager
    }
    return isManager
}

export const verifyMember = async (req: Request) => {
    const { projectid } = req.headers
    const project = await Project.findOne({ _id: projectid, 'members.user': req.certificate.id }, 'members')
    let isMember = false
    if (project) {
        isMember = true
    }
    return isMember
}
export const mySelf = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    if (await verifyMyself(id, req)) {
        next()
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}
export const notMySelf = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    if (!(await verifyMyself(id, req))) {
        next()
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}
/**
 * @param Admin permission
 */
export const highLevel = async (req: Request, res: Response, next: NextFunction) => {
    if (await verifyAdmin(req)) {
        next()
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}
/**
 * @param Admin or Manager permission
 */
export const midLevel = async (req: Request, res: Response, next: NextFunction) => {
    if (await verifyAdmin(req) || await verifyManager(req)) {
        next()
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}
/**
 * @param Admin or Manager or Member permission
 */
export const lowLevel = async (req: Request, res: Response, next: NextFunction) => {
    if (await verifyAdmin(req) || await verifyManager(req) || await verifyMember(req)) {
        next()
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}