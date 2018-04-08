import * as express from 'express'
import * as auth from '../controllers/auth.controller'
import * as project from '../controllers/project.controller'

const routerIndex = express.Router()
const router = express.Router()

router.get('/main', project.getAll)
router.get('/main/:id', project.getById)
router.post('/main', project.create)
router.patch('/main/:id', project.update)
router.delete('/main/:id', project.deleteProject)

routerIndex.use('/project', auth.verify, router)

export default routerIndex
