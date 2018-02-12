import { Request, Response } from '../utils/express.util'
import { Project } from '../models/project'
import { User } from '../models/user'

export const verifyAdmin = async (req: Request, res: Response) => {
    const user = await User.findById(req.certificate.id)
    return user && user.isAdmin
}

export const verifyManager = async (req: Request, res: Response) => {
    const { vid } = req.body
    const user = await User.findById(req.certificate.id)
    const project = await Project.findById(vid)
    let isManager = false
    if (user && project) {
        const member = project.members.find(member => member.user === user.id)
        isManager = member && member.isManager
    }
    return isManager
}

export const verifyMember = async (req: Request, res: Response) => {
    const { vid } = req.body
    const user = await User.findById(req.certificate.id)
    const project = await Project.findById(vid)
    let isMember = false
    if (user && project) {
        const member = project.members.find(member => member.user === user.id)
        isMember = member && true
    }
    return isMember
}