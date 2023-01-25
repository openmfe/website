---
layout: main
title: Static Site Generation
priority: 30
excerpt: With websites that attract millions of visitors each day, cheap and fast generation of web pages is a significant success factor. Static Site Generation (SSG) means that web pages are pregenerated statically once and then deployed to a CDN. SSG is the perfect complement to OpenMFE microfrontends in many cases and a recommended (but not mandatory) pattern.
---

# Static Site Generation

With websites that attract millions of visitors each day, cheap and fast generation of web pages is a significant success factor. Static Site Generation (SSG) means that web pages are pregenerated statically once and then deployed to a CDN. SSG is the perfect complement to OpenMFE microfrontends in many cases and a recommended (but not mandatory) pattern.

## How it works

To understand how SSG works, let’s look at how web pages are managed in conventional business websites. Usually, there is some sort of Content Management System (CMS) such as WordPress, Typo3, Joomla or Hybris. This CMS has two purposes, the actual administration of editorial content (texts, images, navigation) as well as the rendering of said content into web pages based on templates.

This is very convenient, but it also creates several problems, as we will see later. As most content doesn’t change very frequently, we can simply pregenerate pages when necessary and put them onto a static file server or a CDN. The content, in this case, is maintained as plain text files, for example using [Markdown](https://commonmark.org).

<div class="image">
    <img src="/_assets/images/ssg-simple.webp" alt="">
</div>

Fun fact, this very website is built with static site generation using a tool called [Eleventy](https://www.11ty.dev/).


## Microfrontends and SSG Sites

Statically generated sites are the perfect complement for microfrontends, especially when they’re built with OpenMFE.

<div class="image">
    <img src="/_assets/images/mfe-composition.webp" alt="">
</div>

The *static* parts of the webpage are build with the SSG while *dynamic* parts are implemented as microfrontends:

| Static (→ SSG)  | Dynamic (→ MFE)           |
|-----------------|---------------------------|
| generic         | user or context specific  |
| cachable        | not easily cacheable      |
| long-lived      | changes frequently        |


See the Architecture pages regarding integration patterns.

## Advantages and Challenges

Static site generation has several advantages; in very simple environments as well as in highly complex ones:

- As there are no moving parts at runtime, there are much lower operational costs.
- Static content doesn’t need processing on the server-side, so you get very fast response times, which is good for SEO and user experience.
- There is no CMS that can be attacked at runtime, therefore the setup is very secure.
- The application is easier to maintain; test can happen at build-time before anything is actually deployed.
- Where content already exists, thousands of pages can be created within mere seconds.

But nothing is perfect, there are a few challenges as well:

- This setup does not make sense without a working CI/CD pipeline.
- As the rendering is not an inherent part of the CMS, previewing content on generated pages can be difficult. Most Headless CMSes have support for previewing of some sort, but it takes some extra setup and will almost never be as smooth as in a runtime CMS.
- SSG alone does not work for content that is changing frequently or user-specific. This needs to be solved through JavaScript on the client side via microfrontends or the JAMstack pattern (see below).

Nevertheless, it is a highly useful pattern and applicable in many web applications. Especially when you look at the advanced patterns below.

## Headless CMS

In a real-world scenario, you will have a hard time convincing editors to manage content in a Git repository. So, a common complement to a SSG setup is a so-called “Headless CMS”. This is a CMS which does not have templating and page rendering capabilities. Instead it deliveres content through a data API for consumption by a dedicated rendering mechanism, in our case the static site generator:

<div class="image">
    <img src="/_assets/images/ssg-headless-cms.webp" alt="">
</div>

## Advanced SSG Patterns

### Multiple Content Sources

Often you will find that a page will need content from different sources. For instance, imagine you are building pages to show how beautiful your holiday destinations are. On such a page, you want product information about hotels, you want editorial content, and you may want to have seasonal climate data. All these data come from different sources, but this is no problem for the SSG as it can fetch from an arbitrary number of APIs to build a set of pages.

<div class="image">
    <img src="/_assets/images/ssg-multi-content.webp" alt="">
</div>

### Multiple SSGs

In a large-scale scenario, you could have multiple static site generators running in parallel and contributing different parts of the overall website. Each SSG would be responsible for one part of the site; for example one SSG could deliver to `example.com/flights` whereas another one would deliver to `example.com/hotels`:

<div class="image">
    <img src="/_assets/images/ssg-multi-ssg.webp" alt="">
</div>

The advantage of this setup is that each team owns a set of pages and does not have a conflict with, or a dependency on, another team. In such cases, you might even want two layers of CDNs, one for the team(s) owning the SSG to deliver their pages and then the “real” customer-facing CDN which gets the pages from the internal CDNs. This is a little bit of overhead, but it allows teams to deliver autonomously and put the overall integration into the hands of a dedicated platform team.

Of course, this pattern can be combined with the “multiple content sources” pattern. In fact, this is what you will see on very large sites: They have multiple SSGs and each getting content from one or more content sources. They all come together on the CDN which again serves multiple websites, languages, countries and brands.

### JAMstack

A term you hear often together with SSG is “JAMstack”, where JAM stands for JavaScript, APIs and Markup. This means that such an application is build statically first and is then enriched with JavaScript on the client side which connects to APIs to get dynamic data. So, the difference between “Static Site Generation” and “JAMstack” is that SSG only refers to the fact that web pages are pregenerated and deployed to a CDN, whereas JAMstack refers to a full application stack.

In the context of the Modular Web Architecture, JAMstack is a valid pattern; however it overlaps a bit with microfrontends: Both approaches result in modular frontend solutions, however, the JAMstack integrates functionality on the page level, whereas a microfrontend is a stand-alone component and can be shared across pages. Therefore, we will prefer microfrontends for client-side functionality unless the use case is really about page functionality.
