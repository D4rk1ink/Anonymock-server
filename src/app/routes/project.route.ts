import * as express from 'express'
import * as auth from '../controllers/auth.controller'
import * as project from '../controllers/project.controller'
import * as verify from '../controllers/verify.controller'

const routerIndex = express.Router()
const router = express.Router()

router.get('/main', project.getAll)
router.get('/main/:id', project.getById)
router.post('/main', verify.highLevel, project.create)
router.patch('/main/:id', verify.lowLevel, project.update)
router.delete('/main/:id', verify.midLevel, project.deleteProject)

routerIndex.use('/project', auth.verify, router)

export default routerIndex
