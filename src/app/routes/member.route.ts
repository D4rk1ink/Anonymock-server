import * as express from 'express'
import * as auth from '../controllers/auth.controller'
import * as member from '../controllers/member.controller'

const routerIndex = express.Router()
const router = express.Router()

router.post('/member/:id', member.add)
router.patch('/member/:id/exit', member.exit)
router.patch('/member/:id/manager', member.manager)
router.get('/search/user', member.searchUser)
router.get('/search/member', member.searchMember)

routerIndex.use('/project', auth.verify, router)

export default routerIndex
