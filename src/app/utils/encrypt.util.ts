import * as crypto from 'crypto'
import * as constant from '../constants'

export const encrypt = (plaintext) => {
    return crypto.createHmac('md5', constant.SECRET_KEY)
        .update(plaintext)
        .digest('hex')
}

export const compare = (plaintext, ciphertext) => {
    return encrypt(plaintext) === ciphertext
}

export const virtualId = (len: number) => {
    return crypto.randomBytes(len).toString('hex')
}