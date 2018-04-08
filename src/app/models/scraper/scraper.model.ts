import { Model, Document, model, Error } from 'mongoose'
import ScraperSchema from './scraper.schema'
import { Project } from '../project'

interface IScraperModel extends Document {
    id: string
    baseAPI: string
    endpoints: any[]
    project: string
}

const ScraperModel = model<IScraperModel>('Scraper', ScraperSchema)

export class Scraper {

    static getModel () {
        return ScraperModel
    }

    static async create (newScraper) {
        return new ScraperModel(newScraper).save()
    }

    static async update (id, update) {
        return await ScraperModel.findByIdAndUpdate(id, update)
    }

    static async remove (id) {
        return await ScraperModel.findByIdAndRemove(id)
    }

    static async findById (id, fields = '') {
        return await ScraperModel.findById(id, fields)
    }

    static async findOne (condition, fields = '') {
        return await ScraperModel.findOne(condition, fields)
    }

    static async findAll (condition = {}, fields = '') {
        return await ScraperModel.find(condition, fields)
    }

}