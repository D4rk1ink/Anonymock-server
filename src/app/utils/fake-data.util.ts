import * as casual from 'casual'

export const fake = (text) => {
    const regex_token = /{{\s*([^}}\s]+)\s*}}/g
    text = text.replace(regex_token, (match, capture) => {
        switch (capture) {
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
                const valRandom = random(capture)
                const valDate = date(capture)
                if (valRandom !== null) {
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