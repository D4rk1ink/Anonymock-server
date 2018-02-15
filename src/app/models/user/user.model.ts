import { Model, Document, model, Error } from 'mongoose'
import UserSchema from './user.schema'
import { Project } from '../project'

interface IUserModel extends Document {
    firstname: string
    lastname: string
    username: string
    email: string
    password?: string
    picture: string
    isAdmin: boolean
    isApproved: boolean
    deactivated: boolean
    projects: any[]
}

const UserModel = model<IUserModel>('User', UserSchema)

export class User {

    static getModel () {
        return UserModel
    }

    static async create (newUser) {
        const user = await UserModel.findOne({ username: newUser.username, email: newUser.email })
        if (user) {
            return new Error('Email is duplicate')
        } else {
            return new UserModel(newUser).save()
        }
    }

    static async update (id, update) {
        return await UserModel.findByIdAndUpdate(id, update)
    }

    static async remove (id) {
        await UserModel.findByIdAndRemove(id)
    }

    static async findById (id, fields = '') {
        return await UserModel.findById(id, fields)
    }

    static async findOne (condition) {
        return await  UserModel.findOne(condition)
    }

    static findAll (condition = {}, fields = '') {
        return UserModel.find(condition, fields)
    }

    static async searchProjectMembers (project, search, fields = '') {
        // return await UserModel.find({
        //     $and: [
        //         { projects: project},
        //         { $where: `new RegExp("${search}", "gi").test(this.firstname + " " + this.lastname)` }
        //     ]
        // }, fields)
        let members: any = []
        const myProject = (await Project.findById(project)
                .populate('members.user', fields)
                .exec())
        if (myProject) {
            members = myProject.members.filter(member => {
                return new RegExp(search, 'gi').test(member.user.firstname + ' ' + member.user.lastname)
            })
        }
        return members
    }

    static async searchUser (search, limit, fields = '') {
        return await UserModel.find({ $where: `new RegExp("${search}", "gi").test(this.firstname + " " + this.lastname)` }, fields)
            .limit(limit)
    }
}