export const mapEnvironments = (template, environment) => {
    if (typeof template !== 'string') {
        template = JSON.stringify(template)
    }
    const regex_token = /{{\s*\$env.([^}}\s]+)\s*}}/g
    template = template.replace(regex_token, (match, capture) => {
        return environment[capture]
    })
    return JSON.parse(template)
}

export const mapDatabase = (template, database) => {
    if (typeof template !== 'string') {
        template = JSON.stringify(template)
    }
    const regex_token = /{{\s*\$db.([^}}\s]+)\s*}}/g
    template = template.replace(regex_token, (match, capture) => {
        const keys = capture.split('.')
        let nested = database
        for (const key of keys) {
            nested = nested[key]
        }
        return nested
    })
    return JSON.parse(template)
}

export const mapParams = (template, params) => {
    if (typeof template !== 'string') {
        template = JSON.stringify(template)
    }
    const regex_token = /{{\s*([^}}\s]+)\s*}}/g
    template = template.replace(regex_token, (match, capture) => {
        return params[capture]
    })
    return JSON.parse(template)
}