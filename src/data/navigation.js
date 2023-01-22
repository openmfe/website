const fs = require('fs')
const matter = require('gray-matter')
const glob = require('glob')
const path = require('path')

module.exports = async () => {
    const dir = path.normalize(`${__dirname}/../pages`)
    const files = glob.sync(`${dir}/**/*`, { nodir : true }).sort()
    const pages = []

    files.forEach(file => {
        const content = fs.readFileSync(file).toString()
        const fm = matter(content)

        if (fm.data.title && fm.data.priority) {
            const slug = getSlug(dir, file)

            slug && pages.push({
                slug,
                permalink : `/${slug}/`.replace(/\/+/, '/'),
                content: fm.content,
                ...fm.data,
             })
        }
    })

    return getNavigation(pages)
}

function getNavigation(pages, level = 1) {
    return Object.fromEntries(pages
        .filter(page => page.slug.split('/').length === level)
        .sort(sortByPrio)
        .map(page => {
            return [
                page.slug || "index",
                {
                ...page,
                children: Object.fromEntries(Object.entries(getNavigation(pages, level + 1))
                    .filter(nav => page.slug && nav[1].slug.indexOf(page.slug) === 0)
                    .sort(sortByPrio))
                }
            ]
        }))
}


function sortByPrio(a, b) {
    return a.priority - b.priority
}

function getSlug(basePath, filename) {
    return filename
        .replace(new RegExp(`^${basePath}/`), '')
        .replace(/\..*$/, '')
        .replace("index", '')
}
