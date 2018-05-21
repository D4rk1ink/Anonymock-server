import { Model, Document, model, Error } from 'mongoose'
import LogSchema from './log.schema'

interface ILogModel extends Document {
    id: string
    path: string
    method: any
    request: {
        client: any,
        headers: any,
        body: any,
        queryString: any
    }
    response: {
        headers: any,
        body: any,
        delay: number,
        statusCode: number
    }
    project: string
    createdAt: string
}

export class Log {

    static Model: Model<ILogModel>

    static createModel () {
        this.Model = model<ILogModel>('Log', LogSchema)
    }

    static getModel () {
        return this.Model
    }

    static async create (newLog) {
        return new this.Model(newLog).save()
    }

    static async remove (id) {
        return await this.Model.findByIdAndRemove(id)
    }

    static async findById (id, fields = '') {
        return await this.Model.findById(id, fields)
    }

    static async findOne (condition) {
        return await  this.Model.findOne(condition)
    }

    static async findAll (condition = {}, fields = '') {
        return await this.Model.find(condition, fields)
    }

    static search (project, search, fields = '') {
        return this.Model.find({ project: project, path: new RegExp(search, 'i') }, fields)
            .populate('method')
    }
}