import { Request, Response, preResponse } from '../utils/express.util';
import { Project } from '../models/project'
import { Endpoint } from '../models/endpoint'
import { Response as ResponseModel } from '../models/response'
import { Method } from '../models/method'
import * as json from '../utils/json.util'

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
                const paramsCorrect = json.deepCompare(params, response.condition.params)
                const headersCorrect = json.containCompare(req.headers, response.condition.headers)
                const queryStringCorrect = json.deepCompare(req.query, response.condition.queryString)
                let bodyCorrect = true
                if (method !== 'GET') {
                    json.containCompare(req.body, response.condition.body)
                }
                if (paramsCorrect && headersCorrect && queryStringCorrect && bodyCorrect) {
                    setTimeout(() => {
                        res
                            .status(response.response.statusCode)
                            .header(response.response.headers)
                            .json(response.response.body)
                    }, response.response.delay)
                    hasCorrect = true
                    break
                }
            }
            if (!hasCorrect) {
                res
                    .status(404)
                    .json({})
            }
        } else {
            res
                .status(404)
                .json({})
        }
    } else {
        res
                .status(404)
                .json({})
    }
}