import { User } from '../models/user'
import { ProjectPosition } from '../models/project-position'
import * as constants from '../constants'

const staticUser = [
    {
        firstname: 'admin',
        lastname: 'admin',
        username: constants.INIT_USERNAME,
        email: constants.INIT_EMAIL,
        password: constants.INIT_PASSWORD.toString(),
        isAdmin: true,
        isApproved: true
    }
]

const staticProjectPosition = [
    {
        name: 'Manager'
    },
    {
        name: 'Normal'
    }
]

export const createUser = async () => {
    for (const user of staticUser) {
        try {
            await User.create(user)
        } catch (err) {
            console.log(err)
        }
    }
}

export const createProjectPosition = async () => {
    const projectPosition = await ProjectPosition.findAll()
    if (projectPosition.length === 0) {
        for (const position of staticProjectPosition) {
            try {
                await ProjectPosition.create(position)
            } catch (err) {
                console.log(err)
            }
        }
    }
}