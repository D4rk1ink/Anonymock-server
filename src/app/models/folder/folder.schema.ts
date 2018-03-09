import { Schema, Types, model } from 'mongoose'
import { encrypt } from '../../utils/encrypt.util'
import * as timestamps from 'mongoose-timestamp'

const FolderSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    endpoints: [
        {
            type: String,
            ref: 'Endpoint',
        }
    ],
    project: {
        type: String,
        ref: 'Project',
        required: true
    }  
}, {
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
)

FolderSchema.virtual('id').get(function () {
    return this._id.toString()
})

FolderSchema.plugin(timestamps)

export default FolderSchema
