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

export class Endpoint {

    static Model: Model<IEndpointModel>

    static createModel () {
        try {
            this.Model = model<IEndpointModel>('Endpoint', EndpointSchema)
        } catch (err) {
            this.Model = model<IEndpointModel>('Endpoint')
        }
    }

    static getModel () {
        return this.Model
    }

    static async create (newEndpoint) {
        return new this.Model(newEndpoint).save()
    }

    static async update (id, update) {
        return await this.Model.findByIdAndUpdate(id, update)
    }

    static async remove (id) {
        return await this.Model.findByIdAndRemove(id)
    }

    static async findById (id, fields = '') {
        return await this.Model.findById(id, fields)
            .populate('method', 'id name')
            .populate('folder', 'id name')
    }

    static findByRoute (path, method, project, except = '') {
        const paramPattern = /{{\s*([A-Za-z0-9]+)\s*}}/g
        path = path.trim()
        if (path.substring(0, 1) !== '/') {
            path = '/' + path
        }
        return this.Model.findOne({ project: project, method: method, _id: { $ne: except },
            $where: `new RegExp("^"+this.path.replace(${paramPattern}, '([A-Za-z0-9]+|[^\/]+)')+"$").test("${path}")`
        })
    }

    static async findOne (condition) {
        return await this.Model.findOne(condition)
            .populate('method', 'id name')
            .populate('folder', 'id name')
    }

    static async findAll (condition = {}, fields = '') {
        return await this.Model.find(condition, fields)
            .populate('method', 'id name')
            .populate('folder', 'id name')
    }

    static search (folders, search, page, fields = '') {
        return this.Model.find({
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