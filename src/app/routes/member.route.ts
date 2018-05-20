import * as express from 'express'
import * as auth from '../controllers/auth.controller'
import * as member from '../controllers/member.controller'
import * as verify from '../controllers/verify.controller'

const routerIndex = express.Router()
const router = express.Router()

router.post('/member/:id', verify.midLevel, member.add)
router.patch('/member/:id/exit', verify.midLevel, member.exit)
router.patch('/member/:id/manager', verify.midLevel, member.manager)
router.get('/search/user', member.searchUser)
router.get('/search/member', member.searchMember)

routerIndex.use('/project', auth.verify, verify.lowLevel, router)

export default routerIndex
