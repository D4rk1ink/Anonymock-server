import { Request, Response, preResponse } from '../utils/express.util'
import { Project } from '../models/project'
import { User } from '../models/user'
import * as verify from './verify.controller'

export const add = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || await verify.verifyManager(req, res)) {
        try {
            const { project, user } = req.body
            const findUser = await User.findById(user)
            const findProject = await Project.findById(project)
            if (findUser && findProject) {
                const member = {
                    user,
                    isManager: false
                }
                const myProject = await Project.update(project, { $push: { members: member }})
                const myUser = await User.update(member.user, { $push: { projects: project }})
                if (myUser) {
                    res.json(preResponse.data({
                        user: {
                            id: myUser.id,
                            firstname: myUser.firstname,
                            email: myUser.email
                        },
                        isManager: false
                    }))
                }
            } else {
                res.json(preResponse.error(null, 'User or project not found'))
            }
        } catch (err) {
            res.json(preResponse.error(null, 'Add fail'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const exit = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || await verify.verifyManager(req, res)) {
        try {
            const { project, user } = req.body
            const findProject = await Project.findById(project)
            const findUser = await User.findById(user)
            if (findProject && findUser) {
                await Project.update(project, { $pull: { members: { user: user } }})
                await User.update(user, { $pull: { projects: project }})
                res.json(preResponse.data('Successfully'))
            } else {
                res.json(preResponse.error(null, 'Project or user not found'))
            }
        } catch (err) {
            res.json(preResponse.error(null, 'Exit fail'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const manager = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || await verify.verifyManager(req, res)) {
        try {
            const { project, user, isManager } = req.body
            const findProject = await Project.findById(project)
            const findUser = await User.findById(user)
            if (findProject && findUser) {
                await Project.getModel().update({ _id: project, 'members.user': user }, { $set: { 'members.$.isManager': isManager } })
                const myProject = await Project.findById(project, 'members')
                if (myProject) {
                    const member = await myProject.members.find(member => member.user.toString() === user)
                    res.json(preResponse.data(member))
                }
            } else {
                res.json(preResponse.error(null, 'Project or user not found'))
            }
        } catch (err) {
            res.json(preResponse.error(null, 'Set member fail'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const searchMember = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || await verify.verifyMember(req, res)) {
        try {
            const { project, search } = req.query
            const searchText = search.toString().trim()
            const members = await User.searchProjectMembers(project, search, 'id firstname lastname email')
            res.json(preResponse.data(members))
        } catch (err) {
            res.json(preResponse.error(null, 'Search fail'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const searchUser = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || await verify.verifyManager(req, res)) {
        try {
            const { project, search } = req.query
            const searchText = search.toString().trim()
            const users = (await User.searchUser(searchText, 5, 'id firstname lastname projects'))
                .map(user => {
                    return {
                        id: user.id,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        isMember: user.projects.indexOf(project) > -1
                    }
                })
            res.json(preResponse.data(users))
        } catch (err) {
            res.json(preResponse.error(null, 'Search fail'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}