import * as json from './json.util'

const REGEX_DB_TOKEN = /{{\s*\$db.([^}}]+)\s*}}/g
const REGEX_ENV_TOKEN = /{{\s*\$env.([^}}\s]+)\s*}}/g
const REGEX_PARAM_TOKEN = /{{\s*([^}}\s]+)\s*}}/g

export const mapEnvironment = (template, environment) => {
    const isString = typeof template === 'string'
    if (!isString) {
        template = JSON.stringify(template)
    }
    template = template.replace(REGEX_ENV_TOKEN, (match, capture) => {
        return environment[capture]
    })
    if (isString) {
        return template
    } else {
        return JSON.parse(template)
    }
}

export const mapDatabase = (_template, database) => {
    let data = _template
    if (typeof data === 'object') {
        data = json.clone(data)
    }
    if (data instanceof Array) {
        for (const [i, datum] of data.entries()) {
            data[i] = mapDatabase(datum, database)
        }
    } else if (typeof data === 'object') {
        for (const key in data) {
            data[key] = mapDatabase(data[key], database)
        }
    } else if (typeof data === 'string') {
        const found = data.match(REGEX_DB_TOKEN)
        if (found) {
            const tokens = found.filter((token, i) => found.indexOf(token) === i)
            for (const token of tokens) {
                const exec = new RegExp(REGEX_DB_TOKEN).exec(token)
                if (exec) {
                    const regex_filter = /\(([^\)]*)\)$/g
                    const keyChain = exec[1]
                    const keys = keyChain.split('.')
                    let nested = database
                    for (const key of keys) {
                        nested = nested[key.replace(regex_filter, '')]
                        if (regex_filter.test(key)) {
                            const exec = new RegExp(regex_filter).exec(key)
                            if (exec) {
                                try {
                                    const filter = (data, keys) => {
                                        const temp = {}
                                        for (const key of keys) {
                                            temp[key] = data[key]
                                        }
                                        return temp
                                    }
                                    const filterKeys = JSON.parse(`[${exec[1]}]`.replace(/\'/g, `"`))
                                    if (Array.isArray(nested)) {
                                        nested = nested.map(data => filter(data, filterKeys))
                                    } else {
                                        
                                        nested = filter(nested, filterKeys)
                                    }
                                } catch (err) {}
                            }
                        }
                    }
                    if (found.length === 1 && typeof nested === 'object') {
                        data = json.clone(nested)
                    } else {
                        data = data.replace(token, nested)
                    }
                }
            }
        }
    }
    return data
}

export const mapParams = (template, params) => {
    const isString = typeof template === 'string'
    if (!isString) {
        template = JSON.stringify(template)
    }
    template = template.replace(REGEX_PARAM_TOKEN, (match, capture) => {
        return params[capture]
    })
    if (isString) {
        return template
    } else {
        return JSON.parse(template)
    }
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