import { Schema, Types } from 'mongoose'
import { encrypt } from '../../utils/encrypt.util'
import * as timestamps from 'mongoose-timestamp'

const MethodSchema = new Schema({
    name: {
        type: String,
        required: true
    },
})

MethodSchema.plugin(timestamps)

export default MethodSchema
