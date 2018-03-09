export const isJSON = (json) => {
    return typeof json === 'object' && !Array.isArray(json)
}

export const containCompare = (data, correctData) => {
    for (const key in correctData) {
        if (!data.hasOwnProperty(key) || data[key] !== correctData[key]) {
            return false
        }
    }
    return true
}

export const deepCompare = (data, correctData) => {
    if (Array.isArray(data) !== Array.isArray(correctData) || typeof data !== typeof correctData) {
        return false
    }
    if (Array.isArray(data)) {
        if (data.length !== correctData.length) {
            return false
        } else {
            for (const i of data.keys()) {
                if (!deepCompare(data[i], correctData[i])) {
                    return false
                }
            }
        }
    } else if (typeof data === 'object') {
        for (const key in data) {
            if (!deepCompare(data[key], correctData[key])) {
                return false
            }
        }
    } else {
        if (data !== correctData) {
            return false
        }
    }
    return true
}