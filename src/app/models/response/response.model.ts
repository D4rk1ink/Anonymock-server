import { Model, Document, model, Error } from 'mongoose'
import ResponseSchema from './response.schema'
import { Project } from '../project'

interface IResponseModel extends Document {
    id: string
    name: string
    environment: string
    isDefault: boolean
    condition: {
        params: any,
        headers: any,
        body: any,
        queryString: any
    }
    response: {
        headers: any,
        body: any,
        delay: number,
        statusCode: number,
        isFindOne: boolean
    }
    endpoint: string
}

export class Response {

    static Model: Model<IResponseModel>

    static createModel () {
        try {
            this.Model = model<IResponseModel>('Response', ResponseSchema)
        } catch (err) {
            this.Model = model<IResponseModel>('Response')
        }
    }

    static getModel () {
        return this.Model
    }

    static async create (newResponse) {
        return new this.Model(newResponse).save()
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

    static async findOne (condition) {
        return await this.Model.findOne(condition)
    }

    static async findAll (condition = {}, fields = '') {
        return await this.Model.find(condition, fields)
    }

    static async search (endpoint, search, environment, fields = '') {
        return await this.Model.find({ endpoint: endpoint, environment: environment, name: new RegExp(search, 'gi') }, fields)
            .sort({'updatedAt': 'desc'})
    }
}