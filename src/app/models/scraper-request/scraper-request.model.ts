import { Model, Document, model, Error } from 'mongoose'
import ScraperRequestSchema from './scraper-request.schema'
import { Project } from '../project'

interface IScraperRequestModel extends Document {
    id: string
    name: string
    environment: string
    isDefault: boolean
    request: {
        params: any,
        headers: any,
        body: any,
        queryString: any
    }
    endpoint: string
}

export class ScraperRequest {

    static Model: Model<IScraperRequestModel>

    static createModel () {
        this.Model = model<IScraperRequestModel>('ScraperRequest', ScraperRequestSchema)
    }

    static getModel () {
        return this.Model
    }

    static async create (newRequest) {
        return new this.Model(newRequest).save()
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

}