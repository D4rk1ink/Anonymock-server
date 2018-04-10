import { Schema, Types, model } from 'mongoose'
import { encrypt } from '../../utils/encrypt.util'
import * as timestamps from 'mongoose-timestamp'

const UserSchema = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        set: encrypt,
        required: true
    },
    picture: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    deactivated: {
        type: Boolean,
        default: false
    },
    projects: [
        {
            type: String,
            ref: 'Project'
        }
    ]
}, {
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true
        } 
    }
)

UserSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

UserSchema.plugin(timestamps)

export default UserSchema
