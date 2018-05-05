import * as json from './json.util'

export const mapEnvironment = (template, environment) => {
    const isString = typeof template === 'string'
    if (!isString) {
        template = JSON.stringify(template)
    }
    const regex_token = /{{\s*\$env.([^}}\s]+)\s*}}/g
    template = template.replace(regex_token, (match, capture) => {
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
        const regex_token = /{{\s*\$db.([^}}\s]+)\s*}}/g
        const found = data.match(regex_token)
        if (found) {
            const tokens = found.filter((token, i) => found.indexOf(token) === i)
            for (const token of tokens) {
                const exec = new RegExp(regex_token).exec(token)
                if (exec) {
                    const keyChain = exec[1]
                    const keys = keyChain.split('.')
                    let nested = database
                    for (const key of keys) {
                        nested = nested[key]
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
    const regex_token = /{{\s*([^}}\s]+)\s*}}/g
    template = template.replace(regex_token, (match, capture) => {
        return params[capture]
    })
    if (isString) {
        return template
    } else {
        return JSON.parse(template)
    }
}