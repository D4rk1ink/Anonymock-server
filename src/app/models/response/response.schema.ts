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
        required: true,
        enum: ['dev', 'test']
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    condition: {
        params: {
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
    endpoint: {
        type: String,
        ref: 'Endpoint',
        required: true
    }  
}, {
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
        minimize: false
    }
)

ResponseSchema.virtual('id').get(function () {
    return this._id.toString()
})

ResponseSchema.plugin(timestamps)

export default ResponseSchema
