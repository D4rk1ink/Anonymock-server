import { Model, Document, model, Error } from 'mongoose'
import ProjectSchema from './project.schema'

interface IProjectModel extends Document {
    id: string
    name: string
    status: string
    description: string
    repository: string
    environments: string
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

    static findById (id, fields = '') {
        return ProjectModel.findById(id, fields)
    }

    static async findOne (condition) {
        return await  ProjectModel.findOne(condition)
    }

    static findAll (condition = {}, fields = '') {
        return ProjectModel.find(condition, fields)
    }
}