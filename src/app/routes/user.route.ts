import * as express from 'express'
import * as auth from '../controllers/auth.controller'
import * as user from '../controllers/user.controller'
import * as verify from '../controllers/verify.controller'

const routerIndex = express.Router()
const router = express.Router()

router.get('/', user.search)
router.get('/:id', user.getById)
router.get('/:id/picture', user.picture)
router.patch('/:id', verify.mySelf, user.update)
router.patch('/:id/picture', verify.mySelf, user.uploadPicture)
router.patch('/:id/approve', verify.notMySelf, verify.highLevel, user.approve)
router.patch('/:id/admin', verify.notMySelf, verify.highLevel, user.admin)
router.patch('/:id/deactivate', verify.notMySelf, verify.highLevel, user.deactivate)
router.patch('/:id/change-password', verify.mySelf, user.changePassword)
routerIndex.use('/user', auth.verify, router)

export default routerIndex
