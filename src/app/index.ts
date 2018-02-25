import * as path from 'path'
import * as cors from 'cors'
import * as express from 'express'
import * as mongoose from 'mongoose'
import * as bodyParser from 'body-parser'
import * as routes from './routes'
import * as constants from './constants'
import * as initDB from './utils/init-db.util'
import * as encrypt from './utils/encrypt.util'

export class Server {
    public app: express.Application

    constructor () {
        this.app = express()
    }

    public static bootstrap () {
        new Server().start()
    }

    public config () {
        this.app.use(cors())
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({ extended: true }))
        this.app.use(express.static(path.join(__dirname, 'dist')))
    }

    public mongodb () {
        (<any>mongoose).Promise = Promise
        const connection = mongoose.connect(constants.DB_URL, (err) => {
            if (err) {
                console.log('Failed to connect to database')
            } else {
                console.log('Connect to database')
                initDB.createUsers()
                initDB.createMethods()
            }
        })
    }

    public routes () {
        this.app.use('/api', [
            routes.auth,
            routes.user,
            routes.project,
            routes.member,
            routes.method,
            routes.database,
            routes.folder,
            routes.endpoint,
            routes.response,
            routes.log,
            routes.position,
            routes.api,
        ])
    }

    public start () {
        this.mongodb()
        this.config()
        this.routes()
        this.app.listen(constants.PORT, () => {
            console.log('START SERVER')
        })
    }
}
