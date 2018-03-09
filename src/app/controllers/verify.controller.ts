import { Request, Response } from '../utils/express.util'
import { Project } from '../models/project'
import { User } from '../models/user'

export const verifyMyself = async (id: string, req: Request) => {
    const user = await User.findById(req.certificate.id)
    return user && user.id === id
}

export const verifyAdmin = async (req: Request, res: Response) => {
    const user = await User.findById(req.certificate.id)
    return user && user.isAdmin
}

export const verifyManager = async (req: Request, res: Response) => {
    const { projectid } = req.headers
    const project = await Project.findOne({ _id: projectid, 'members.user': req.certificate.id }, 'members')
    let isManager = false
    if (project) {
        const member = project.members.find(member => member.user.toString() === req.certificate.id)
        isManager = member && member.isManager
    }
    return isManager
}

export const verifyMember = async (req: Request, res: Response) => {
    const { projectid } = req.headers
    const project = await Project.findOne({ _id: projectid, 'members.user': req.certificate.id }, 'members')
    let isMember = false
    if (project) {
        isMember = true
    }
    return isMember
}