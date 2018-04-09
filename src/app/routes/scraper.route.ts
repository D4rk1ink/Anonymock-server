import * as express from 'express'
import * as auth from '../controllers/auth.controller'
import * as scraper from '../controllers/scraper.controller'

const routerIndex = express.Router()
const router = express.Router()

router.get('/scraper', scraper.getScraper)
router.get('/search/scraper', scraper.search)
router.patch('/scraper', scraper.updateScraper)
router.post('/scraper/endpoint', scraper.createEndpoint)
router.patch('/scraper/endpoint/:id', scraper.updateEndpoint)
router.post('/scraper/request', scraper.createRequest)
router.patch('/scraper/request/:id/default', scraper.setDefault)
router.delete('/scraper/request/:id', scraper.deleteRequest)
router.delete('/scraper/endpoint/:id', scraper.deleteEndpoint)

routerIndex.use('/project', auth.verify, router)

export default routerIndex
