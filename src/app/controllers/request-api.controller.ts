import { Request, Response, preResponse } from '../utils/express.util';
import { Project } from '../models/project'
import { Endpoint } from '../models/endpoint'
import { Response as ResponseModel } from '../models/response'
import { Method } from '../models/method'
import { Log } from '../models/log'
import * as json from '../utils/json.util'
import * as encrypt from '../utils/encrypt.util'
import * as map from '../utils/map.util'
import * as database from '../utils/database.util'

export const request = async (req: Request, res: Response) => {
    const { id, environment, path } = req.params
    const method = req.method
    const myProject = await Project.findById(id)
    const myMethod = await Method.findOne({ name: method })
    if (myProject && myMethod) {
        const myEndpoint = await Endpoint.findByRoute(path, myMethod.id, myProject.id)
            .populate('method')
            .populate({
                path: 'responses',
                match: { environment: environment }
            })
        if (myEndpoint) {
            const params = getParamsFromPath(path, myEndpoint.path)
            let dataResponse: any = null
            for (const response of myEndpoint.responses) {
                response.condition.params = map.mapEnvironment(response.condition.params, myProject.environments)
                response.condition.body = map.mapEnvironment(response.condition.body, myProject.environments)
                response.condition.headers = map.mapEnvironment(response.condition.headers, myProject.environments)
                response.condition.queryString = map.mapEnvironment(response.condition.queryString, myProject.environments)
                
                response.response.headers = map.mapEnvironment(response.response.headers, myProject.environments)
                response.response.body = map.mapEnvironment(response.response.body, myProject.environments)
                
                const extractParamsDbToken = database.extractDbToken(params, response.condition.params)
                const extractHeadersDbToken = database.extractDbToken(req.headers, response.condition.headers)
                const extractQueryStringDbToken = database.extractDbToken(req.query, response.condition.queryString)

                let extractBodyDbToken = []
                if (method !== 'GET') {
                    extractBodyDbToken = database.extractDbToken(req.body, response.condition.body)
                }
                if (extractParamsDbToken && extractHeadersDbToken && extractQueryStringDbToken && extractBodyDbToken) {
                    const dbTokens = [
                        ...extractParamsDbToken,
                        ...extractHeadersDbToken,
                        ...extractQueryStringDbToken,
                        ...extractBodyDbToken
                    ]
                    dataResponse = {}
                    if (dbTokens.length > 0) {
                        const dbSelected = database.query(dbTokens, myProject.database.data)
                        if (response.response.isFindOne) {
                            if (dbSelected.length === 0) {
                                dataResponse = null
                                continue
                            }
                            dataResponse.body = map.mapDatabase(response.response.body, dbSelected[0])
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
                    dataResponse.headers = response.response.headers
                    dataResponse.statusCode = response.response.statusCode
                    dataResponse.delay = response.response.delay
                    break
                } else {
                    if (response.isDefault) {
                        dataResponse = {}
                        dataResponse.body = response.response.body
                        dataResponse.headers = response.response.hedaers
                        dataResponse.statusCode = response.response.statusCode
                        dataResponse.delay = response.response.delay
                    }
                }
            }
            if (dataResponse) {
                setTimeout(async () => {
                    // Create log
                    const log = {
                        _id: encrypt.virtualId(7),
                        path: `/${path}`,
                        method: myMethod.id,
                        request: {
                            client: {},
                            headers: req.headers,
                            body: req.body,
                            queryString: req.query
                        },
                        response: {
                            headers: dataResponse.headers,
                            body: dataResponse.body,
                            delay: dataResponse.delay,
                            statusCode: dataResponse.statusCode
                        },
                        project: myProject.id
                    }
                    await Log.create(log)
                    res
                        .status(dataResponse.statusCode)
                        .header(dataResponse.headers)
                        .json(dataResponse.body)
                }, dataResponse.delay)
            } else {
                res.status(404).json({e:'Api not fount'})
            }
        } else {
            res.status(404).json({e:'Endpoint not found'})
        }
    } else {
        res.status(404).json({e:'Project not found'})
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

