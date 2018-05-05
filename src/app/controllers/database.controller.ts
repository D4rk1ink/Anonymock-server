import { Request, Response, preResponse } from '../utils/express.util';
import { Project } from '../models/project'
import * as utilSchema from '../utils/schema.util'
import * as fake from '../utils/fake-data.util'
import * as map from '../utils/map.util'
import * as verify from './verify.controller'

export const get = async (req: Request, res: Response) => {
    if (verify.verifyMember(req, res)) {
        const { project } = req.body
        const myProject = await Project.findById(project, 'database')
        if (myProject) {
            res.json(preResponse.data(myProject.database))
        } else {
            res.json(preResponse.error(null, 'Project not found'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const generate = async (req: Request, res: Response) => {
    if (verify.verifyMember(req, res)) {
        const { project, schema, data, count } = req.body
        try {
            utilSchema.isSchema(schema)
            const database = Array.apply(null, Array(+count)).map(_ => {
                const afterFakeData = fake.fake(data)
                const afterMapData = map.mapSchema(afterFakeData, schema)
                utilSchema.verify(afterMapData, schema)
                return afterMapData
            })
            await Project.update(project, {
                "database.schema": schema,
                "database.generate": data,
                "database.data": database
            })
            const myProject = await Project.findById(project, 'database')
            if (myProject) {
                const database = myProject.database
                res.json(preResponse.data(database))
            } else {
                res.json(preResponse.error(null, 'Project not found'))        
            }
        } catch (err) {
            res.json(preResponse.error(null, 'Schema or model have problems'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const importDB = async (req: Request, res: Response) => {
    if (verify.verifyMember(req, res)) {
        const { project, schema, data } = req.body
        try {
            utilSchema.isSchema(schema)
            if (Array.isArray(data)) {
                const database = data.map(datum => {
                    const afterFakeData = fake.fake(datum)
                    const afterMapData = map.mapSchema(afterFakeData, schema)
                    utilSchema.verify(afterMapData, schema)
                    return afterMapData
                })
                await Project.update(project, {
                    "database.schema": schema,
                    "database.data": database
                })
                const myProject = await Project.findById(project, 'database')
                if (myProject) {
                    const database = myProject.database
                    res.json(preResponse.data(database))
                } else {
                    res.json(preResponse.error(null, 'Project not found'))        
                }
            } else {
                res.json(preResponse.error(null, 'Data is not array'))        
            }
        } catch (err) {
            res.json(preResponse.error(null, 'Schema or data have problems'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}