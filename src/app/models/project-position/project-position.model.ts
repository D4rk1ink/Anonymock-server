import { Model, Document, model, Error } from 'mongoose'
import ProjectPositionSchema from './project-position.schema'

interface IProjectPositionModel extends Document {
    name: string
}

const PositionModel = model<IProjectPositionModel>('ProjectPosition', ProjectPositionSchema)

export class ProjectPosition {

    static getModel () {
        return PositionModel
    }

    static async create (newPosition) {
        return new PositionModel(newPosition).save()
    }

    static async remove (id) {
        await PositionModel.findByIdAndRemove(id)
    }

    static async findById (id, fields = '') {
        return await PositionModel.findById(id, fields)
    }

    static async findOne (condition, fields = '') {
        return await  PositionModel.findOne(condition, fields)
    }

    static async findAll (condition = {}, fields = '') {
        return await PositionModel.find(condition, fields)
    }
}