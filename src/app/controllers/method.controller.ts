import { Request, Response, preResponse } from '../utils/express.util';
import { Method } from '../models/method'
import * as encrypt from '../utils/encrypt.util'
import * as verify from './verify.controller'

export const getById = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || verify.verifyMember(req, res)) {
        const id = req.params.id
        const myMethod = await Method.findById(id, 'id name')
        if (myMethod) {
            const data = {
                id: myMethod.id,
                name: myMethod.name,
            }
            res.json(preResponse.data(data))
        } else {
            res.json(preResponse.error(null, 'Method not found'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const search = async (req: Request, res: Response) => {
    if (verify.verifyMember(req, res)) {
        const { search } = req.query
        const methods = await Method.search(search, 'id name')
        res.json(preResponse.data(methods))
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}