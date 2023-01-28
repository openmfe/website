---
layout: main
title: UI Design
priority: 40
summary: When developing a microfrontend, UI design can be challenging. Strictly speaking, the UI is a <em>contract</em> between the host page and the microfrontend. But as much as OpenMFE loves formalising contracts, this is barely possible when it comes to visual coherence. Therefore, OpenMFE relies on the developers’ skill and judgement in that regard. That said, there are several best practices that you should consider.
---

## Design System

When a microfrontend is part of a larger ecosystem such as an e-commerce site where it co-exists with other microfrontends and webpages, it is strongly recommended to invest into a mature design system. A design system documents the “design language” of the digital experience such as colors, fonts, dimensions/spacing, and many more. A good example of a design system is [Shopify’s Polaris](https://polaris.shopify.com/), and there are many others as well.

If a design system does not exist for the scope in which the microfrontend is going to be used, it is recommended that the microfrontend owner themselves publish the design guidelines which they follow, and that they abide by them.

## Component Library

An important component, or derivative, of a design system is a component library. This is a technical artefact that contains reusable implementations of user interface elements such as buttons, form fields and other

A component library can include different themes for these elements. For example, when a company has multiple brands, then each brand can have their specific designs be part of the organisation’s component library.

It is important however that the component library as well as themes are built into the microfrontend and should not be injected at runtime. Otherwise, this would create a dependency and could cause visual glitches.

### CSS

There are a few more things to be aware of when styling the microfrontend.

- Be careful with [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) within the microfrontend. These variables can be set by the host page, and it may be tempting to allow styling from the outside. But this creates a tight coupling between the host and the microfrontend; once the variables are in use, it will be difficult to get rid of them.

- It is however a valid pattern to expose toggles for different UI configurations as attributes. But it is recommended to keep them to a minimum and don’t let them become too fine-grained. For example, toggles for dark/light mode or simple/complex views are a good idea; button arrangements not so much.

- Do not use `rem` as a unit inside the microfrontend, because it always depends on the root font size of the host page. Choosing `px` as unit is an appropriate choice here.

- Custom fonts have to be loaded via the `FontFace` API. The [Microfrontend Deep-dive](/development/microfrontend-deepdive/) page explains in more detail why this is and how this works.

### Responsive Layout

Usually, responsive layout refers to the entire web page. CSS offers [media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries) to determine the dimensions of the viewport. However, a microfrontend is usually only embedded into a part of the page, and knowing viewport dimensions doesn’t help to determine the available space.

Therefore, a microfrontend must be responsive on the container level. The [Current Weather microfrontend](https://github.com/openmfe/current-weather) shows how this works: The microfrontend itself watches the size of its bounding container, and based on its dimensions, it gives itself a certain CSS class. In the corresponding CSS, the images and text of the microfrontend are have relative sizes based on the `--base` variable.
