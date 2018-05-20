import { Request, Response, preResponse } from '../utils/express.util'
import { Project } from '../models/project'
import { User } from '../models/user'
import * as verify from './verify.controller'

export const add = async (req: Request, res: Response) => {
    try {
        const { projectid } = req.headers
        const id = req.params.id
        const findUser = await User.findById(id)
        const findProject = await Project.findById(projectid)
        if (findUser && findProject && findUser.isApproved) {
            const member = {
                user: id,
                isManager: false
            }
            const myProject = await Project.update(projectid, { $push: { members: member }})
            const myUser = await User.update(member.user, { $push: { projects: projectid }})
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
}

export const exit = async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const { projectid } = req.headers
        const findProject = await Project.findById(projectid)
        const findUser = await User.findById(id)
        if (findProject && findUser) {
            await Project.update(projectid, { $pull: { members: { user: id } }})
            await User.update(id, { $pull: { projects: projectid }})
            res.json(preResponse.data('Successfully'))
        } else {
            res.json(preResponse.error(null, 'Project or user not found'))
        }
    } catch (err) {
        res.json(preResponse.error(null, 'Exit fail'))
    }
}

export const manager = async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const { projectid } = req.headers
        const { isManager } = req.body
        const findProject = await Project.findById(projectid)
        const findUser = await User.findById(id)
        if (findProject && findUser) {
            await Project.getModel().update({ _id: projectid, 'members.user': id }, { $set: { 'members.$.isManager': isManager } })
            const myProject = await Project.findById(projectid, 'members')
            if (myProject) {
                const member = await myProject.members.find(member => member.user.toString() === id)
                res.json(preResponse.data(member))
            }
        } else {
            res.json(preResponse.error(null, 'Project or user not found'))
        }
    } catch (err) {
        res.json(preResponse.error(null, 'Set member fail'))
    }
}

export const searchMember = async (req: Request, res: Response) => {
    try {
        const { projectid } = req.headers
        const { search } = req.query
        const searchText = search.toString().trim()
        const members = await User.searchProjectMembers(projectid, search, 'id firstname lastname email')
        res.json(preResponse.data(members))
    } catch (err) {
        res.json(preResponse.error(null, 'Search fail'))
    }
}

export const searchUser = async (req: Request, res: Response) => {
    try {
        const { projectid } = req.headers
        const { search } = req.query
        const searchText = search.toString().trim()
        const users = (await User.searchUser(searchText, 5, 'id firstname lastname projects isApproved'))
            .filter(user => user.isApproved)
            .map(user => {
                return {
                    id: user.id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    isMember: user.projects.indexOf(projectid) > -1
                }
            })
        res.json(preResponse.data(users))
    } catch (err) {
        res.json(preResponse.error(null, 'Search fail'))
    }
}