import mongoose from 'mongoose'
import * as dotenv from 'dotenv'
import * as process from 'process'

process.env.NODE_ENV = 'test'

if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: '.test.env' })
}

export const dropDatabase = () => {
    mongoose.Promise = Promise
    const connection = mongoose.connect(process.env.DB_URL, (err) => {
        if (err) return
        mongoose.connection.db.dropDatabase()
    })
}