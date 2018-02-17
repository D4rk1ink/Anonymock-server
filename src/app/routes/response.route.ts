import * as express from 'express'
import * as auth from '../controllers/auth.controller'
import * as response from '../controllers/response.controller'

const routerIndex = express.Router()
const router = express.Router()

router.post('/response', response.create)
router.get('/response/:id', response.getById)
router.patch('/response/:id', response.update)
router.get('/search/response', response.search)

routerIndex.use('/project', auth.verify, router)

export default routerIndex
