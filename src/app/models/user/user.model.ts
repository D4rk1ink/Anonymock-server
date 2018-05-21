import { Model, Document, model, Error } from 'mongoose'
import UserSchema from './user.schema'
import { Project } from '../project'
import * as constants from '../../constants'

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

export class User {

    static Model: Model<IUserModel>

    static createModel () {
        try {
            this.Model = model<IUserModel>('User', UserSchema)
        } catch (err) {
            this.Model = model<IUserModel>('User')
        }
    }

    static getModel () {
        return this.Model
    }

    static async create (newUser) {
        const data = {
            firstname: newUser.firstname,
            lastname: newUser.lastname,
            username: newUser.username,
            email: newUser.email,
            password: newUser.password,
            picture: constants.DEFAULT_PROFILE_PICTURE,
        }
        try {
            return new this.Model(data).save()
        } catch (err) {
            return new Error('Email or username is duplicate')
        }
    }

    static async update (id, update) {
        return await this.Model.findByIdAndUpdate(id, update)
    }

    static async remove (id) {
        await this.Model.findByIdAndRemove(id)
    }

    static async findById (id, fields = '') {
        return await this.Model.findById(id, fields)
    }

    static async findOne (condition) {
        return await  this.Model.findOne(condition)
    }

    static findAll (condition = {}, fields = '') {
        return this.Model.find(condition, fields)
    }

    static async searchProjectMembers (project, search, fields = '') {
        // return await this.Model.find({
        //     $and: [
        //         { projects: project},
        //         { $where: `new RegExp("${search}", "gi").test(this.firstname + " " + this.lastname)` }
        //     ]
        // }, fields)
        let members: any = []
        const myProject = await Project.getModel().findById(project)
                .populate('members.user', fields)
        if (myProject) {
            members = myProject.members.filter(member => {
                return new RegExp(search, 'gi').test(member.user.firstname + ' ' + member.user.lastname)
            })
        }
        return members
    }

    static async searchUser (search, limit, fields = '') {
        return await this.Model.find({ $where: `new RegExp("${search}", "gi").test(this.firstname + " " + this.lastname)` }, fields)
            .limit(limit)
    }
}