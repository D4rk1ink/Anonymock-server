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
            required: true,
        },
        headers: {
            type: Object,
            required: true
        },
        body: {
            type: Object,
            required: true
        },
        queryString: {
            type: Object,
            required: true
        }
    },
    response: {
        headers: {
            type: Object,
            required: true
        },
        body: {
            type: Object,
            required: true
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
