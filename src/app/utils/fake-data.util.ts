import * as casual from 'casual'
import { genIdCard } from './id-card'
import * as encrypt from '../utils/encrypt.util'

export const fake = (text) => {
    const regex_token = /{{\s*([^}}\s]+)\s*}}/g
    text = text.replace(regex_token, (match, capture) => {
        switch (capture) {
            case 'id':
                return encrypt.virtualId(10)
            case 'firstname':
                return casual.first_name
            case 'lastname':
                return casual.last_name
            case 'age':
                return casual.integer(1, 99)
            case 'username':
                return casual.username
            case 'email':
                return casual.email
            case 'password':
                return casual.password
            case 'country':
                return casual.country
            case 'ip':
                return casual.ip
            case 'domain':
                return casual.domain
            case 'url':
                return casual.url
            default:
                const valIdCard = idCard(capture)
                const valPhoneNumber = phoneNumber(capture)
                const valRandom = random(capture)
                const valDate = date(capture)
                if (valIdCard !== null) {
                    return valIdCard
                } else if (valPhoneNumber !== null) {
                    return valPhoneNumber
                } else if (valRandom !== null) {
                    return valRandom
                } else if (valDate !== null) {
                    return valDate
                }
        }
        return match
    })
    return text
}

export const mapSchema = (data, schema) => {
    if (typeof schema === 'string') {
        schema = JSON.parse(schema)
    }
    if (typeof data === 'string') {
        data = JSON.parse(data)
    }
    for (const key in schema) {
        switch (schema[key]) {
            case 'String':
                data[key] = data[key].toString()
                break
            case 'Number':
                data[key] = +data[key].toString()
                break
            case 'Boolean':
                data[key] = JSON.parse(data[key])
                break
            case 'Array':
                data[key] = JSON.parse(data[key])
                break
            case 'Object':
                data[key] = JSON.parse(data[key])
                break
            default:
                if (schema[key] instanceof Array) {
                    if (data[key] instanceof Array) {
                        const subSchema = schema[key][0]
                        for (const idx in data[key]) {
                            data[key][idx] = mapSchema(data[key][idx], subSchema)
                        }
                    }
                } else if (typeof schema[key] === 'object') {
                    data[key] = mapSchema(data[key], schema[key])
                }
        }
    }
    return data
}

const idCard = (capture) => {
    const regex_phoneNumber = /^id_card\.(th|en)$/g
    const exec = regex_phoneNumber.exec(capture)
    if (exec) {
        const arg = exec[1].trim()
        switch (arg) {
            case 'th':
                return genIdCard()
                break
            case 'en':
                return genIdCard()
                break
        }
    }
    return null
}

const phoneNumber = (capture) => {
    const regex_phoneNumber = /^phone_number\.(th|en)$/g
    const exec = regex_phoneNumber.exec(capture)
    
    if (exec) {
        const arg = exec[1].trim()
        switch (arg) {
            case 'th':
                const first = ['06', '08', '09']
                const last = Math.floor(Math.random() * (99999999 - 11111111) + 11111111).toString()
                return first[Math.floor(Math.random()*first.length)] + last
                break
            case 'en':
                return casual.phone
                break
        }
    }
    return null
}

const random = (capture) => {
    const regex_random = /^random\(([^\)]+)\)$/g
    const exec = regex_random.exec(capture)
    if (exec) {
        const arg = exec[1].trim()
        const randomNumber = /^\s*(-?\d+)\s*,\s*(-?\d+)\s*$/g.exec(arg)
        const randomArray = /^\s*(\[.*\])\s*$/g.exec(arg)
        if (randomNumber) {
            return casual.integer(+randomNumber[1], +randomNumber[2])
        } else if (randomArray) {
            try {
                const array = JSON.parse(randomArray[1].replace(/([^\\\'])(')/g, '$1"'))
                const item = array[Math.floor(Math.random() * array.length)]
                return item
            } catch (err) { }
        }
    }
    return null
}

const date = (capture) => {
    const regex_date = /^date\(([^\)]*?)\)$/g
    const exec = regex_date.exec(capture)
    if (exec) {
        return new Date().getTime()
    }
    return null
}