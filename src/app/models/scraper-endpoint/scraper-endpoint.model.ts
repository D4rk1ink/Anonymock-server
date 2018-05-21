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

export class ScraperEndpoint {

    static Model: Model<IScraperEndpointModel>

    static createModel () {
        try {
            this.Model = model<IScraperEndpointModel>('ScraperEndpoint', ScraperEndpointSchema)
        } catch (err) {
            this.Model = model<IScraperEndpointModel>('ScraperEndpoint')
        }
    }

    static getModel () {
        return this.Model
    }

    static async create (newScraperEndpoint) {
        return new this.Model(newScraperEndpoint).save()
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
    }

    static async findOne (condition) {
        return await this.Model.findOne(condition)
            .populate('method', 'id name')
    }

    static async findAll (condition = {}, fields = '') {
        return await this.Model.find(condition, fields)
            .populate('method', 'id name')
    }

    static search (scraper, search, page, fields = '') {
        return this.Model.find({
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