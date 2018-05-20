import * as express from 'express'
import * as auth from '../controllers/auth.controller'
import * as log from '../controllers/log.controller'
import * as verify from '../controllers/verify.controller'

const routerIndex = express.Router()
const router = express.Router()

router.get('/search/log', log.search)
router.delete('/log', log.clear)

routerIndex.use('/project', auth.verify, verify.lowLevel, router)

export default routerIndex
