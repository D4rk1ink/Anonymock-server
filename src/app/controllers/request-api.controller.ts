import { Request, Response, preResponse } from '../utils/express.util';
import { Project } from '../models/project'
import { Endpoint } from '../models/endpoint'
import { Response as ResponseModel } from '../models/response'
import { Method } from '../models/method'
import { Log } from '../models/log'
import * as json from '../utils/json.util'
import * as encrypt from '../utils/encrypt.util'

export const request = async (req: Request, res: Response) => {
    const { id, environment, path } = req.params
    const method = req.method
    const myProject = await Project.findById(id)
    const myMethod = await Method.findOne({ name: method })
    if (myProject && myMethod) {
        const paramPattern = /{{\s*([A-Za-z0-9\-]+)\s*}}/g
        const folderIds = myProject.folders
        const myEndpoint = await Endpoint.getModel().findOne({ folder: { $in: folderIds }, method: myMethod,
            $where: `new RegExp(this.path.replace(${paramPattern}, '([^/]+)')).test("/${path}")`
        })
        .populate('method')
        .populate({
            path: 'responses',
            match: { environment: environment }
        })
        if (myEndpoint) {
            const params = {}
            const match = myEndpoint.path.match(paramPattern) || []
            const keys: any[] = match
                .map(token => (new RegExp(paramPattern).exec(token) || [null, '']).slice(1).pop())
                .filter((param, i, arr) => param && param !== '' && !new RegExp(/\.{2,}|\.$/g).test(param) && arr.indexOf(param) === i)
            const values = (new RegExp(myEndpoint.path.replace(paramPattern, '([^/]+)')).exec(`/${path}`) || [null, '']).slice(1)
            if (values && values.length === keys.length) {
                keys.forEach((key, i) => {
                    params[key] = values[i]
                })
            }
            let hasCorrect = false
            for (const response of myEndpoint.responses) {
                response.condition.params = mapEnvironment(response.condition.params, myProject.environments)
                response.condition.body = mapEnvironment(response.condition.body, myProject.environments)
                response.condition.headers = mapEnvironment(response.condition.headers, myProject.environments)
                response.condition.queryString = mapEnvironment(response.condition.queryString, myProject.environments)
                
                response.response.headers = mapEnvironment(response.response.headers, myProject.environments)
                response.response.body = mapEnvironment(response.response.body, myProject.environments)

                // const paramsCorrect = json.deepCompare(params, response.condition.params)
                // const headersCorrect = json.containCompare(req.headers, response.condition.headers)
                // const queryStringCorrect = json.deepCompare(req.query, response.condition.queryString)
                
                const extractParamsDbToken = extractDbToken(params, response.condition.params)
                const extractHeadersDbToken = extractDbToken(req.headers, response.condition.headers)
                const extractQueryStringDbToken = extractDbToken(req.query, response.condition.queryString)
       
                let extractBodyDbToken = []
                if (method !== 'GET') {
                    extractBodyDbToken = extractDbToken(req.body, response.condition.body)
                }
                if (extractParamsDbToken && extractHeadersDbToken && extractQueryStringDbToken && extractBodyDbToken) {
                    const dbTokens = [
                        ...extractParamsDbToken,
                        ...extractHeadersDbToken,
                        ...extractQueryStringDbToken,
                        ...extractBodyDbToken
                    ]
                    const dbSelected = filterDababase(dbTokens, myProject.database.data)
                    const responseBody = dbSelected.map(db => mapDatabase(response.response.body, db))
                    
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
                                headers: response.response.headers,
                                body: responseBody,
                                delay: response.response.delay,
                                statusCode: response.response.statusCode
                            },
                            project: myProject.id
                        }
                        await Log.create(log)
                        res
                            .status(response.response.statusCode)
                            .header(response.response.headers)
                            .json(responseBody)
                    }, response.response.delay)
                    hasCorrect = true
                    break
                }
            }
            if (!hasCorrect) {
                res.status(404).json({e:'Api not fount'})
            }
        } else {
            res.status(404).json({e:'Endpoint not found'})
        }
    } else {
        res.status(404).json({e:'Project not found'})
    }
}

const mapEnvironment = (template, environment) => {
    if (typeof template !== 'string') {
        template = JSON.stringify(template)
    }
    const regex_token = /{{\s*\$env.([^}}\s]+)\s*}}/g
    template = template.replace(regex_token, (match, capture) => {
        return environment[capture]
    })
    return JSON.parse(template)
}

const mapDatabase = (template, database) => {
    if (typeof template !== 'string') {
        template = JSON.stringify(template)
    }
    const regex_token = /{{\s*\$db.([^}}\s]+)\s*}}/g
    
    template = template.replace(regex_token, (match, capture) => {
        const keys = capture.split('.')
        let nested = database
        for (const key of keys) {
            nested = nested[key]
        }
        return nested
    })
    return JSON.parse(template)
}

const extractDbToken = (data, correctData) => {
    let temp: any = []
    const regex_token = /{{\s*\$db.([^}}\s]+)\s*}}/g
    if (Array.isArray(data) !== Array.isArray(correctData)) {
        return false
    }
    if (Array.isArray(correctData)) {
        if (data.length !== correctData.length) {
            return false
        } else {
            for (const i of correctData.keys()) {
                const a = extractDbToken(data[i], correctData[i])
                if (Array.isArray(a)) {
                    temp = [...a, ...temp]
                }
                if (a === false) {
                    return false
                }
            }
        }
    } else if (typeof correctData === 'object') {
        for (const key in correctData) {
            if (!data.hasOwnProperty(key)) {
                return false
            }
            const a = extractDbToken(data[key], correctData[key])
            if (Array.isArray(a)) {
                temp = [...a, ...temp]
            }
            if (a === false) {
                return false
            }
        }
    } else {
        const regex_token = /{{\s*\$db.([^}}\s]+)\s*}}/g
        if (new RegExp(regex_token).test(correctData)) {
            const key = (new RegExp(regex_token).exec(correctData) || []).slice(1).pop()
            const value = data
            return [{
                key: key,
                value: value
            }]
        } else {
            if (data !== correctData) {
                return false
            }
        }
    }
    return temp
}

const filterDababase = (conditions, db) => {
    let selected: any[] = []
    for (const data of db) {
        let isCorrect = false
        for (const condition of conditions) {
            const keys = condition.key.split('.')
            let nested = data
            for (const key of keys) {
                nested = nested[key]
            }
            if (typeof nested === 'boolean') {
                condition.value = JSON.parse(condition.value) // ?
            }
            if (nested == condition.value) {
                isCorrect = true
            } else {
                isCorrect = false
                break
            }
        }
        if (isCorrect) {
            selected.push(data)
        }
    }
    return selected
}
