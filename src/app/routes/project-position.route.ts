import * as express from 'express'
import * as auth from '../controllers/auth.controller'
import * as projectPosition from '../controllers/project-position.controller'

const routerIndex = express.Router()
const router = express.Router()

router.get('/', projectPosition.get)
routerIndex.use('/project-position', auth.verify, router)

export default routerIndex
