import { Model, Document, model, Error } from 'mongoose'
import EndpointSchema from './endpoint.schema'
import { Project } from '../project'

interface IEndpointModel extends Document {
    id: string
    name: string
    method: any
    path: string
}

const EndpointModel = model<IEndpointModel>('Endpoint', EndpointSchema)

export class Endpoint {

    static getModel () {
        return EndpointModel
    }

    static async create (newEndpoint) {
        return new EndpointModel(newEndpoint).save()
    }

    static async update (id, update) {
        return await EndpointModel.findByIdAndUpdate(id, update)
    }

    static async remove (id) {
        return await EndpointModel.findByIdAndRemove(id)
    }

    static async findById (id, fields = '') {
        return await EndpointModel.findById(id, fields)
            .populate('method', 'id name')
    }

    static async findOne (condition) {
        return await EndpointModel.findOne(condition)
            .populate('method', 'id name')
    }

    static async findAll (condition = {}, fields = '') {
        return await EndpointModel.find(condition, fields)
            .populate('method', 'id name')
    }

    static async search (project, folder, search, page, fields = '') {
        let folders: any[] = [folder]
        const myProject = await Project.findById(project, 'folders')
        if (myProject) {
            folders = myProject.folders
        }
        return await EndpointModel.find({
            $and: [{
                $or: [
                    { folder: folder },
                    { folder: { $in: folders } }]
            }, { $or: [
                { name: new RegExp(search, 'gi') },
                { path: new RegExp(search, 'gi') }
            ] }]
        }, fields)
            .populate('method', 'id name')
    }
}