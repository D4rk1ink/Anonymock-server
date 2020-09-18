import * as express from 'express'
import * as auth from '../controllers/auth.controller'
import * as folder from '../controllers/folder.controller'

const routerIndex = express.Router()
const router = express.Router()

router.post('/folder', folder.create)
router.patch('/folder/:id', folder.update)
router.get('/folder/:id', folder.getById)
router.get('/search/folder', folder.search)
router.delete('/folder/:id', folder.deleteFolder)

routerIndex.use('/project', auth.verify, router)

export default routerIndex
