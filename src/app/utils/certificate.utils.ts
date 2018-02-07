import * as JWT from 'jsonwebtoken'
import * as constants from '../constants'

export const sign = (data) => {
    return JWT.sign(data, constants.SECRET_JWT, { expiresIn: '1d' })
}

export const verify = (token) => {
    return JWT.verify(token, constants.SECRET_JWT)
}