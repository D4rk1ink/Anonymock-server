import { Schema, Types } from 'mongoose'
import { encrypt } from '../../utils/encrypt.util'
import * as timestamps from 'mongoose-timestamp'

const ProjectPositionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
})

ProjectPositionSchema.plugin(timestamps)

export default ProjectPositionSchema
