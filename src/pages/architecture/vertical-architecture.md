---
layout: main
title: Verticalisation
priority: 20
---

# Verticalisation

## Building Websites With Microfrontends

Microfrontends can be used stand-alone, but usually they are combined into larger applications, such as a sales platform. In the following graphic, each of the blue-bordered boxes is one microfrontend: The main ones provide search, filter and result capabilities for a flights shop, but even the smaller ones at the top (site search, favourites, shopping cart) are microfrontends in their own rights.

<div class="image">
    <img src="/_assets/images/mfe-page.webp" alt="Microfrontends on a page">
</div>

By “slicing” the website into multiple independent blocks, capabilities can be delivered in parallel. As microfrontends are loosely coupled and expose a clearly defined interface contract to their environment, there is no risk of breaking the platform with this decentralised approach.

## Horizontal vs. Vertical Architecture

It is important to note that microfrontends are far more than UI elements on web pages. In fact, a microfrontend is a self-contained full-stack web application which usually, despite its name, also contains backend and persistence functionality. Together with other microfrontends, it is integrated on web pages, which in such an architecture act as mere integration points.

<div class="image">
    <img src="/_assets/images/verticalisation.webp" alt="Horizontal to Vertical">
</div>

This architectural style is called “verticalisation”: Instead of building large web applications in layers that are driven by technical concerns, they are build in full-stack components defined by a logical scope. As such, microfrontends are related to microservices which also are self-contained and part of a loosely coupled ecosystem as well. Even more, they extend the paradigm of service-based decoupling to the frontend of a web application.

## The OpenMFE Specification

In order to achieve the objectives of loose coupling and evolvability, we need rules that govern the interoperability of microfrontends without taking away the freedom of teams to build their microfrontends in the best possible way. This is why we have developed the [OpenMFE specification](/architecture/specification/) which governs how microfrontends need to behave at runtime. It contains general provisions that describe how encapsulation is achieved as well as rules for prerendering and semantic data. Finally, it contains a formalised way to describe the interfaces of a microfrontend in a manifest file.

There are [different ways of building](https://micro-frontends.org/) a microfrontend-based website. OpenMFE follows the *client-side* integration approach, meaning that our microfrontends are [web components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) and integrated into a web page in the browser. We have chosen this approach mainly for two reasons: First, it allows a team to deliver updates of their microfrontend to the client at any time, without a dependency on a build pipeline. Second, by encapsulating all HTML, CSS, and JavaScript in the [Shadow Root](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM) of a custom element, we achieve a strong separation of the microfrontend from its environment.


## Frameworks

There are different frontend frameworks which are more or less suited for building microfrontends. In our case, however, the best framework is no framework. This may seem strange, but the reality is that the native functionality of browsers has become very powerful over the last few years, and as we don’t need to support old browsers anymore, there’s not much missing! Of course, we use libraries for things like [localisation](/patterns/localisation/) or other purposes so that we don’t have to reinvent the wheel, but we will think very hard before we decide to use a framework like React that adds a lot of overhead in terms of code and client resource usage.

That said, there are lightweight framework with a reasonable trade-off between developer experience and overhead, such as [Lit](https://lit.dev/).

## Curious To Learn More?

If you would like to learn more about the development of a microfrontend, please have a look at our [intro tutorial](/tutorials/realworld-microfrontend/) with a step-by-step analyisis of a real, yet simple microfrontend.
