import * as express from 'express'
import * as auth from '../controllers/auth.controller'
import * as scraper from '../controllers/scraper.controller'

const routerIndex = express.Router()
const router = express.Router()

router.post('/scraper/endpoint', scraper.createEndpoint)
router.post('/scraper/request', scraper.createRequest)
// router.patch('/scraper/:id', scraper.update)
// router.get('/scraper/:id', scraper.getById)
router.get('/search/scraper', scraper.search)

routerIndex.use('/project', auth.verify, router)

export default routerIndex
