import { Request, Response, preResponse } from '../utils/express.util'
import { Folder } from '../models/folder'
import { Project } from '../models/project'
import { Scraper } from '../models/scraper'
import { Endpoint } from '../models/endpoint'
import { Response as ResponseModel } from '../models/response'
import { Method } from '../models/method'
import { ScraperEndpoint } from '../models/scraper-endpoint'
import { ScraperRequest } from '../models/scraper-request'
import * as HttpRequest from 'request'
import * as encrypt from '../utils/encrypt.util'
import * as map from '../utils/map.util'
import * as verify from './verify.controller'

export const getScraper = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || await verify.verifyMember(req, res)) {
        try {
            const { projectid } = req.headers
            const myScraper = await Scraper.findOne({ project: projectid }, 'id baseAPI http')
            if (myScraper) {
                res.json(preResponse.data(myScraper))
            } else {
                res.json(preResponse.error(null, 'Scraper not found'))
            }
        } catch (err) { }
    }
}

export const updateScraper = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || await verify.verifyMember(req, res)) {
        const { projectid } = req.headers
        const { baseAPI, http } = req.body
        await Scraper.getModel().updateOne({ project: projectid }, { baseAPI: baseAPI, http: http })
        const scraper = await Scraper.findOne({ project: projectid }, 'id baseAPI')
        res.json(preResponse.data(scraper))
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const createEndpoint = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || await verify.verifyMember(req, res)) {
        try {
            const { projectid } = req.headers
            const myFolder = await Folder.findOne({ project: projectid })
            const myMethod = await Method.findOne({ name: 'GET' }, 'id name')
            const myScraper = await Scraper.findOne({ project: projectid })
            if (myScraper && myFolder && myMethod) {
                const scraperEndpointId = encrypt.virtualId(4)
                const endpoint = await ScraperEndpoint.create({
                    _id: scraperEndpointId,
                    name: 'New Endpoint',
                    method: myMethod.id,
                    path: `/new-endpoint-${scraperEndpointId}`,
                    folder: myFolder.id,
                    scraper: myScraper.id
                })
                endpoint.folder = myFolder
                endpoint.method = myMethod
                await Scraper.update(myScraper.id, { $push: { endpoints: endpoint.id }})
                res.json(preResponse.data(endpoint))
            } else {
                res.json(preResponse.error(null, 'Some thing not found'))
            }
        } catch (err) {
            res.json(preResponse.error(null, 'Create fail'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const createRequest = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || await verify.verifyMember(req, res)) {
        try {
            const { endpoint, environment } = req.body
            const scraperRequestId = encrypt.virtualId(5)
            const myEndpoint = await ScraperEndpoint.findById(endpoint)
            if (myEndpoint) {
                const request = await ScraperRequest.create({
                    _id: scraperRequestId,
                    name: 'New Request',
                    environment: environment,
                    endpoint: myEndpoint.id
                })
                await ScraperEndpoint.update(myEndpoint.id, { $push: { requests: request.id }})
                res.json(preResponse.data(request))
            } else {
                res.json(preResponse.error(null, 'Endpoint not found'))
            }
        } catch (err) {
            res.json(preResponse.error(null, 'Create fail' + err))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const updateEndpoint = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || await verify.verifyMember(req, res)) {
        const id = req.params.id
        const { name, path, method, folder, requests } = req.body
        const findFolder =  await Folder.findById(folder)
        const findMethod =  await Method.findById(method)
        const findEndpoint = await ScraperEndpoint.findById(id)
        if (findFolder && findMethod) {
            if (findEndpoint) {
                await ScraperEndpoint.update(id, { name, path, method, folder })
                for (const request of requests) {
                    await ScraperRequest.update(request.id, {
                        name: request.name,
                        environment: request.environment,
                        isDefault: request.isDefault,
                        request: request.request
                    })
                }
                const myEndpoint = await ScraperEndpoint.getModel().findById(id)
                    .populate('folder', 'id name')
                    .populate('method', 'id name')
                    .populate('requests')
                res.json(preResponse.data(myEndpoint))
            } else {
                res.json(preResponse.error(null, 'Endpoint not found'))
            }
        } else {
            res.json(preResponse.error(null, 'Folder or method not found'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const setDefault = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || verify.verifyMember(req, res)) {
        const id = req.params.id
        const findRequest = await ScraperRequest.findById(id)
        if (findRequest) {
            await ScraperRequest.getModel().updateMany({ endpoint: findRequest.endpoint, environment: findRequest.environment }, { isDefault: false })
            await ScraperRequest.update(findRequest.id, { isDefault: !findRequest.isDefault })
            const myRequest = await ScraperRequest.findById(id, 'id isDefault endpoint')
            res.json(preResponse.data(myRequest))
        } else {
            res.json(preResponse.error(null, 'Response not found'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const search = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || await verify.verifyMember(req, res)) {
        const { search, page } = req.query
        const { projectid } = req.headers
        let scraperId = ''
        const myScraper = await Scraper.findOne({ project: projectid })
        if (myScraper) {
            scraperId = myScraper.id
        }
        const endpointsCount = await ScraperEndpoint.search(scraperId, search, page, 'id method folder name path requests').count()
        const endpoints = await ScraperEndpoint.search(scraperId, search, page, 'id method folder name path requests')
            .skip((page - 1) * 10)
            .limit(10)
        const data = {
            endpoints: endpoints,
            limitPage: Math.ceil(endpointsCount / 10)
        }
        res.json(preResponse.data(data))
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const deleteEndpoint = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || await verify.verifyMember(req, res)) {
        try {
            const id = req.params.id
            const myEndpoint = await ScraperEndpoint.findById(id)
            if (myEndpoint) {
                await ScraperRequest.getModel().deleteMany({ endpoint: myEndpoint.id })
                await ScraperEndpoint.remove(myEndpoint.id)
                res.json(preResponse.data('Successfully'))
            } else {
                res.json(preResponse.error(null, 'Request not found'))
            }
        } catch (err) {
            res.json(preResponse.error(null, err.message))
        }
    }
}

export const deleteRequest = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || await verify.verifyMember(req, res)) {
        try {
            const id = req.params.id
            const myRequest = await ScraperRequest.findById(id)
            if (myRequest) {
                await ScraperRequest.remove(id)
                await ScraperEndpoint.update(myRequest.endpoint, { $pull: { requests: myRequest.id }})
                res.json(preResponse.data('Successfully'))
            } else {
                res.json(preResponse.error(null, 'Request not found'))
            }
        } catch (err) {
            res.json(preResponse.error(null, err.message))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const scrap = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || await verify.verifyMember(req, res)) {
        try {
            const { projectid } = req.headers
            const myProject = await Project.findById(projectid)
            const myScraper = await Scraper.findOne({ project: projectid })
                .populate({
                    path: 'endpoints',
                    populate: {
                        path: 'method'
                    }
                })
            if (myScraper && myProject) {
                const environment = myProject.environments
                for (const endpoint of myScraper.endpoints) {
                    const duplicateEndpoint = await Endpoint.findByRoute(endpoint.path, endpoint.method, endpoint.project)
                    if (!duplicateEndpoint) {
                        scrapEndpoint(endpoint, myProject.id, {
                            environment: environment,
                            baseAPI: myScraper.baseAPI,
                            headers: map.mapEnvironment(myScraper.http.headers, environment),
                            queryString: map.mapEnvironment(myScraper.http.queryString, environment)
                        }, async (err, res, body) => {
                            
                        })
                    }
                }
                res.json(preResponse.data(myScraper))
            } else {
                res.json(preResponse.error(null, 'Request not found'))
            }
        } catch (err) {
            res.json(preResponse.error(null, err.message))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const scrapEndpoint = async (endpoint, project, mainData, cb) => {
    const environment = mainData.environment
    const baseAPI = mainData.baseAPI
    const mainHeaders = mainData.headers
    const mainQueryString = mainData.queryString
    const path = map.mapEnvironment(endpoint.path, environment)
    const methodName = endpoint.method.name

    const endpointId = encrypt.virtualId(4)
    const newEndpoint = await Endpoint.create({
        _id: endpointId,
        name: endpoint.name,
        method: endpoint.method,
        path: endpoint.path,
        folder: endpoint.folder,
        project: project
    })
    await Folder.update(endpoint.folder, { $push: { endpoints: newEndpoint.id }})

    for (const requestId of endpoint.requests) {
        const myRequest = await ScraperRequest.findById(requestId)
        if (myRequest) {
            const body = map.mapEnvironment(myRequest.request.body, environment)
            const headers = Object.assign(mainHeaders, map.mapEnvironment(myRequest.request.headers, environment))
            const queryString = Object.assign(mainQueryString, map.mapEnvironment(myRequest.request.queryString, environment))
            const uri = baseAPI + map.mapParams(path, myRequest.request.params) + queryStringToPath(queryString)
            const http = {
                path: uri,
                method: methodName.toLowerCase(),
                body: body,
                headers: headers
            }
            getResponse(http, async (err, res, body) => {
                const newResponse = await ResponseModel.create({
                    name: myRequest.name,
                    environment: 'dev',
                    condition: {
                        headers: myRequest.request.headers,
                        body: myRequest.request.body,
                        params: myRequest.request.params,
                        queryString: myRequest.request.queryString
                    },
                    response: {
                        headers: {},
                        body: body,
                        delay: 10,
                        statusCode: res.statusCode
                    },
                    isDefault: myRequest.isDefault,
                    endpoint: newEndpoint.id
                })
                await Endpoint.update(newEndpoint.id, { $push: { responses: newResponse.id }})
            })
        }
    }
}

const getResponse = async (http, cb) => {
    const options = {
        headers: http.headers,
        body: http.body
    } 
    switch (http.method) {
        case 'get':
            return await HttpRequest.get(http.path, { headers: http.headers }, cb)
            break
        case 'post':
            return await HttpRequest.post(http.path, options, cb)
            break
        case 'patch':
            return await HttpRequest.patch(http.path, options, cb)
            break
        case 'put':
            return await HttpRequest.put(http.path, options, cb)
            break
        case 'delete':
            return await HttpRequest.delete(http.path, options, cb)
            break
        default :
            return null 
    }
    
}

const queryStringToPath = (data) => {
    let queryString = (Object.keys(data).length > 0) ? '?' : '' 
    for (const key in data) {
        queryString = `${queryString}${key}=${data[key]}&`
    }
    return queryString
}