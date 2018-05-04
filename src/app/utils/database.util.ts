const REGEX_TOKEN = /{{\s*\$db.([^}}\s]+)\s*}}/g

export const hasDbToken = (template) => {
    if (typeof template !== 'string') {
        template = JSON.stringify(template)
    }
    return new RegExp(REGEX_TOKEN).test(JSON.stringify(template))
}

export const extractDbToken = (data, correctData) => {
    let temp: any = []
    if (Array.isArray(data) !== Array.isArray(correctData)) {
        return false
    }
    if (Array.isArray(correctData)) {
        if (data.length !== correctData.length) {
            return false
        } else {
            for (const i of correctData.keys()) {
                const a = extractDbToken(data[i], correctData[i])
                if (Array.isArray(a)) {
                    temp = [...a, ...temp]
                }
                if (a === false) {
                    return false
                }
            }
        }
    } else if (typeof correctData === 'object') {
        for (const key in correctData) {
            if (!data.hasOwnProperty(key)) {
                return false
            }
            const a = extractDbToken(data[key], correctData[key])
            if (Array.isArray(a)) {
                temp = [...a, ...temp]
            }
            if (a === false) {
                return false
            }
        }
    } else {
        if (new RegExp(REGEX_TOKEN).test(correctData)) {
            const key = (new RegExp(REGEX_TOKEN).exec(correctData) || []).slice(1).pop()
            const value = data
            return [{
                key: key,
                value: value
            }]
        } else {
            if (data !== correctData) {
                return false
            }
        }
    }
    return temp
}

export const query = (conditions, db) => {
    let selected: any[] = []
    for (const data of db) {
        let isCorrect = false
        for (const condition of conditions) {
            const keys = condition.key.split('.')
            let nested = data
            for (const key of keys) {
                nested = nested[key]
            }
            if (typeof nested === 'boolean') {
                condition.value = JSON.parse(condition.value) // ?
            }
            if (nested == condition.value) {
                isCorrect = true
            } else {
                isCorrect = false
                break
            }
        }
        if (isCorrect) {
            selected.push(data)
        }
    }
    return selected
}