import { Schema, Types, model } from 'mongoose'
import { encrypt } from '../../utils/encrypt.util'
import * as timestamps from 'mongoose-timestamp'

const EndpointSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    method: {
        type: Schema.Types.ObjectId,
        ref: 'Method',
        required: true
    },
    path: {
        type: String,
        required: true,
        unique: true
    },
    folder: {
        type: String,
        ref: 'Folder',
        required: true
    },
    project: {
        type: String,
        ref: 'Project',
        required: true
    },
    responses: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Response',
        }
    ]
}, {
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
)

EndpointSchema.virtual('id').get(function () {
    return this._id.toString()
})

EndpointSchema.plugin(timestamps)

export default EndpointSchema
