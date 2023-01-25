---
layout: main
title: Behind the OpenMFE Spec
priority: 80
excerpt: The OpenMFE Specification is a standard for building microfrontends. On this page, we explain the thoughts and ideas behind the specification.
---

# Behind the OpenMFE Specification

The [OpenMFE Specification](/architecture/specification/) is a standard for building microfrontends.

Why do we need a standard for this? Indeed, a microfrontend can be built simply by creating a web component and documenting it in a README file. But this would leave too much room for interpretation, and might lead to problems when integrating such microfrontends. On this page, we explain the thoughts and ideas behind the specification.

The specification is divided into several parts: definitions, formats, general provisions, configuration, communication and manifest. The definitions, formats and general provisions set constraints for the implementation to allow interoperability, the configuration and communication chapters govern the inbound and outbound interaction via attributes and events, and the manifest part describes how the microfrontend provides a formal self-description.

## General Provisions

The specification starts with a section called *General Provisions* which describe how the microfrontend must be implemented and behave at runtime. This is mainly achieved by rules governing which functionality of the browser must or must not be used and by referring to secondary specifications such as the [Custom Element specification](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements).

While these general provisions are referring to implementation details, they are crucial to achieve the goals of the isolation and decoupling of the microfrontend from its environment: Loading a microfrontend means loading foreign code into a website. Of course, code should only be loaded from trusted sources anyway, but even then it can cause unintended effects. A microfrontend, even one that is implemented as a custom element with Shadow DOM and thereby achieving general encapsulation of its internals, has full access to the DOM tree and the JavaScript APIs of the host document, and it might not be obvious to a developer which types of operations are detrimental to module isolation.

For instance, a microfrontend would technically be able to modify the DOM tree of the host page by injecting additional style sheets, but the OpenMFE specification will forbid this behaviour, because it is prone to cause unintended side effects like the modification of the host page’s appearance, and as it depends on an assumption of the host page’s structure. A common problem is that it is not possible to register fonts via a `@font-face` rule within the shadow DOM, so developers may be tempted to inject fonts by adding a stylesheet to the `<head>` section of the host document that would load the font from there. This, however, may lead to collisions if the same font name is already taken in the host document, but used in a different way (for example, bold and italic variants mapped to different typefaces).

In order to separate the microfrontend and the host page implementations and make them independently evolvable, the microfrontend must not make assumptions about, or interfere with, its environment. The same is true vice versa for the host environment; it must not interact with internals of the microfrontend directly. But as these are hidden in the Shadow DOM, it is unlikely that this happens inadvertently.

Another example is a provision that forbids a microfrontend to define own link targets and demands that links be injected through configuration: The reason for this is that clicking a link alters the state of the entire system and thereby breaks the boundary between the microfrontend and the host context.

The specification also demands that the microfrontend must adapt its size to fill the parent container. Generally, “responsive” layouts which adapt to their environment are an established practice in web development, but they are scoped to the entire page are based on the viewport dimensions, not the containing element. A microfrontend, however, cannot make assumptions about the layout of its context, therefore the only frame of reference has to be the containing element. The specification does not govern how exactly the microfrontend achieves this, as there are multiple different ways depending on the implementation.

The specification furthermore demands that the URL to the web component of the microfrontend is publicly accessible and documented in the manifest file. It is expected that updates to the microfrontend are published under the same URL; therefore, the URL must not be versioned, or contain a major version (in the sense of “semantic versioning”) number. It is expected that updates to the microfrontend under the same URL do not introduce breaking changes. By promoting rolling updates under the same URL, the standardisation framework promotes evolvability and loose coupling, as it allows the microfrontend and integration artefacts to be developed independently and be integrated the latest possible moment, namely in the client’s browser.

The specification recommends that microfrontends are compliant with the Web Accessibility Guidelines (WCAG), a standard for making web content as accessible as possible to as many users as possible. However, WCAG compliance is not mandatory, as there may be reasons or edge cases where it is not possible or necessary, and it is not strictly necessary to achieve the goal of the specification.

Finally, it is important to note that a microfrontend compliant with the specifications is not necessarily a correct implementation of the microfrontend architecture. It is possible to produce a software artefact which is, in fact, compliant with this specification but does not follow the principles for this type of architecture. For example, it would be possible to build a specification-compliant client-side application which is tightly coupled to a “backend for frontend” shared with other microfrontends, thereby violating the “verticalisation” principle.

## Configuration Provisions

Microfrontends in the sense of the this specification receive configuration only through attributes on the custom element. As such, they are an important part of the contact that the microfrontend offers to its environment. Technically, it would also be possible to have the microfrontend listen to browser events or to allow it to expose callable methods on the web component instance.

However, there are two advantages to restricting configuration to be passed as attributes only: First, this rule prevents race conditions which can lead to non-deterministic behaviour. Second, it allows to treat the attributes as application state of the microfrontend. It is even possible to evoke state transitions by changing attributes at runtime. Therefore, the specification also mandates that the microfrontend must react to attribute changes and update itself as if the new configuration had been the initial one.

