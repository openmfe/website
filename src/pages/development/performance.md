---
layout: main
title: Microfrontend Performance
priority: 25
summary: Great performance is important for the user experience of any web application. With microfrontends, it is especially important to be diligent, because mistakes and bad practices multiply. Luckily, there are lots of areas for optimisation.
---

## What is “Good Performance”?

We all know how bad UI performance feels sluggish and unnerving. But how to define, achieve, and measure *good* performance? A fair starting point is probably to avoid the things we perceive as “bad”. So, to make sure the site loads fast and responds instantly to interaction. For this purpose, Google have defined performance indicators called [“web vitals”](https://web.dev/vitals/). We will not go into details here; it is however strongly suggested to familiarise with them. To measure performance, use tools like Site Speed and Lighthouse.

## Technical Optimisation

When optimising performance for good user experience as indicated by web vitals, the main areas to focus on are network and CPU, and memory. While a low footprint in those areas is not enough, they lay the foundation for everything else.

### Keep it Simple, Keep it Lean

Being resourceful is a trade-off with convenience. There are great technologies that make developers more effective and which reduce risk and mental load. But at the same time, they can add a lot of overhead to the software.

- **Frameworks** that are designed for single-page applications can be used for stand-alone modules as well. But often they add a lot of features to your code that is unnecessary in that context. Also, the architectural design decisions and trade-offs are made for stand-alone use cases. If you use a framework at all, use one that is lightweight and fit for purpose, such as [Lit](https://lit.dev/).

- There are tons of **libraries** that you can build into your project which solve a problem in an elegant way that might otherwise take hours or days to code yourself. However, many libraries suffer from feature creep, and you might be using only a few percent of the code that now is built into your project. Adding a library to a project, especially if it becomes a runtime dependency, needs to be a very conscious decision.

- **Transpilation** rewrites code to run on environments that lack newer language features. Current browsers support the relevant JavaScript features directly, so this is rarely needed for compatibility today; where you still see it is with TypeScript and framework-specific syntax such as JSX, which add value during development but produce output with overhead in volume and runtime cost.

- **Polyfills**: Similar to transpilation, polyfills help with backwards compability for browsers. But instead of translating the syntax, they add API features of the browser in a transparent way. Same as transpilation, polyfills are not needed in most cases today and should only be added seletively in edge cases.

Of course, we don’t need to do everything from scratch, even with a lightweight mindset, we can use tools like Rollup to bundle and optimise our artefacts.

How much is too much? It’s hard to give a threshold in absolute numbers, but as a rule of thumb, a good microfrontend doesn’t need more than 50 kB or more than 4 network requests.


### Leveraging the HTTP Protocol

If you have control over your infrastructure (and you should!), there are several options to increase performance at the protocol level:

#### Use the Latest HTTP Version

Using the latest HTTP protocol version is the first thing you can do, and it doesn’t require any changes to the way your application is built. HTTP/2 is signficantly faster than HTTP/1, and HTTP/3 is even faster due to network throughput optimisations.

#### HTTP Caching

The HTTP protocol, in all versions, provides several techniques for caching:

“Hard” caching means that the server tells the client to keep a certain file in its local cache until a given expiration time through the [Cache-Control header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control). This makes subsequent requests to the same file extremely fast, because they only need to be fetched from the local cache. It is recommended to set the `max-age` to at least a year. Combine this with cache busting via [query string versioning](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/QueryStringParameters.html) when resources are updated.

“Soft” caching is when the server doesn’t tell the client to keep the file in the local cache but instead provides a fingerprint as part of the response (the [“Etag”](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag)). On subsequent requests, the browser passes the fingerprint is passed as [“If-Match”](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Match) header. Should the fingerprint still match, the server responds with a 304 (“Not modified”) status code and an empty body. This should be used in scenarios where hard caching isn’t possible, so that even as a request/response roundtrip is necessary, it will be fast.

#### Preload Hints

The HTTP `Link` header lets a response hint at secondary resources the client should fetch early. Its predecessor, HTTP/2 Server Push, was [removed from browsers](https://www.ctrl.blog/entry/http2-push-chromium-deprecation.html), but [preload hints](https://www.keycdn.com/blog/http-preload-vs-http2-push) achieve almost the same effect: the response to the primary resource, such as an HTML page, carries a `Link` header pointing at the resources to load next.

A related caution: do not reflexively split code for HTTP/2. Multiplexing allows parallel downloads over one connection, but when all chunks are needed anyway, splitting only adds round-trips, so one larger artefact is usually better than several small ones.

```http
Link: </styles.css?hash=23e7da>; rel=preload; as=style,</main.js?hash=f12b65>; rel=preload; as=script
```

### Rendering Performance

What actually is good for the user are UI stability and responsiveness. So, the order of loading and rendering is important as well.

### Above-the-fold Rendering

When long HTML pages have a lot of dynamic content or large assets, it can make sense to prioritise the items that are in the viewport when the page is first loaded. Borrowing a term from newspapers, this approach is called “above-the-fold”. This can be employed with microfrontends as well. There are different ways to implement this; the important part is that the host page detects which elements are within the viewports and loads only these (or loads them before others).

Let’s say you have five microfrontends on the page, of which three are below the fold. Let’s also assume that each microfrontend needs to chain-load 3 more static assets. Without the above-the-fold optimisation, all JavaScript files would be loaded and only then the secondary assets would be retrieved. If the host page doesn’t load the JavaScript files for the lower three microfrontends, the upper ones will become ready much sooner.

### Skeletons and Prerendering

Skeletons are placeholders for deferred web content, their purpose is to guarantee UI stability and if possible even convey some early information until the actual microfrontend is loaded. The way this works is that HTML snippets with inline CSS are placed between the opening and the closing tag of the custom element. As the tags are ignored by the browser until the custom element is registered, we can place any content there:

```html
<my-microfrontend>
    <div style="width: 100%; height: 100%; border: 1px dotted #aaa; background: #eee; display: flex; align-items: center; justify-content: center">
        <div>
            LOADING …
        </div>
    </div>
</my-microfrontend>
```



This placeholder can be handcrafted, but every OpenMFE microfrontend is expected to provide a prerendering API endpoint which should provide suitable content. The prerendering endpoint is expected to accept the same parameters as query strings as the frontend accepts as attributes. This allows creating matching prerendered content for a certain configuration of microfrontend.

The ideal output of the prerendering endpoint very much depends on the use case of the microfrontend. It is definitely an opportunity for adding SEO-relevant content into the page, but at the same time it can get stale if the page isn’t refreshed frequently (which is not unusual with [Static Site Generation](/architecture/static-site-generation/)).

From a technical perspective, the prerendered output must be simple HTML with inline CSS. JavaScript is not allowed because it could potentially interfere with the host page, which is can cause side effects and security issues. CSS `<style>` blocks are not allowed, because the HTML specification does not allow them in the body of an HTML document. You can however use SVG, even with animations.

For an example of prerendering output, see the [Hotel Cards microfrontend](https://github.com/openmfe/demo-microfrontend/blob/main/backend/src/prerender.js).

A word of caution: Technically, it would be possible that the custom element “takes over” the prerendered output: In such a scenario, most of the HTML would be inserted into the page, and the custom element would ingest it into it’s Shadow DOM. However, this is not a good idea and should be avoided: The custom element cannot know which version of itself generated the prerendered HTML, or if it has been generated by itself at all. The prerendered output should always be discarded/replaced by the custom element. What it can do, though, is fill the Shadow DOM with the skeleton HTML until the real content can be rendered, e.g. if it depends on the response of an API call. This can improve the user experience a lot.

Embedding the prerendered content can happen at build time or through edge side includes (ESI), which might look as follows:

```html
<my-microfrontend some-attr="foo" other-attr="bar">
    <esi:include src="https://backend.example.com/prerender?some-attr=foo&other-attr=bar" />
</my-microfrontend>
```

Or with the [OpenMFE plugin for Eleventy](https://github.com/openmfe/eleventy-plugin/):

{% raw %}
```twig
<my-microfrontend some-attr="foo" other-attr="bar">
    {% openmfe "my-microfrontend", { "some-attr" : "foo", "other-attr" : "bar" } %}
</my-microfrontend>
```
{% endraw %}

### Structured Data for SEO

Prerendering is also important for SEO. While modern search engines can read dynamic content and Shadow DOM in custom elements, it is not visited as often as server-side rendered content as crawling dynamic content is computationally more expensive.

Another possibility to increase the SEO relevance of web pages is the embedding of [structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data). With OpenMFE, a microfrontend can expose an (optional) endpoint to provide structured, or: semantic, data. If present, such an endpoint is expected to return a [JSON-LD](https://www.w3.org/2001/sw/wiki/JSON-LD) object with [schema.org entities](https://schema.org/docs/full.html).

It depends on the use case of a microfrontend if providing such data and the correstponding endpoint. It should be considered in any case, because it is easy to implement and can have positive effects on the discoverability of your content by search engines and users.

## Static Site Generation

Even in a microfrontend architecture, not every block of logic needs to be implemented as a microfrontend component. Most parts of a website don’t have to be rendered dynamically on the client side. And they don’t have to be rendered on the server side on each request either. For page content that is mostly static and generic, such as meta headers and footers, [static site generation](/architecture/static-site-generation/) is a great complement to microfrontends. Statically generated pages, or sets of pages, follow the same paradigm as microfrontends, with the difference that the bounded context is the page itself rather than elements on the page.
