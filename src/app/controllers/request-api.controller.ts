import { Request, Response, NextFunction } from '../utils/express.util';
import { Project } from '../models/project'
import { Endpoint } from '../models/endpoint'
import { Method } from '../models/method'
import { Log } from '../models/log'
import * as _ from 'lodash'
import * as proxy from 'express-http-proxy'
import * as qs from 'querystring'
import * as HttpRequest from 'axios'
import * as encrypt from '../utils/encrypt.util'
import * as map from '../utils/map.util'
import * as fake from '../utils/fake-data.util'
import * as database from '../utils/database.util'

export const request = async (req: Request, res: Response, next: NextFunction) => {
    const { id, environment, path } = req.params
    const method = req.method
    const myProject = await Project.findById(id)
    const myMethod = await Method.findOne({ name: method })
    if (myProject && myMethod && myProject.status) {
        const myEndpoint = await Endpoint.findByRoute(path, myMethod.id, myProject.id)
            .populate('method')
            .populate({
                path: 'responses',
                match: { environment: environment }
            })
        if (myEndpoint) {
            const params = getParamsFromPath(path, myEndpoint.path)
            let defaultResponse: any = null
            let dataResponse: any = null
            for (const response of myEndpoint.responses) {
                response.condition.params = map.mapEnvironment(response.condition.params, myProject.environments)
                response.condition.body = map.mapEnvironment(response.condition.body, myProject.environments)
                response.condition.headers = map.mapEnvironment(response.condition.headers, myProject.environments)
                response.condition.queryString = map.mapEnvironment(response.condition.queryString, myProject.environments)
                
                response.response.headers = map.mapEnvironment(response.response.headers, myProject.environments)
                response.response.headers = fake.fake(response.response.headers)
                response.response.body = map.mapEnvironment(response.response.body, myProject.environments)
                response.response.body = fake.fake(response.response.body)
                
                const extractParamsDbToken = database.extractDbToken(params, response.condition.params)
                const extractHeadersDbToken = database.extractDbToken(req.headers, response.condition.headers)
                const extractQueryStringDbToken = database.extractDbToken(req.query, response.condition.queryString)
                let extractBodyDbToken = []
                if (method !== 'GET') {
                    extractBodyDbToken = database.extractDbToken(req.body, response.condition.body)
                }
                if (extractParamsDbToken && extractHeadersDbToken && extractQueryStringDbToken && extractBodyDbToken) {
                    if (response.response.isForward) {
                        const payload: any = {
                            proxy: myProject.forwardEndpoint,
                            path: path,
                            url: `${myProject.forwardEndpoint}/${path}`,
                            queryString: req.query,
                            headers: req.headers,
                            body: req.body,
                            method: myMethod,
                            project: myProject
                        }
                        try {
                            return await forward(payload, req, res, next)
                        } catch (err) {
                            return res.status(500).json({e: err.message})
                        }
                    } else {
                        const dbTokens = [
                            ...extractParamsDbToken,
                            ...extractHeadersDbToken,
                            ...extractQueryStringDbToken,
                            ...extractBodyDbToken
                        ]
                        dataResponse = {}
                        dataResponse.headers = response.response.headers
                        dataResponse.statusCode = response.response.statusCode
                        dataResponse.delay = response.response.delay
                        
                        if (dbTokens.length > 0) {
                            const dbSelected = database.query(dbTokens, myProject.database.data, response.response.isFindOne)
                            if (response.response.isFindOne) {
                                if (dbSelected.length === 0) {
                                    dataResponse = null
                                } else {
                                    dataResponse.headers = map.mapDatabase(response.response.headers, dbSelected[0])
                                    dataResponse.body = map.mapDatabase(response.response.body, dbSelected[0])
                                }
                            } else {
                                dataResponse.body = dbSelected.map(db => map.mapDatabase(response.response.body, db))
                            }
                        } else {
                            if (database.hasDbToken(response.response.body)) {
                                const dbSelected = myProject.database.data
                                dataResponse.body = dbSelected.map(db => map.mapDatabase(response.response.body, db))
                            } else {
                                dataResponse.body = response.response.body
                            }
                        }
                    }
                }
                if (response.isDefault) {
                    defaultResponse = {}
                    defaultResponse.body = response.response.body
                    defaultResponse.headers = response.response.headers
                    defaultResponse.statusCode = response.response.statusCode
                    defaultResponse.delay = response.response.delay
                }
                if (dataResponse) {
                    break
                }
            }
            if (dataResponse || defaultResponse) {
                if (!dataResponse) {
                    dataResponse = defaultResponse
                }
                dataResponse.body = fake.fake(dataResponse.body)
                dataResponse.headers = fake.fake(dataResponse.headers)
                setTimeout(async () => {
                    // Create log
                    const log = {
                        _id: encrypt.virtualId(7),
                        path: `/${path}`,
                        method: myMethod.id,
                        request: {
                            client: {},
                            headers: req.headers,
                            body: JSON.stringify(req.body),
                            queryString: req.query
                        },
                        response: {
                            headers: dataResponse.headers,
                            body: JSON.stringify(dataResponse.body),
                            delay: dataResponse.delay,
                            statusCode: dataResponse.statusCode
                        },
                        project: myProject.id
                    }
                    try {
                        await Log.create(log)
                    } catch (err) {
                        console.error(err)
                    }
                    res
                        .status(dataResponse.statusCode)
                        .header(dataResponse.headers)
                        .json(dataResponse.body)
                }, dataResponse.delay)
            } else {
                res.status(404).json({e: 'Api not found'})
            }
        } else {
            res.status(404).json({e: 'Endpoint not found'})
        }
    } else {
        res.status(404).json({e: 'Project not found'})
    }
}

const getParamsFromPath = (path: string, endpointPath: String) => {
    const params = {}
    const paramPattern = /{{\s*([A-Za-z0-9\-]+)\s*}}/g
    const match = endpointPath.match(paramPattern) || []
    const keys: any[] = match
        .map(token => (new RegExp(paramPattern).exec(token) || [null, '']).slice(1).pop())
        .filter((param, i, arr) => param && param !== '' && !new RegExp(/\.{2,}|\.$/g).test(param) && arr.indexOf(param) === i)
    const values = (new RegExp(endpointPath.replace(paramPattern, '([^/]+)')).exec(`/${path}`) || [null, '']).slice(1)
    if (values && values.length === keys.length) {
        keys.forEach((key, i) => {
            params[key] = values[i]
        })
    }
    return params
}

const forward = async (payload, req, res, next) => {
    proxy(payload.proxy, {
        proxyReqPathResolver: (_req) => {
            return new Promise((resolve, reject) => {
                return resolve(`/${payload.path}${!_.isEmpty(req.queryString) ? `?${qs.stringify(req.queryString)}` : ''}`)
            })
        } ,
        userResDecorator: async (proxyRes: any, proxyResData, userReq, userRes) => {
            const log = {
                _id: encrypt.virtualId(7),
                path: `/${payload.path}`,
                method: payload.method.id,
                request: {
                    client: {},
                    headers: userReq.headers,
                    body: JSON.stringify(userReq.body),
                    queryString: userReq.query
                },
                response: {
                    headers: proxyRes.headers,
                    body: proxyResData.toString('utf8'),
                    delay: 0,
                    statusCode: proxyRes.statusCode
                },
                project: payload.project.id
            }
            try {
                await Log.create(log)
            } catch (err) {
                console.error(err)
            }
            return proxyResData
        }
    })(req, res, next)
}
