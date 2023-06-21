---
layout: main
title: Composition and Orchestration
priority: 40
summary: OpenMFE microfrontends are stand-alone applications wrapped into a custom element. In order to build larger sites, composition and orchestration must be implemented. This can be done with a thin layer of glue code, also known as the integration layer.
---

## Composition and Configuration

Because OpenMFE relies on browser standards, integrating a microfrontend with others or a host page is very straightforward. It always starts with inserting the web component somewhere on a web page:

```html
<div class="some-layout-container">
    <my-microfrontend id="instance-one" first-attribute="foo" second-attribute="bar"></my-microfrontend>
    <script src="https://example.com/my-microfrontend.js" async></script>
</div>
```

It might be that this is already enough if the attributes are sufficient to instantiate the microfrontend and its functionality does not need further integration with the host environment.

## Event-based Communication

Attributes are used for inbound communication to a microfrontend. For outbound communication, the microfrontend emit events which can be caught and processed by the host page:

```js
document.addEventListener(
    "my-microfrontend.something-happened",
    // ev.detail is the payload object, as defined by the CustomEvent specification
    ev => console.log(ev.detail)
)
```

At the same time, it is possible to change the attributes of microfrontends which (as demanded by the OpenMFE standard) causes the microfrontend to reconfigure according to the new parameters:

```js
const mfe1_inst1 = document.getElementById("instance-one")
mfe1_inst1.setAttribute("first-attribute", "yay")
```

Sometimes, multiple parameters need to be changed at the same time, which is not easily possible, because a custom element can only process one attribute change at a time. If you prefer scalar attribute values, you can still accept values one by one and make sure to handle invalid or incomplete configurations, e.g. through [debouncing](https://css-tricks.com/debouncing-throttling-explained-examples/) or assuming sensible defaults.

```js
const mfe1_inst1 = document.getElementById("instance-one")
mfe1_inst1.setAttribute("first-attribute", "yay")
mfe1_inst1.setAttribute("second-attribute", "hooray")
```

Alternatively, OpenMFE allows serialised JSON for attribute values (remember to specify such values as objects in the OpenMFE manifest):

```js
const mfe1_inst1 = document.getElementById("instance-one")
mfe1_inst1.setAttribute("first-attribute", JSON.stringify({
    "first-attribute" : "yay",
    "second-attribute" : "hooray"
}))
```

## Function Calls

Another way for inbound communication are function calls on a microfrontend instance. This is useful when it has an internal state that cannot be instantiated through configuration. A typical example would be a shopping basket:

```js
const mfe1_inst1 = document.getElementById("instance-one")
mfe1_inst1.addItem({ id: 5, qty: 1 })
```

## Orchestrating Multiple Microfrontends

When multiple microfrontends are integrated into the same page, they must not directly speak to each other, they mustn’t even know about each other. Instead they are managed by an *integration layer* which is aware of all microfrontends in the current context and orchestrates the interactions between them.

Imagine a flight search page with a **Search** microfrontend and a **Results List** microfrontend: When the “search flights” button is clicked in **Search**, all it does is emit an event with the search parameters. It is then the job of the integration layer on the page to forward these values to the Results List microfrontend understands. The Results List microfrontend will then load flight results for the given search configuration and display them.

This might looks as follows:

```js
const search = document.querySelector("#search")
const results = document.querySelector("#results")

search.addEventListener("search.submitted", ev => {
    // assuming that ev.detail is { dep: "DUS,CGN", dest: "TFS", out: "2024-09-23", in: "2024-10-06" }
    results.setAttribute("departure-airport", ev.detail.dep)
    results.setAttribute("destination-airport", ev.detail.dest)
    results.setAttribute("outbound-date", ev.detail.out)
    results.setAttribute("inbound-date", ev.detail.in)
})
```

This may seem a bit intricate. But this way, both the search form and the result list can be developed independently. And if necessary, the integration layer can translate the data structures between them.

## Global State

Microfrontends must never interact with the host page, because that would introduce a tight coupling between the page’s state and the microfrontend, thus creating a dependency.

### URL State

If the URL state is significant to the microfrontend, the host page needs to listen for parameters and pass them to the microfrontend as attributes.

In our flights page example, it might be that, for search engine purposes, deeplinks to flights pages exist with URLs such as the following:

```
https://example.com/flights?dep=DUS,CGN&dest=TFS&out=2024-09-23&in=2024-10-06
```

In this case, the host page would be parsing the parameters from the URL and pass them to the Results List microfrontend:

```js
const params = new URLSearchParams(window.location.search)
const results = document.querySelector("#results")
results.setAttribute("departure-airport", params.get("dep"))
results.setAttribute("destination-airport", params.get("arr"))
results.setAttribute("outbound-date", params.get("out"))
results.setAttribute("inbound-date", params.get("in"))
```

### State Machines

It may be tempting to use state machines and related mechanisms such as Redux to orchestrate multiple microfrontends. This is theoretically possible, but as a microfrontend must not actively listen to changes in its environment, there would have to be a wrapper for each microfrontend that attaches it to the global state mechanism. In most cases, this is too much overhead; use your judgement to determine if it’s worth it.
