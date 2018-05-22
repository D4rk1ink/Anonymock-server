import * as mongoose from 'mongoose'
import * as dotenv from 'dotenv'
import * as process from 'process'

process.env.NODE_ENV = 'test'

if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: '.env.test' })
}

const DB_URL: any = process.env.DB_URL

export const dropDatabase = () => {
    (<any>mongoose.Promise) = Promise
    const connection = mongoose.createConnection(DB_URL)
    connection.dropDatabase()
}