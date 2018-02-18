import { Request, Response, NextFunction, preResponse } from '../utils/express.util';
import { User } from '../models/user'
import * as encrypt from '../utils/encrypt.util'
import * as JWT from 'jsonwebtoken'
import * as constants from '../constants'
import * as certificate from '../utils/certificate.utils'

export const signin = async (req: Request, res: Response) => {
    const { username, password } = req.body
    const user = await User.findOne({ username })
    if (user && encrypt.compare(password, user.password)) {
        const token = certificate.sign({
            id: user.id,
            isAdmin: user.isAdmin
        })
        const data = {
            token: token,
            user: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                picture: user.picture
            }
        }
        res.json(preResponse.data(data))
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth'))
    }
}

export const signup = async (req: Request, res: Response) => {
    const { firstname, lastname, username, email, password } = req.body
    try {
        const user = await User.create({
            firstname,
            lastname,
            username,
            email,
            password
        })
        res.json(preResponse.data(user))
    } catch (err) {
        res.json(preResponse.error(null, 'Invalid username or email'))
    }
}

export const verify =  async (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
        try {
            const cert = await certificate.verify(req.headers.authorization)
            req.certificate = cert
            next()
        } catch (err) {
            res.json(preResponse.error(null, err.message))
        }
    } else {
        res
            .status(401)
            .json(preResponse.error(null, 'Unauth' ))
    }
}