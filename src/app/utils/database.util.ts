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
                } else if (!a) {
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
            } else if (!a) {
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

export const query = (conditions, db, isFindOne = false) => {
    let selected: any[] = []
    for (const data of db) {
        let isCorrect = false
        for (const condition of conditions) {
            const sections = condition.key.split('$', 2)
            let nested = data
            const keys = sections[0].replace(/^\.|\.$/g, '').split('.')
            for (const key of keys) {
                if (nested[key] !== undefined) {
                    nested = nested[key]
                } else {
                    isCorrect = false
                    break
                }
            }
            if (sections.length > 1) {
                // filter sub data
                if (!Array.isArray(nested)) {
                    nested = query([{ key: sections[1], value: condition.value }], [nested])
                } else {
                    nested = query([{ key: sections[1], value: condition.value }], nested)
                }
                if (nested.length > 0) {
                    const setNest = (obj, keys, val) => {
                        if(keys.length > 0){
                            const key = keys.shift()
                            obj[key] = setNest(obj[key], keys, val)
                        } else{
                            obj = val
                        }
                        return obj
                    }
                    if (isFindOne) {
                        setNest(data, keys, nested[0])
                    }
                    isCorrect = true
                } else {
                    isCorrect = false
                }
            } else {
                if (typeof nested === 'boolean') {
                    condition.value = JSON.parse(condition.value) // ?
                }
                isCorrect = nested == condition.value
            }
            if (!isCorrect) {
                break
            }
        }
        if (isCorrect) {
            selected.push(data)
        }
    }
    return selected
}