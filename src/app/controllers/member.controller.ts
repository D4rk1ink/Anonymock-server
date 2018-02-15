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
                            firstname: myUser.firstname
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

export const searchMember = async (req: Request, res: Response) => {
    const { project, search } = req.body
    if (await verify.verifyAdmin(req, res) || await verify.verifyManager(req, res)) {
        try {
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
            const { project, search } = req.body
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