export const isJSON = (json) => {
    return typeof json === 'object' && !Array.isArray(json)
}