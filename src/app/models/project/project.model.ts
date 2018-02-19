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

const ProjectModel = model<IProjectModel>('Project', ProjectSchema)

export class Project {

    static getModel () {
        return ProjectModel
    }

    static async create (newProject) {
        return new ProjectModel(newProject).save()
    }

    static async update (id, update) {
        return await ProjectModel.findByIdAndUpdate(id, update)
    }

    static async remove (id) {
        return await ProjectModel.findByIdAndRemove(id)
    }

    static async findById (id, fields = '') {
        return await ProjectModel.findById(id, fields)
    }

    static async findOne (condition, fields = '') {
        return await  ProjectModel.findOne(condition, fields)
    }

    static async findAll (condition = {}, fields = '') {
        return await ProjectModel.find(condition, fields)
    }
}