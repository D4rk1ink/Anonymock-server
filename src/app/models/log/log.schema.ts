import { Schema, Types, model } from 'mongoose'
import * as timestamps from 'mongoose-timestamp'

const LogSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    request: {
        client: {
            type: Object,
            required: true,
            default: {}
        },
        headers: {
            type: Object,
            required: true,
            default: {}
        },
        body: {
            type: Object,
            required: true,
            default: {}
        },
        queryString: {
            type: Object,
            required: true,
            default: {}
        }
    },
    response: {
        headers: {
            type: Object,
            required: true,
            default: {}
        },
        body: {
            type: Object,
            required: true,
            default: {}
        },
        delay: {
            type: Number,
            required: true
        },
        statusCode: {
            type: Number,
            required: true
        }
    },
    project: {
        type: String,
        ref: 'Project',
        required: true
    }  
}, {
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
        minimize: false
    }
)

LogSchema.virtual('id').get(function () {
    return this._id.toString()
})

LogSchema.plugin(timestamps)

export default LogSchema
