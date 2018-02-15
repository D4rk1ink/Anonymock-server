import * as express from 'express'
import * as auth from '../controllers/auth.controller'
import * as method from '../controllers/method.controller'

const routerIndex = express.Router()
const router = express.Router()

router.get('/method/:id', method.getById)
router.get('/search/method', method.search)

routerIndex.use('/project', auth.verify, router)

export default routerIndex
