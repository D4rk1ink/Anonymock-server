import { User } from '../models/user'
import { Project } from '../models/project'
import { Method } from '../models/method'
import { Endpoint } from '../models/endpoint'
import { Response } from '../models/response'
import { Scraper } from '../models/scraper'
import { ScraperEndpoint } from '../models/scraper-endpoint'
import { ScraperRequest } from '../models/scraper-request'
import { Folder } from '../models/folder'
import { Log } from '../models/log'
import * as constants from '../constants'

const staticUsers = [
    {
        firstname: 'admin',
        lastname: 'admin',
        username: constants.INIT_USERNAME,
        email: constants.INIT_EMAIL,
        picture: constants.DEFAULT_PROFILE_PICTURE,
        password: constants.INIT_PASSWORD.toString(),
        isAdmin: true,
        isApproved: true
    }
]

const staticMethods = [
    {
        name: 'GET'
    },
    {
        name: 'POST'
    },
    {
        name: 'PUT'
    },
    {
        name: 'PATCH'
    },
    {
        name: 'DELETE'
    }
]

export const createModels = async () => {
    User.createModel()
    Project.createModel()
    Method.createModel()
    Project.createModel()
    Endpoint.createModel()
    Response.createModel()
    Scraper.createModel()
    ScraperEndpoint.createModel()
    ScraperRequest.createModel()
    Folder.createModel()
    Log.createModel()
}

export const createUsers = async () => {
    for (const user of staticUsers) {
        try {
            const UserModel = User.getModel()
            await new UserModel(user).save()
        } catch (err) { }
    }
}

export const createMethods = async () => {
    const methods = await Method.findAll()
    if (methods.length === 0) {
        for (const method of staticMethods) {
            try {
                const MethodModel = Method.getModel()
                await new MethodModel(method).save()
            } catch (err) { }
        }
    }
}