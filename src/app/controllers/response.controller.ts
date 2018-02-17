import { Request, Response as EResponse, preResponse } from '../utils/express.util';
import { Endpoint } from '../models/endpoint'
import { Response } from '../models/response'
import { Method } from '../models/method'
import * as encrypt from '../utils/encrypt.util'
import * as json from '../utils/json.util'
import * as verify from './verify.controller'

export const create = async (req: Request, res: EResponse) => {
    if (await verify.verifyAdmin(req, res) || verify.verifyMember(req, res)) {
        const { endpoint, environment } = req.body
        const myEndpoint = await Endpoint.findById(endpoint)
        if (myEndpoint) {
            const response = await Response.create({
                name: 'New Response',
                environment: environment,
                condition: {
                    headers: {},
                    body: {},
                    params: {},
                    queryString: {}
                },
                response: {
                    headers: {},
                    body: {},
                    delay: 10,
                    statusCode: 200
                },
                endpoint: endpoint
            })
            const updateEndpoint = await Endpoint.update(endpoint, { $push: { responses: response.id }})
            const data = {
                id: response.id,
                name: response.name,
                response: {
                    delay: response.response.delay,
                    statusCode: response.response.statusCode
                }
            }
            res.json(preResponse.data(data))
        } else {
            res.json(preResponse.error(null, 'Endpoint not found'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const update = async (req: Request, res: EResponse) => {
    if (await verify.verifyAdmin(req, res) || verify.verifyMember(req, res)) {
        const id = req.params.id
        const { name, condition, response } = req.body
        const conditionHeaders = json.isJSON(condition.headers)
        const conditionQueryString = json.isJSON(condition.queryString)
        const responseHeaders = json.isJSON(response.headers)
        if (conditionHeaders && conditionQueryString && responseHeaders) {
            await Response.update(id, { name, condition, response })
            const myResponse = await Response.findById(id)
            if (myResponse) {
                res.json(preResponse.data({
                    ...myResponse.toJSON(),
                    condition: myResponse.condition,
                    response: myResponse.response
                }))
            } else {
                res.json(preResponse.error(null, 'Response not found'))
            }
        } else {
            res.json(preResponse.error(null, 'Type not work'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const getById = async (req: Request, res: EResponse) => {
    if (await verify.verifyAdmin(req, res) || verify.verifyMember(req, res)) {
        const id = req.params.id
        const myResponse = await Response.findById(id)
        if (myResponse) {
            res.json(preResponse.data({
                ...myResponse.toJSON(),
                condition: myResponse.condition,
                response: myResponse.response
            }))
        } else {
            res.json(preResponse.error(null, 'Response not found'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const search = async (req: Request, res: EResponse) => {
    if (verify.verifyMember(req, res)) {
        const { endpoint, search, environment } = req.query
        const myResponses = await Response.search(endpoint, search, environment, 'id name response')
        const data = myResponses.map(response => {
            return {
                id: response.id,
                name: response.name,
                response: {
                    delay: response.response.delay,
                    statusCode: response.response.statusCode
                }
            }
        })
        res.json(preResponse.data(data))
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}