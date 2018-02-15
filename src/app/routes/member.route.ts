import * as express from 'express'
import * as auth from '../controllers/auth.controller'
import * as member from '../controllers/member.controller'

const routerIndex = express.Router()
const router = express.Router()

router.post('/member', member.add)
router.post('/search/user', member.searchUser)
router.post('/search/member', member.searchMember)

routerIndex.use('/project', auth.verify, router)

export default routerIndex
