import { Model, Document, model, Error } from 'mongoose'
import EndpointSchema from './endpoint.schema'
import { Project } from '../project'

interface IEndpointModel extends Document {
    id: string
    name: string
    method: any
    folder: any
    project: any
    path: string
    responses: any[]
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
            .populate('folder', 'id name')
    }

    static findByRoute (path, method, project, except = '') {
        const paramPattern = /{{\s*([A-Za-z0-9]+)\s*}}/g
        path = path.trim()
        if (path.substring(0, 1) !== '/') {
            path = '/' + path
        }
        return EndpointModel.findOne({ project: project, method: method, _id: { $ne: except },
            $where: `new RegExp("^"+this.path.replace(${paramPattern}, '([A-Za-z0-9]+|[^\/]+)')+"$").test("${path}")`
        })
    }

    static async findOne (condition) {
        return await EndpointModel.findOne(condition)
            .populate('method', 'id name')
            .populate('folder', 'id name')
    }

    static async findAll (condition = {}, fields = '') {
        return await EndpointModel.find(condition, fields)
            .populate('method', 'id name')
            .populate('folder', 'id name')
    }

    static search (folders, search, page, fields = '') {
        return EndpointModel.find({
            $and: [{
                folder: { $in: folders }
            }, { $or: [
                { name: new RegExp(search, 'gi') },
                { path: new RegExp(search, 'gi') }
            ] }]
        }, fields)
            .populate('method', 'id name')
            .populate('folder', 'id name')
    }
}