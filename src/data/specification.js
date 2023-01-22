const fetch = require('node-fetch')
const url = "https://raw.githubusercontent.com/openmfe/specification/v1.1/specification.md" // important: load from tags, not main branch

module.exports = async () => {
    return await (await fetch(url)).text()
}
