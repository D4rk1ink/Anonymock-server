import { Schema, Types } from 'mongoose'
import { encrypt } from '../../utils/encrypt.util'
import * as timestamps from 'mongoose-timestamp'

const ProjectSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    description: {
        type: String,
        default: ''
    },
    repository: {
        type: String,
        default: ''
    },
    environments: {
        type: Object,
        default: {}
    },
    folders: [
        {
            type: String,
            ref: 'Folder'
        }
    ],
    database: {
        data: {
            type: Object,
            default: []
        },
        schema: {
            type: Object,
            default: {}
        },
        generate: {
            type: Object,
            default: {}
        }
    },
    members: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
            isManager: {
                type: Boolean,
            }
        }
    ]
}, {
        toObject: { virtuals: true },
        toJSON: { virtuals: true },
        minimize: false
    }
)

ProjectSchema.virtual('id').get(function () {
    return this._id.toString()
})

ProjectSchema.plugin(timestamps)

export default ProjectSchema
