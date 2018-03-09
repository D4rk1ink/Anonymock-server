export const verify = (data: any, schema: any) => {
    if (typeof schema === 'string') {
        schema = JSON.parse(schema)
    }
    if (typeof data === 'string') {
        data = JSON.parse(data)
    }
    for (const key in data) {
        if (!schema.hasOwnProperty(key)) {
            throw new Error(key + ' undefined')
        }
    }
    for (const key in schema) {
        if (!data.hasOwnProperty(key)) {
            throw new Error('Not has ' + key)
        }
        switch (schema[key]) {
            case 'String':
                if (typeof data[key] !== 'string') {
                    throw new Error(key + ' not string')
                }
                break
            case 'Number':
                if (typeof data[key] !== 'number') {
                    throw new Error(key + ' not number')
                }
                break
            case 'Boolean':
                if (typeof data[key] !== 'boolean') {
                    throw new Error(key + ' not boolean')
                }
                break
            case 'Array':
                if (!Array.isArray(data[key])) {
                    throw new Error(key + ' not array')
                }
                break
            case 'Object':
                if (typeof data[key] !== 'object' || Array.isArray(data[key])) {
                    throw new Error(key + ' not object')
                }
                break
            default:
                if (schema[key] instanceof Array) {
                    if (data[key] instanceof Array) {
                        const subSchema = schema[key][0]
                        for (const subData of data[key]) {
                            try {
                                verify(subData, subSchema)
                            } catch (err) {
                                throw err
                            }
                        }
                    } else {
                        throw new Error(key + ' not array')
                    }
                } else if (typeof schema[key] === 'object') {
                    try {
                        const subSchema = schema[key]
                        verify(data[key], subSchema)
                    } catch (err) {
                        throw err
                    }
                } else {
                    throw new Error('Type not working')
                }
        }
    }
}

export const verifyGenerate = (data: any, schema: any) => {
    if (typeof schema === 'string') {
        schema = JSON.parse(schema)
    }
    if (typeof data === 'string') {
        data = JSON.parse(data)
    }
    for (const key in data) {
        if (!schema.hasOwnProperty(key)) {
            throw new Error(key + ' undefined')
        }
    }
    for (const key in schema) {
        if (!data.hasOwnProperty(key)) {
            throw new Error('Not has ' + key)
        }
        switch (schema[key]) {
            case 'String':
                if (typeof data[key] !== 'string') {
                    throw new Error(key + ' not string')
                }
                break
            case 'Number':
                if (typeof data[key] !== 'number' && typeof data[key] !== 'string') {
                    throw new Error(key + ' not number')
                }
                break
            case 'Boolean':
                if (typeof data[key] !== 'boolean' && typeof data[key] !== 'string') {
                    throw new Error(key + ' not boolean')
                }
                break
            case 'Array':
                if (!Array.isArray(data[key])) {
                    throw new Error(key + ' not array')
                }
                break
            case 'Object':
                if (typeof data[key] !== 'object' || Array.isArray(data[key])) {
                    throw new Error(key + ' not object')
                }
                break
            default:
                if (schema[key] instanceof Array) {
                    if (data[key] instanceof Array) {
                        const subSchema = schema[key][0]
                        for (const subData of data[key]) {
                            try {
                                verifyGenerate(subData, subSchema)
                            } catch (err) {
                                throw err
                            }
                        }
                    } else {
                        throw new Error(key + ' not array')
                    }
                } else if (typeof schema[key] === 'object') {
                    try {
                        verifyGenerate(data[key], schema[key])
                    } catch (err) {
                        throw err
                    }
                } else {
                    throw new Error('Type not working')
                }
        }
    }
}

export const isSchema = (schema: any) => {
    if (typeof schema === 'string') {
        schema = JSON.parse(schema)
    }
    for (const key in schema) {
        switch (schema[key]) {
            case 'String':
                break
            case 'Number':
                break
            case 'Boolean':
                break
            case 'Array':
                break
            case 'Object':
                break
            default:
                if (schema[key] instanceof Array) {
                    if (schema[key].length > 0 && typeof schema[key][0] === 'object' && !Array.isArray(schema[key][0])) {
                        try {
                            isSchema(schema[key][0])
                        } catch (err) {
                            throw err
                        }
                    } else {
                        throw new Error('Type not working')
                    }
                } else if (typeof schema[key] === 'object') {
                    try {
                        isSchema(schema[key])
                    } catch (err) {
                        throw err
                    }
                } else {
                    throw new Error('Type not working')
                }
        }
    }
}