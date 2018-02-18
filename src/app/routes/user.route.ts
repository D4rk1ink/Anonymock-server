import * as express from 'express'
import * as auth from '../controllers/auth.controller'
import * as user from '../controllers/user.controller'

const routerIndex = express.Router()
const router = express.Router()

router.get('/', user.search)
router.get('/:id', user.getById)
router.patch('/:id/approve', user.approve)
router.patch('/:id/admin', user.admin)
router.patch('/:id/deactivate', user.deactivate)
routerIndex.use('/user', auth.verify, router)

export default routerIndex
