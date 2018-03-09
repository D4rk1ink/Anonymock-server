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

const LogModel = model<ILogModel>('Log', LogSchema)

export class Log {

    static getModel () {
        return LogModel
    }

    static async create (newLog) {
        return new LogModel(newLog).save()
    }

    static async remove (id) {
        return await LogModel.findByIdAndRemove(id)
    }

    static async findById (id, fields = '') {
        return await LogModel.findById(id, fields)
    }

    static async findOne (condition) {
        return await  LogModel.findOne(condition)
    }

    static async findAll (condition = {}, fields = '') {
        return await LogModel.find(condition, fields)
    }

    static async search (project, search, page, fields = '') {
        return await LogModel.find({ project: project, path: new RegExp(search, 'i') }, fields)
            .populate('method')
            .skip((page - 1) * 20)
            .limit(20)
    }
}