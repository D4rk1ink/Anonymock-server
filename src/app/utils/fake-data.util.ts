import { genIdCard } from './id-card'
import * as fs from 'fs'
import * as path from 'path'
import * as casual from 'casual'
import * as encrypt from '../utils/encrypt.util'
import * as json from '../utils/json.util'

export const fake = (_data) => {
    let data = json.clone(_data)
    if (data instanceof Array) {
        for (const [i, datum] of data.entries()) {
            data[i] = fake(datum)
        }
    } else if (typeof data === 'object') {
        for (const key in data) {
            if (/\<\d+\>$/.test(key) && data[key] instanceof Array) {
                const numberExec = /\<(\d+)\>$/.exec(key)
                const number = numberExec ? +numberExec[1] : 0
                const baseData = data[key].length > 1 ? data[key] : data[key].length > 0 ? data[key][0] : []
                const arr = Array.apply(null, Array(number)).map((i) => baseData)
                const newKey = key.replace(/\<\d+\>$/, '')
                data[newKey] = fake(arr)
                delete data[key]
            } else {
                data[key] = fake(data[key])
            }
        }
    } else if (typeof data === 'string') {
        data = generateData(data)
    }
    
    return data
}

export const generateData = (text) => {
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
            case 'avatar':
                return avatar()
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

const avatar = () => {
    const avatarsPath = path.join(__dirname, '../images/avatars/')
    const avatars = fs.readdirSync(avatarsPath)
    const avatar = fs.readFileSync(avatarsPath + avatars[Math.floor(Math.random()*avatars.length)], 'base64')
    return `data:image/png;base64,${avatar}`
}