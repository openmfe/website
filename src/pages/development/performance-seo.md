---
layout: main
title: Performance and SEO
priority: 0
summary: Great performance and search engine optimisation are important for any website. With client-side microfrontends, this can be a bit challenging. So, let’s discuss how we can even outperform other approaches with the right techniques.
---

## Static Site Generation

When combined with Static Site Generation plus

Most parts of a website don’t have to be rendered dynamically on the client side. And they don’t have to be rendered on the server side on each request either.

## Prerendering



- dedicated prerendering page

## Avoiding overhead

Most of them are not unique to microfrontends, but as we often have multiple microfrontends on one web page and even do

- Don’t put DX over UX!
- No transpilation
- No fat frameworks and libraries
- Use something like Rollup + plugins to shave off every unnecessary bit
- Use modern CSS …

Do not:
- In order to share styles, you can use a design library. But do not share CSS files on a host page! This will create a dependency. It can make sense to put generic icons on a CDN, but even they should be treated as “service” with a contract, i.e. no breaking changes in URLs and appearance. Versioning highly recommended.


## Leveraging the HTTP Protocol

- Caching
    - headers
    - query string cache buster


- HTTP/3
- Demystifying HTTP/2: There is no push (a word about a technique that has been hyped for no good reason)
