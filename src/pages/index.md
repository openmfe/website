---
layout: main
title: Home
priority: 10
---

# The OpenMFE Standard

With OpenMFE, highly agile teams can build **microfrontends** ¹ with **browser-native** ² technology, be **strongly encapsulated** ³ and expose **clearly defined interfaces** ⁴ following an **open standard** ⁵.

## ¹ What Are Microfrontends?

Technically speaking, microfrontends are a way to build web applications in a modular way. Each microfrontend is an independent solution for a “business concern”, meaning that it is a self-contained, small application which can be integrated into a web page.

This may not sound impressive, but it is a very powerful concept to build large-scale web applications in a “vertical” way where deliverable artefacts are aligned with business logic rather than technology. The opposite would be a “layered” architecture where artefacts are aligned with technical concerns such as frontend, backend, database.

## ² Browser-native

Many approaches to microfrontends rely on frameworks for composition and communication. But frameworks are not necessary; and often they even undermine the tenets of microfrontend. For example, while teams are supposed to design, build, and run microfrontends independently, frameworks tend to force build mechanisms or shared state—which leads to tight coupling and implicit dependencies. OpenMFE relies on native web components and browser events. This way, we produce extremely lightweight microfrontends which can integrate into any web application with a few lines of JavaScript code.


## ³ Strong Encapsulation

A modular application can only be successful if its components do not depend on each other. They must not share state, they must not know about each other, and they must not interfer with the environment or have other side effects. Because if they do, they become tightly coupled to each other or the environment. OpenMFE governs how microfrontends behave at runtime and thereby ensures that they do not break their boundary.

## ⁴ Clearly Defined Interfaces

Any inbound or outbound messaging must be publically documented in an interface contract. By entering a contract and guaranteeing not to break it (in the sense of semantic versioning), updates can be rolled out at any time without the integrating environment even knowing. For specifying the interface contract, OpenMFE defines a manifest standard, similar to OpenAPI/Swagger.

## ⁵ Open Standard

By publishing this standard as Open Source and making it as technology-agnostic as possible, developers and organisations can gradually explore the microfrontend pattern without any risk. With two lines of code, understood by any common browser, OpenMFE microfrontends can be integrated into any webpage. And as the microfrontend transformation progresses, standardisation supports a clean architecture.
