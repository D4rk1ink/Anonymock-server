import { Model, Document, model, Error } from 'mongoose'
import ScraperSchema from './scraper.schema'
import { Project } from '../project'

interface IScraperModel extends Document {
    id: string
    baseAPI: string
    http: {
        headers: any,
        queryString: any
    }
    endpoints: any[]
    project: string
}

export class Scraper {

    static Model: Model<IScraperModel>

    static createModel () {
        this.Model = model<IScraperModel>('Scraper', ScraperSchema)
    }

    static getModel () {
        return this.Model
    }

    static async create (newScraper) {
        return new this.Model(newScraper).save()
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

    static findOne (condition, fields = '') {
        return this.Model.findOne(condition, fields)
    }

    static async findAll (condition = {}, fields = '') {
        return await this.Model.find(condition, fields)
    }

}