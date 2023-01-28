const beautify = require("js-beautify").html
const minify = require("html-minifier-terser").minify
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight")
const Markdown = require("markdown-it")
const Prism = require("prismjs")
const YAML = require("yaml")
const openmfe = require('@openmfe/eleventy-plugin');
require(`prismjs/components/prism-yaml.js`)

module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy({
        "src/assets": "_assets",
        "src/assets/favicon.ico": "/favicon.ico",
    })
    eleventyConfig.addWatchTarget('./src/styles')
    eleventyConfig.addPlugin(syntaxHighlight)
    eleventyConfig.setLibrary("md", Markdown({ html: true }).disable("code"))


    eleventyConfig.addPlugin(openmfe, {
        manifest: 'https://demos.lxg.de/current-weather/frontend/openmfe/manifest.yaml'
    })

    // BEGIN custom markdown and highlighter for MFE catalog
        const hightlighter = (code, lang) => Prism.languages[lang]
            ? `<pre class="language-${lang}"><code class="language-${lang}">${Prism.highlight(code, Prism.languages[lang], lang)}</code></pre>`
            : code

        eleventyConfig.addPairedNunjucksShortcode("highlight", hightlighter)

        const markdown = new Markdown({
            html: true,
            disable: ["code"],
            highlight: hightlighter
        })

        eleventyConfig.addFilter("typeof", value => typeof value)
        eleventyConfig.addPairedNunjucksShortcode("markdown", content => markdown.render(content))
        eleventyConfig.addFilter("markdown", content => markdown.render(content))
        eleventyConfig.addFilter("imarkdown", content => markdown.renderInline(content))
        eleventyConfig.addFilter("yaml", content => YAML.stringify(content))
        eleventyConfig.addFilter("highlight", (content, lang) => hightlighter(content, lang))
        eleventyConfig.addFilter('toJSArray', function(properties){
            return JSON.stringify(properties);
        })
    // END custom markdown and highlighter for MFE catalog

    // Compress HTML for prod
    if (process.env.ELEVENTY_ENV === "production") {
        eleventyConfig.addTransform("minify", async (content, path) => {
            return path.endsWith(".html")
                ? await minify(content, {
                        minifyJS: true,
                        minifyCSS: true,
                        removeAttributeQuotes: true,
                        removeScriptTypeAttributes : true,
                        removeStyleLinkTypeAttributes: true,
                        collapseWhitespace: true
                    })
                : content
        })
    }

    // Beautify HTML for dev
    else {
        eleventyConfig.addTransform("beautify", async (content, path) => {
            return path.endsWith(".html")
                ? beautify(content, { preserve_newlines: false })
                : content
        })
    }

    return {
        dir: {
            input: "src/pages",
            output: "dist",
            layouts: "../templates",
            includes: "../templates",
            data: "../data"
        },
        passthroughFileCopy: true,
        templateFormats: ["njk", "md", "html"],
        htmlTemplateEngine: "njk",
        markdownTemplateEngine: "njk"
    }
}
