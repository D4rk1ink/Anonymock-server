import { Model, Document, model, Error } from 'mongoose'
import MethodSchema from './method.schema'

interface IMethodModel extends Document {
    name: string
}

export class Method {

    static Model: Model<IMethodModel>

    static createModel () {
        this.Model = model<IMethodModel>('Method', MethodSchema)
    }

    static getModel () {
        return this.Model
    }

    static async create (newMethod) {
        return new this.Model(newMethod).save()
    }

    static async remove (id) {
        await this.Model.findByIdAndRemove(id)
    }

    static async findById (id, fields = '') {
        return await this.Model.findById(id, fields)
    }

    static async findOne (condition, fields = '') {
        return await  this.Model.findOne(condition, fields)
    }

    static async findAll (condition = {}, fields = '') {
        return await this.Model.find(condition, fields)
    }

    static async search (search, fields = '') {
        return await this.Model.find({ name: new RegExp(search, 'i') }, fields)
    }
}