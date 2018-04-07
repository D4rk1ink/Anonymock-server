import { Schema, Types } from 'mongoose'
import { encrypt } from '../../utils/encrypt.util'
import * as timestamps from 'mongoose-timestamp'

const ScraperEndpointSchema = new Schema({
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
    requests: [
        {
            type: String,
            ref: 'ScraperRequest',
            required: true
        }
    ],
    scraper: {
        type: String,
        ref: 'Scraper',
        required: true
    }
}, {
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
        minimize: false
    }
)

ScraperEndpointSchema.virtual('id').get(function () {
    return this._id.toString()
})

ScraperEndpointSchema.plugin(timestamps)

export default ScraperEndpointSchema
