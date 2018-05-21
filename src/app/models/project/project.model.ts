import { Model, Document, model, Error } from 'mongoose'
import ProjectSchema from './project.schema'

interface IProjectModel extends Document {
    id: string
    name: string
    status: string
    description: string
    repository: string
    environments: string
    folders: any[]
    database: any
    members: any[]
}

export class Project {

    static Model: Model<IProjectModel>

    static createModel () {
        this.Model = model<IProjectModel>('Project', ProjectSchema)
    }

    static getModel () {
        return this.Model
    }

    static async create (newProject) {
        return new this.Model(newProject).save()
    }

    static async update (id, update) {
        return await this.Model.findByIdAndUpdate(id, update)
    }

    static async remove (id) {
        return await this.Model.findByIdAndRemove(id)
    }

    static async findById (id, fields = '') {
        return await this.Model.findById(id, fields)
    }

    static async findOne (condition, fields = '') {
        return await  this.Model.findOne(condition, fields)
    }

    static async findAll (condition = {}, fields = '') {
        return await this.Model.find(condition, fields)
    }
}