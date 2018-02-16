import { Schema, Types, model } from 'mongoose'
import { encrypt } from '../../utils/encrypt.util'
import * as timestamps from 'mongoose-timestamp'

const ResponseSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    environment: {
        type: String,
        required: true
    },
    condition: {
        params: {
            type: Object,
            default: {}
        },
        headers: {
            type: Object,
            default: {}
        },
        body: {
            type: Object,
            default: {}
        },
        queryString: {
            type: Object,
            default: {}
        }
    },
    response: {
        headers: {
            type: Object,
            default: {}
        },
        body: {
            type: Object,
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
    endpoint: {
        type: String,
        ref: 'Endpoint',
        required: true
    }  
}, {
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
)

ResponseSchema.virtual('id').get(function () {
    return this._id.toString()
})

ResponseSchema.plugin(timestamps)

export default ResponseSchema
