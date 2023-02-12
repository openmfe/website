---
layout: main
title: Why and When to use OpenMFE
priority: 15
summary: OpenMFE is one way to build microfrontends, so use your judgement when it’s the right fit. Not all projects benefit from going with microfrontends anyway, and for those that do, OpenMFE is one option among others. Understand the trade-offs of different approaches to make a good decision.
---

## Microfrontends vs. other Web Architectures

Microfrontends are a very popular architectural approach these days, but they are not the right choice for every project. As always when deciding for or against a software architecture, one should be aware of benefits and drawbacks.

Microfrontends allow building software around business concerns rather than technical ones (often called “verticalisation”), and if done right they allow multiple teams to work independently. But it must be understood that a microfrontend architecture comes with overhead in processes, development and operations.

- Is your project rather small and won’t see much change or growth in a short period of time? (Be honest; unless you are a unicorn start-up, this is probably the case). Build a [well-structured monolith](https://m.signalvnoise.com/the-majestic-monolith/) with one of the many MVC frameworks out there and go sell the thing. A good monolith is much better in the long run than a poor microservice or microfrontend architecture.

- Is your project of medium size and needs to cater for different channels like mobile apps as well? And are you sure they have to be native, rather than, say, be a responsive website or [progressive web app](https://web.dev/progressive-web-apps/)? In this case, go with a multi-tier architecture with a single-page application for the view and invest in clean REST or GraphQL APIs.

- Do you have a project that consists mostly of static, generic content? Static in this context means that it doesn’t change very frequently. Generic means that it’s the same for all users and not dependent on context information such as authentication. In this case, consider [static site generation](/architecture/static-site-generation/) or JAMstack.

If you want to build a successful microfrontend architecture, no matter which of the many flavours you choose, you must (!) do the following things:

- Build teams around business concerns and give them end-to-end ownership of functional parts of the application. So, instead of having something like UI/frontend/backend/database/operations teams, you have something like storefront/catalog/checkout/userprofile teams (if your application is a web store) and each of them owns their UI, frontend, backend, database and infrastructure.

- Invest into building a mature [Design System](/development/ui-design/). <abbr title="User Interface">UI</abbr> consistency in a distributed frontend architecture is hard, and without guidance and tooling, user experience will suffer.

- Speaking about infrastructure, and regardless of application architecture, it is strongly recommend to adopt DevOps practices such as using a <abbr title="Continuous Integration and Continuous Delivery">CI/CD</abbr> pipeline and Infrastructure as Code. In a distributed architecture, the overhead of building and delivering software needs to be minimised as much as possible.

If you (or, the owner of the platform you’re building) is honestly willing and capable to do this, you are on the right way. If you think that microfrontends are just some menial frontend stuff, be prepared for a lot of pain.

## Server-side vs. Client-side Composition

When building a web page from microfrontends, they need to be *composed* at some point, meaning that the UI building blocks need to be amalgamated into an HTML document. This can happen at different stages of the delivery of the document:

- At build time, usually as server-side rendering (SSR): With template languages such as Nunjucks or Liquid, or JavaScript frameworks such as React or Vue, you can deliver a ready-made page transparently to the client. This has several advantages such as reuse of build-time dependencies, but comes at the price of being tied down to a particular solution, also version mismatches of shared dependencies.

- At the edge; this is very similar to server-side runtime composition in that the page is composed before reaching the browser. The difference to server-side rendering is that the composition happens after the build process of individual components.

- At the client side, meaning that individual MFEs are loaded only after the page itself is loaded. This has the downside of requiring additional HTTP requests to build the actual UI, although in practice it is not a problem if you employ good frontend development practices. Client-side composition has the huge advantages of strong decoupling as well as choice of technology.

OpenMFE falls into the category of client-side composition because it is designed for scenarios where decoupling, strong encapsulation and technology agnosticism outweigh the benefits of a tighter integration. It addresses the shortcomings of the client-side approach through prerendering capabilities which allow embedding server-side skeletons in a way that doesn’t sacrifice encapsulation.

## Native Web Components vs. Frameworks

Frameworks can be used with all three composition patterns whereas native web components (custom elements) are a client-side technology. However, if frameworks are used with client-side composition, they do not benefit from sharing dependencies – unless the dependency management is implemented on the client-side as well.

If you go for client-side composition, then the choice between picking a framework and going [#frameworkless](https://twitter.com/hashtag/frameworkless) is basically between accepting some degree of overhead versus being deliberately lightweight, which potentially implies more effort and less out-of-the box features. A compromise might be a lightweight framework such as Lit which ultimately gives you custom elements with just a marginal overhead.

Using more heaviweight solutions like React, Vue or Angular may result in unnecessary huge artefacts; they are not well-suited for client-side microfrontends. While Typescript is a great language, it produces horrible JavaScript code. JSX is convenient to use, but builds a lot of overhead into your artefacts. Webpack and other build tools are often configured to build artefacts with broad browser support; even for browsers long obsolete, and thereby producing ludicrous amounts of transpilation code. And all that excess code does not only add volume that needs to be transmitted over the wire, but also consumes CPU and memory.

If you don’t have much experience with custom HTML elements, please know that they are not very different from JSX components. They admittedly lack some features such as accepting non-scalar attributes (which OpenMFE addresses by allowing JSON in attributes), but in practice this should not be an issue.

Native web components with custom elements have one huge benefit: They can be embedded into virtually any HTML page. This is very handy in general, but makes them extra compelling in situations where they run in different environments at the same time. This allows gradual migrations of a large website to a newer architecture, especially if microfrontend capabilities are reused in different parts of a website.

Anyway, remember: Whatever you do, never put developer experience over user experience! If you decide to use a fat framework because it’s the one you know or it has a nice VS Code plugin, you are betraying your own users.

## Native Event-mechanism vs. Event Libraries

OpenMFE relies on the native event mechanism of the browser, using the [event propagation](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events) mechanism with [CustomEvents](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent). This functionality exists in every current browser, and it covers pretty much all needs.

It should be mentioned that browser events work in a “streaming” model rather than a queue. What that means is that events are not buffered or retained and therefore cannot be replayed. If this is a requirement of your platform, you will have to an event library that keeps a history of events. However in most scenarios, this is not necessary if orchestration is properly implemented. OpenMFE favours the portability of relying on native mechanisms over support for these sorts of edge cases.

Another argument sometimes brought up against using the native event mechanisms is it allows “bubbling”, i.e. propagation through the DOM tree of a hierarchy of HTML elements. This is not a problem *per se*, but could be seen as detrimental to encapsulation. OpenMFE mandates that events are emitted by the web component itself (via `this.dispatchEvent`) and recommends that they be caught on the `document` level. Yes, this will allow them to bubble, but we currently don’t see how this would be a problem in practice.

## Strength of Encapsulation

Encapsulation means that software modules are designed in a way that internal logic does not leak out to their environment and vice versa. Having code only communicate through explicit interfaces, or “contracts”, is very crucial to keep code decoupled and allow it to evolve independently and reduce unintended side effects. This is especially important in distributed architectures which accept the overhead organising parallel development in exchange for scalability.

One of the biggest strengths of OpenMFE is that it helps projects that opt for native web components with custom events to encapsulate the microfrontend logic from its environment through strict provisions regarding their interaction with the environment. Because only using native browser features doesn’t prevent leaking logic in and out. For instance, it is very tempting to load CSS from the outside or share certain dependencies at runtime. OpenMFE very explititly forbids these shortcuts, because they will undermine its primary tenets of portability, retrofittability and reusability.

These may not be very important for a small, coherent projects; the overhead of strong encapsulation may not outweigh its benefits. But in large organisations, strong encapsulation is indispensable, especially with a growing number of microfrontends and their owning teams.