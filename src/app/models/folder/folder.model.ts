import { Model, Document, model, Error } from 'mongoose'
import FolderSchema from './folder.schema'

interface IFolderModel extends Document {
    id: string
    name: string
    endpoints: any[]
    project: string
}

export class Folder {

    static Model: Model<IFolderModel>

    static createModel () {
        try {
            this.Model = model<IFolderModel>('Folder', FolderSchema)
        } catch (err) {
            this.Model = model<IFolderModel>('Folder')
        }
    }

    static getModel () {
        return this.Model
    }

    static async create (newFolder) {
        return new this.Model(newFolder).save()
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

    static async findOne (condition) {
        return await  this.Model.findOne(condition)
    }

    static async findAll (condition = {}, fields = '') {
        return await this.Model.find(condition, fields)
    }

    static search (project, search, page, fields = '') {
        return this.Model.find({ project: project, name: new RegExp(search, 'i') }, fields)
    }
}