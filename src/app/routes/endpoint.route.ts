import * as express from 'express'
import * as auth from '../controllers/auth.controller'
import * as endpoint from '../controllers/endpoint.controller'

const routerIndex = express.Router()
const router = express.Router()

router.post('/endpoint', endpoint.create)
router.get('/endpoint/:id', endpoint.getById)
router.patch('/endpoint/:id', endpoint.update)
router.get('/search/endpoint', endpoint.search)
router.delete('/endpoint/:id', endpoint.deleteEndpoint)

routerIndex.use('/project', auth.verify, router)

export default routerIndex
