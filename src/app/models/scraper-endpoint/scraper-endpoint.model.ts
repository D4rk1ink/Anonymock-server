import { Model, Document, model, Error } from 'mongoose'
import ScraperEndpointSchema from './scraper-endpoint.schema'
import { Project } from '../project'

interface IScraperEndpointModel extends Document {
    id: string
    name: string
    method: any
    folder: any
    path: string
    requests: any[],
    scraper: string
}

const ScraperEndpointModel = model<IScraperEndpointModel>('ScraperEndpoint', ScraperEndpointSchema)

export class ScraperEndpoint {

    static getModel () {
        return ScraperEndpointModel
    }

    static async create (newScraperEndpoint) {
        return new ScraperEndpointModel(newScraperEndpoint).save()
    }

    static async update (id, update) {
        return await ScraperEndpointModel.findByIdAndUpdate(id, update)
    }

    static async remove (id) {
        return await ScraperEndpointModel.findByIdAndRemove(id)
    }

    static async findById (id, fields = '') {
        return await ScraperEndpointModel.findById(id, fields)
            .populate('method', 'id name')
    }

    static async findOne (condition) {
        return await ScraperEndpointModel.findOne(condition)
            .populate('method', 'id name')
    }

    static async findAll (condition = {}, fields = '') {
        return await ScraperEndpointModel.find(condition, fields)
            .populate('method', 'id name')
    }

    static search (scraper, search, page, fields = '') {
        return ScraperEndpointModel.find({
            $and: [{
                scraper: scraper
            }, { $or: [
                { name: new RegExp(search, 'gi') },
                { path: new RegExp(search, 'gi') }
            ] }]
        }, fields)
            .populate('method', 'id name')
            .populate('folder', 'id name')
            .populate('requests')
    }
}