Admittedly, there are two disadvantages to relying purely on attributes for configuration and state management. First, only scalar values (in fact, only strings) can be passed through attributes, but not structured data such as arrays and objects. Second, by the nature of how web components work, attribute changes are processed one by one. On initialisation, the web component cannot know when all values are set; therefore values should not depend on each other, and it might have to wait until it has a consistent set of attributes. To address these issues, the specification permits attributes to contain JSON-serialised data if a normalised attribute signature is not possible.

## Communication Provisions

There are in theory several possible ways how a microfrontend could communicate with its environment. The most prominent patterns are event-based and state machine, as discussed in 2.3.1.2. However, as has been established above, the state machine is less suitable for a decoupled architecture, as the entire state is exposed to subscribers which leads to a tight coupling to the state and between components themselves. Therefore, the specification mandates the event-based approach. Events are a native browser feature, and there are APIs to [create event objects](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent) and dispatch them via the event mechanism.

In general, the specification makes only few prescriptions regarding the event structure, because the native implementation is mostly sufficient to achieve the goals of the framework. It only mandates a namespacing of event names to avoid collisions between independent microfrontends and it clarifies several aspects on the usage of the payload structure.

There is, however, a category of events which play a special role: For the purposes of tracking/analytics, the specification demands the `openmfe.analytics` name to be used for all events; the actual event name should then be part of the payload. The reason for this is that it allows tracking implementations to ingest such events without any specific integration through the host page. In practice, this will allow an organisational process where analytics developers can agree on trackable events with microfrontend developers directly without a need to make changes on the intermediary host page.

## Prerender Endpoint

Compared with other composition patterns, one disadvantage of web components is that their rendering is delayed. The JavaScript file that contains the component is only loaded after the main document, and together with many other assets. The loading priority can not be influenced. In fact, it can be even beneficial to postpone the loading via the [`async` attribute](https://html.spec.whatwg.org/multipage/scripting.html#attr-script-async), in order to have other assets loaded first.
The delayed rendering is problematic, because it causes a flickering and fast rearrangement of page elements as the document loads, an effect called the [“Cumulative Layout Shift”](https://web.dev/cls/). This effect can be avoided by inserting a placeholder with the same dimensions as the microfrontend into the page before it is delivered to the client.
The specification therefore demands that a microfrontend ships an endpoint that provides such a placeholder. The endpoint must take the same parameters as the attributes for the microfrontend web instance so that it can render a matching placeholder.

The placeholder can be arbitrary HTML and does not have to be functional at all; however it must be styled inline and must not inject additional stylesheets or scripts, as the loading of these resources would be delayed as well and therefore be detrimental to the placeholder’s purpose.

What may seem strange at this point is the fact that the prerendering mechanism is a server-side integration approach. So why not inject the microfrontend through this mechanism right away and benefit from faster loading? The reason is that there would still a script to be loaded, and a microfrontend will usually need data from an API at runtime anyway. And by delivering the actual microfrontend through a web component, the encapsulation and decoupling is much stronger and more coherent.

This is also why it is discouraged that the microfrontend consumes its own prerendered placeholder on initialisation: The placeholder could be stale, for example been rendered before the microfrontend underwent an update. Also, it might be that the integrating team chose to use a different placeholder, so there is no guarantee that the placeholder is what the microfrontend expects it to be.

## Semantic Endpoint

Another interface that the microfrontend may expose is the semantic endpoint. If present, it should return ontological information for the microfrontend. As the prerender endpoint, it is expected to accept the same parameters as the web component accepts as attributes, so that it can produce matching information. The endpoint is optional, because depending on the use case, it may not be applicable, and it is not strictly needed for interoperability.

The data to be provided through this endpoint must follow the [JSON-LD format](https://json-ld.org/). There is no mandate regarding the schema to be used. However, it is recommended to use the [schema.org namespace](https://schema.org/) because it is understood by search engines and can be used to display [enriched information to their users](https://developers.google.com/search/docs/advanced/structured-data/intro-structured-data).

The information generated by the endpoint can be retrieved at build time of a web page with a microfrontend and injected into the same page as a JSON-LD block.

## Manifest File

The final chapter of the specification mandates how a microfrontend is expected to describe itself through a manifest file. This file exposes the microfrontend’s interfaces as a formal contract. The contract consists of the tag name, the embed URL, attributes, events, and endpoints (prerender/semantic) of the microfrontend.
Additionally, the manifest file is expected to provide documentation, screenshots, examples and meta information about the microfrontend. This is not strictly a part of the contract that the microfrontend offers, but it can be used to automatically generate documentation and therefore is also seen as beneficial to interoperability.
The manifest file can be validated using JSON Schema which is part of the [@openmfe/manifest](https://github.com/openmfe/manifest) tool.
