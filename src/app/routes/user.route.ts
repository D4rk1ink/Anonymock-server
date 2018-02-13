import * as express from 'express'
import * as auth from '../controllers/auth.controller'
import * as user from '../controllers/user.controller'

const routerIndex = express.Router()
const router = express.Router()

router.get('/', user.getAll)
router.get('/:id', user.getById)
router.patch('/approve', user.approve)
router.patch('/admin', user.admin)
router.patch('/deactivate', user.deactivate)
routerIndex.use('/user', auth.verify, router)

export default routerIndex
