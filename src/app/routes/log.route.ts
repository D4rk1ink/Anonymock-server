import * as express from 'express'
import * as auth from '../controllers/auth.controller'
import * as log from '../controllers/log.controller'

const routerIndex = express.Router()
const router = express.Router()

router.get('/search/log', log.search)

routerIndex.use('/project', auth.verify, router)

export default routerIndex
