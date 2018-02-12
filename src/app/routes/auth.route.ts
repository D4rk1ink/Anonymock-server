import * as express from 'express'
import * as auth from '../controllers/auth.controller'

const routerIndex = express.Router()
const router = express.Router()

router.post('/signin', auth.signin)
router.post('/signup', auth.signup)
routerIndex.use('/auth', router)

export default routerIndex
