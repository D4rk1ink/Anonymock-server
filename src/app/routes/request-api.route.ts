import * as express from 'express'
import * as api from '../controllers/request-api.controller'

const routerIndex = express.Router()
const router = express.Router()

router.all('/:id/:environment(dev|test)/:path(*)', api.request)
routerIndex.use('/e', router)

export default routerIndex
