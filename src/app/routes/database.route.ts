import * as express from 'express'
import * as auth from '../controllers/auth.controller'
import * as database from '../controllers/database.controller'
import * as verify from '../controllers/verify.controller'

const routerIndex = express.Router()
const router = express.Router()

router.post('/database', database.get)
router.post('/database/generate', database.generate)
router.post('/database/import', database.importDB)

routerIndex.use('/project', auth.verify, verify.lowLevel, router)

export default routerIndex
