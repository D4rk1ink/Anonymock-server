import * as dotenv from 'dotenv'
import * as process from 'process'

process.env.NODE_ENV = process.env.NODE_ENV || 'dev'

if (process.env.NODE_ENV === 'dev') {
    dotenv.config({ path: '.env' })
} else if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: '.test.env' })
}

export const PORT: any = process.env.PORT
export const SECRET_KEY: any = process.env.SECRET_KEY
export const SECRET_JWT: any = process.env.SECRET_JWT
export const DB_URL: any = process.env.DB_URL
export const INIT_USERNAME: any = process.env.INIT_USERNAME
export const INIT_EMAIL: any = process.env.INIT_EMAIL
export const INIT_PASSWORD: any = process.env.INIT_PASSWORD
export const DEFAULT_PROFILE_PICTURE: any = process.env.DEFAULT_PROFILE_PICTURE