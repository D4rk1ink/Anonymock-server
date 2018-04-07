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

const ScraperRequestModel = model<IScraperRequestModel>('ScraperRequest', ScraperRequestSchema)

export class ScraperRequest {

    static getModel () {
        return ScraperRequestModel
    }

    static async create (newRequest) {
        return new ScraperRequestModel(newRequest).save()
    }

    static async update (id, update) {
        return await ScraperRequestModel.findByIdAndUpdate(id, update)
    }

    static async remove (id) {
        return await ScraperRequestModel.findByIdAndRemove(id)
    }

    static async findById (id, fields = '') {
        return await ScraperRequestModel.findById(id, fields)
    }

    static async findOne (condition) {
        return await ScraperRequestModel.findOne(condition)
    }

    static async findAll (condition = {}, fields = '') {
        return await ScraperRequestModel.find(condition, fields)
    }

}