import * as express from 'express'
import * as auth from '../controllers/auth.controller'
import * as scraper from '../controllers/scraper.controller'
import * as verify from '../controllers/verify.controller'

const routerIndex = express.Router()
const router = express.Router()

router.get('/scraper', scraper.getScraper)
router.post('/scraper', scraper.scrap)
router.patch('/scraper', scraper.updateScraper)
router.get('/search/scraper', scraper.search)
router.post('/scraper/endpoint', scraper.createEndpoint)
router.patch('/scraper/endpoint/:id', scraper.updateEndpoint)
router.post('/scraper/request', scraper.createRequest)
router.patch('/scraper/request/:id/default', scraper.setDefault)
router.delete('/scraper/request/:id', scraper.deleteRequest)
router.delete('/scraper/endpoint/:id', scraper.deleteEndpoint)

routerIndex.use('/project', auth.verify, verify.lowLevel, router)

export default routerIndex
