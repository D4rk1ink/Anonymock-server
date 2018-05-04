import { Schema, Types, model } from 'mongoose'
import { encrypt } from '../../utils/encrypt.util'
import * as timestamps from 'mongoose-timestamp'

const ScraperSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    baseAPI: {
        type: String,
        default: ''
    },
    http: {
        headers: {
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
    endpoints: [
        {
            type: String,
            ref: 'ScraperEndpoint',
        }
    ],
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

ScraperSchema.virtual('id').get(function () {
    return this._id.toString()
})

ScraperSchema.plugin(timestamps)

export default ScraperSchema
