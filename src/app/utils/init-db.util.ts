import { User } from '../models/user'
import { ProjectPosition } from '../models/project-position'
import { Method } from '../models/method'
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

const staticProjectPositions = [
    {
        name: 'Manager'
    },
    {
        name: 'Normal'
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

export const createUsers = async () => {
    for (const user of staticUsers) {
        try {
            await User.create(user)
        } catch (err) {
            console.error(err)
        }
    }
}

export const createMethods = async () => {
    const methods = await Method.findAll()
    if (methods.length === 0) {
        for (const method of staticMethods) {
            try {
                await Method.create(method)
            } catch (err) {
                console.error(err)
            }
        }
    }
}

export const createProjectPositions = async () => {
    const projectPositions = await ProjectPosition.findAll()
    if (projectPositions.length === 0) {
        for (const position of staticProjectPositions) {
            try {
                await ProjectPosition.create(position)
            } catch (err) {
                console.error(err)
            }
        }
    }
}