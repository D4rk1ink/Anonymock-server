import { Model, Document, model, Error } from 'mongoose'
import FolderSchema from './folder.schema'

interface IFolderModel extends Document {
    id: string
    name: string
    endpoints: any[]
    project: string
}

const FolderModel = model<IFolderModel>('Folder', FolderSchema)

export class Folder {

    static getModel () {
        return FolderModel
    }

    static async create (newFolder) {
        return new FolderModel(newFolder).save()
    }

    static async update (id, update) {
        return await FolderModel.findByIdAndUpdate(id, update)
    }

    static async remove (id) {
        return await FolderModel.findByIdAndRemove(id)
    }

    static findById (id, fields = '') {
        return FolderModel.findById(id, fields)
    }

    static async findOne (condition) {
        return await  FolderModel.findOne(condition)
    }

    static findAll (condition = {}, fields = '') {
        return FolderModel.find(condition, fields)
    }

    static async search (project, search, page, fields = '') {
        return await Folder.findAll({ project: project, name: new RegExp(search, 'i') }, 'id name endpoints')
    }
}