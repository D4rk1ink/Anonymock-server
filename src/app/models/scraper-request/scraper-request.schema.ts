import { Schema, Types, model } from 'mongoose'
import { encrypt } from '../../utils/encrypt.util'
import * as timestamps from 'mongoose-timestamp'

const ScraperRequestSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
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
    request: {
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
    endpoint: {
        type: String,
        ref: 'ScraperEndpoint',
        required: true
    }  
}, {
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
        minimize: false
    }
)

ScraperRequestSchema.virtual('id').get(function () {
    return this._id.toString()
})

ScraperRequestSchema.plugin(timestamps)

export default ScraperRequestSchema
