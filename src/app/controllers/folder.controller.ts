import { Request, Response, preResponse } from '../utils/express.util';
import { Folder } from '../models/folder'
import { Endpoint } from '../models/endpoint'
import { Project } from '../models/project'
import * as encrypt from '../utils/encrypt.util'
import * as verify from './verify.controller'

export const create = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || verify.verifyMember(req, res)) {
        try {
            const { project, name } = req.body
            const myProject = await Project.findById(project)
            if (myProject) {
                const folderId = encrypt.virtualId(4)
                const folder = await Folder.create({
                    _id: folderId,
                    name: name,
                    project: myProject.id
                })
                const myFolder = await Project.update(myProject.id, { $push: { folders: folder.id }})
                const data = {
                    id: folder.id,
                    name: folder.name,
                    countEndpoints: 0
                }
                res.json(preResponse.data(data))
            } else {
                res.json(preResponse.error(null, 'Project not found'))
            }
        } catch (err) {
            res.json(preResponse.error(null, 'create fail'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const getById = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || verify.verifyMember(req, res)) {
        const id = req.params.id
        const myFolder = await Folder.findById(id, 'id name')
        if (myFolder) {
            const data = {
                id: myFolder.id,
                name: myFolder.name
            }
            res.json(preResponse.data(data))
        } else {
            res.json(preResponse.error(null, 'Folder not found'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const search = async (req: Request, res: Response) => {
    if (await verify.verifyAdmin(req, res) || verify.verifyMember(req, res)) {
        const { project, search, page, all } = req.query
        const myFolders = await Folder.search(project, search)
        if (myFolders) {
            let sliceFolders: any[] = []
            const itemPerPage = 10
            if (all) {
                sliceFolders = myFolders
            } else {
                sliceFolders = myFolders.slice((page - 1 * itemPerPage), page * itemPerPage)
            }
            const folders = sliceFolders.map(folder => {
                return {
                    id: folder.id,
                    name: folder.name,
                    countEndpoints: folder.endpoints.length
                }
            })
            const data = {
                folders: folders,
                limitPage: all ? 0 : Math.ceil(myFolders.length / itemPerPage)
            }
            res.json(preResponse.data(data))
        } else {
            res.json(preResponse.error(null, 'Project not found'))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}