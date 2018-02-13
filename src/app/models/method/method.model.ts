import { Model, Document, model, Error } from 'mongoose'
import MethodSchemaSchema from './method.schema'

interface IMethodModel extends Document {
    name: string
}

const MethodModel = model<IMethodModel>('Method', MethodSchemaSchema)

export class Method {

    static getModel () {
        return MethodModel
    }

    static async create (newMethod) {
        return new MethodModel(newMethod).save()
    }

    static async remove (id) {
        await MethodModel.findByIdAndRemove(id)
    }

    static async findById (id, fields = '') {
        return await MethodModel.findById(id, fields)
    }

    static async findOne (condition, fields = '') {
        return await  MethodModel.findOne(condition, fields)
    }

    static async findAll (condition = {}, fields = '') {
        return await MethodModel.find(condition, fields)
    }
}