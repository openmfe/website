---
layout: main
title: Microfrontend Building Blocks
data: navigation
priority: 20
---

# Microfrontend Building Blocks

A real-world, native microfrontend is a full-stack web application, and therefore has certain degree of complexity. This article will help to understand the building blocks and how they work together.

Note that there are many ways to build microfrontends, this is just one of them. A microfrontend does not have to be OpenMFE-compliant to earn the title, and even when you aim for compliance with the [OpenMFE specification](/architecture/specification), there are many ways to achieve this.

## Example Code

We will go through the code of a [demo microfrontend](https://github.com/openmfe/demo-microfrontend). You are invited to check out the demo project on your local machine, but you can as well just browse the source code on Github. To install and run the project locally:

```shell
git clone https://github.com/openmfe/demo-microfrontend
cd microfrontend
./dev.sh
```

You should now be able to open the microfrontend demo in your browser under [http://localhost:9081](http://localhost:9081).

## Repository Structure

If you look at the repository, you will find that the microfrontend contains a `frontend` and a `backend` folder.

Wait a second—backend? Yes! A microfrontend, being a self-contained stack, also needs some server-side functionality. This is a little service (deployed as container or <abbr title="Function as a service">FaaS</abbr>) that helps the client-side part with things like authorisation against external APIs, aggregating data from different sources, caching generic content, and transforming data so it can be easier processed by the client-side code (e.g. removing unneeded data to make the transmission more efficient and not expose more data than necessary).

The microfrontend repository also contains configuration for <abbr title="Continuous Integration and Continuous Delivery">CI/CD</abbr> and “Infrastructure as Code”. As the microfrontend is hosted on Github, we are using Github Actions for CI/CD. The infrastructure is hosted on <abbr title="Amazon Web Services">AWS</abbr>, this is why the repo contains a `cloudformation.yml` file with the infrastructure specification. We will discuss CI/CD and IaC later.

## The Frontend (Client-side)

### The Web Component

The client-side part of our microfrontend is found in the [`./frontend/src/main.js`](https://github.com/openmfe/demo-microfrontend/blob/main/frontend/src/main.js) file. It is a [web component](https://developer.mozilla.org/en-US/docs/Web/Web_Components), a “custom element” to be precise. A custom element is an HTML element that we can define ourselves via JavaScript. It is basically a class derived from `HTMLElement` with a few lifecycle callbacks. This is a pattern that you probably know from frameworks such as React or Stencil. But here it is, native in your browser!

By using native browser technology, we can build very lightweight components—no framework needed. This is why the production build is less than 1.8kb on the wire (minified/zipped)!

The web component is listens to changes on its attributes. This happens through the static `observedAttributes()` method. It will just return an array with the known attributes, in this case only `region`. This is complemented by the `attributeChangedCallback(name, oldValue, newValue)` method which will be triggered as soon as a value is set or changed.

#### Shadow DOM

In the `constructor()` function, you see that we are initialising a “shadow root”, the root node of a separate DOM tree called [“shadow DOM”](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM). This shadow DOM encapsulates all the inner DOM elements from the outside world. This allows us to use any CSS styles and classes without them leaking out to the environment.

#### Rendering

Normally, a web component would also have a `connectedCallback()` method which is called as soon as the custom element is injected into the host document. However, our microfrontend uses the `_render()` method instead, and rather than listening to DOM insertion, it is fired when the `region` attribute is set and the data are fetched from the backend. The reason is that a rendering at DOM injection wouldn’t make sense, as there is nothin to render anyway until we have data. The `_render()` method does two things: First, it inserts the CSS and the HTML to the shadow DOM, and it attaches event listeners to the newly generated DOM.

{#
    #### Styles

    The microfrontend uses the [UI Library](/resources/ui-library/) for color schemes and standardised elements such as buttons. The UI Library is installed as an NPM package, styles are imported as “modules” (via the Rollup bundler, as seen below) and injected into the template literal.
#}

#### Events

The microfrontend emits several events to its environment. There are generally two types of events, those that are used for integration and those that server analytics/tracking purposes. Technically, there is no big difference, they both are implemented as [Custom Events](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent). Integration events can use whatever name and payload structure they want to serve their purpose. Analytics events are expected to always have the `openmfe.analytics` event name and have a predefined payload structure, as described in the [OpenMFE specification](/architecture/specification) section 5.7.

#### Fonts

You will see that we load fonts in a slightly weird way. Where, normally, you would have a `@font-face` rule in your CSS, we are using the [`document.fonts`](https://developer.mozilla.org/en-US/docs/Web/API/Document/fonts) to programmatically register and retrieve fonts. The reason is that `@font-face` doesn’t work in shadow DOM, and we don’t want to mess with the host page’s styles instead.

### Manifest

As the microfrontend is compliant with the [OpenMFE specification](/architecture/specification), it comes with a “manifest” which is a formal self-description of its attributes, events and other features. The manifest is treated as the “contract” which the API offers to its consumers, meaning that these are the interfaces through which it can be integrated with other microfrontends or a host page. As the microfrontend will be independently deployable, the maintainers will make sure to not break the contract as the microfrontend evolves.

### Development Mode

The project also has a little `./frontend/src/index.html` file. This however is not part of the microfrontend, but just a helper for development. It allows creating a development environment where the microfrontend is embedded into a page.

The development environment contains a little development server, based on [browsersync](https://browsersync.io/), to reload the microfrontend as soon as the code is being changed.

### Build Chain

We don’t use a framework for the web component here (and in most cases, you won’t need one, either). But nevertheless we have a little toolchain to create the build artefact. The build chain in this example is based on [Rollup](https://rollupjs.org/), though you can use any other as well.

In our example, Rollup, together with a few plugins, takes care of the following:

- Minifying the JavaScript code (rollup-plugin-terser)
- Minifying the template literal string that contains our HTML and CSS (rollup-plugin-minify-html-literals).
- Inject URLs into JavaScript code (@rollup/plugin-replace).
- Copy static files to the `dist` folder, and inject URLs (rollup-plugin-copy).

In more complex projects you might need something to resolve Node dependencies as well, in which case the [@rollup/plugin-node-resolve](https://www.npmjs.com/package/@rollup/plugin-node-resolve) become handy.

What you should NOT do is transpilation and polyfilling. Transpilation is the process of translating your JavaScript code to an earlier level of syntax of the language to support older browsers. Polyfilling means that you provide extra functionality which is not present in older browsers. These techniques have been helpful in the past, but should be considered as anti-patterns nowadays, because they create a lot of overhead. Now that Internet Explorer is dead and Edge uses the Chromium rendering engine, all browsers have decent support for recent JavaScript syntax and APIs. Therefore you should write your code natively at a reasonable level of the language right away.

## The Backend (Server-side)

As discussed above, a microfrontend also needs code to run on the backend. We are using a little Express.js application here for demonstration purposes which could be deployed to a Docker container in production. Depending on your environment, you could also use [AWS Lambda](https://lumigo.io/learn/) or similar technologies. It could even be written with a different programming language than JavaScript, if necessary.

This backend can either be the “source of truth” for your application, or it contains to other services and acts as a mere abstraction, helping with aggregation, transformation and authentication.

### Runtime Endpoint

The runtime endpoint, found in the `./backend/src/runtime.js` file, provides the client-side web component with data. In order to actually get the data, it uses the `./backend/src/data.js` module which it shares with the semantic endpoint.

The data structure it returns to the client-side is optimised for size and for immediate consumption by the web component. As such, it follows the “backend for frontend” (BFF) pattern. This means that this microfrontend’s server-side does not have an own data model or follow any paradigm like REST. It can, and should, be a very simple data endpoint. Also, this endpoint is not versioned. It will be deployed together with the web component anyway, so there is only one consumer, and it will always be up to date.

### Prerender Endpoint

The prerender endpoint in `./backend/src/prerender.js` allows an integrating context such as a static site generator to build a placeholder into the page where the microfrontend should later appear. The template would look something like the following (using [Edge Side Includes](https://www.w3.org/TR/esi-lang/) in this example):

```html
<hotel-offers region="1197" lang="de-DE">
    <esi:include src="https://backend.example.com/prerender?region=1197&lang=de-DE" />
</hotel-offers>

<!-- Embedding the script with the hotel-offers custom element -->
<script src="https://frontend.example.com/main.js" async></script>
```

As you see, the prerender endpoint receives as query parameters the same values that the web component receives as attributes. This allows the endpoint to produce a placeholder with the same dimensions as the real web component which is generated at runtime.

In a simple case, the placeholder will be a bunch of grey boxes, indicating to the user that content is yet to be loaded. But you can as well insert some real data into the placeholder, which can be necessary for SEO purposes. For instance, the placeholder of this microfrontend could contain a hotel name, image, and description. However, you should avoid inserting volatile data such as prices or availabilities. As the prerendering output is likely to be cached and consumed by search engines, customers might see outdated information when viewing these pages or search results.

#### Development Mode

The `./backend/src/index.js` file is a little Express server, BUT it is only there for development use and will not be deployed to the runtime environment.

The reason why we’re using Express as a dev server is that it is easy to set up and most JavaScript developers are familiar with it. In more advanced scenarios you might want to use native cloud tools such as [AWS SAM](https://aws.amazon.com/serverless/sam/), which come with powerful features, but also with their own learning curve.

## CI/CD Pipeline

The CI/CD pipeline of this example project is built on Gitlab CI. We won’t cover the details of Gitlab CI here, it’s just important to know a few basics: Each microfrontend has its dedicated pipeline which lives with the project in a `.gitlab-ci.yml` file. This is a standard file type by Gitlab, containing *stages* and *job* along which a project is being integrated. You will usually have build, test and deployment tasks configured in such a pipeline file. Based on certain [rules](https://docs.gitlab.com/ee/ci/yaml/#rules) and [events](https://docs.gitlab.com/ee/ci/yaml/#when), for example when a commit to the repository is made, the pipeline executes the jobs it contains.

Looking at the pipeline configuration of our example project, you will see that it has a `build` and a `deploy` stage.

### The Build Stage

The `build` stage contains one job which is also named `build`. Apart from a few Gitlab-specific fields, it contains several shell commands to build the artefact.

What’s noteworthy here is that the `__FRONTEND_URL__`  and `__BACKEND_URL__` placeholders are not replaced with the real values, but basically with themselves. Why is that? When we *build* the artefact, we don’t know about the target environment yet. Therefore, we can only set those values during the deployment. But as we are deploying to a static server, we cannot work with environment variables. Therefore, we simply keep the static placeholders in the code and just do a string replacement during the deployment. This may seem a bit dirty, but it works reliably and avoids the overhead of having to load an extra configuration file.

### The Deployment Stage

The `deploy` stage has two jobs, `deploy_nonprod` and `deploy_prod`. They both are very similar, so that in fact they mostly inherit from the `.deploy` [“hidden” job](https://docs.gitlab.com/ee/ci/jobs/#hide-jobs) and only set some configuration.

The following things happen during the deployment:

1. The backend is built as Lambda, zipped and uploaded to an S3 bucket. This is necessary because this file needs to exist before the actual deployment of the Cloudformation stack.
2. The Cloudformation stack is deployed. On the first deployment, it is newly created, subsequent deployments cause an update, in case any changes were made to the stack.
3. After the stack has been deployed, generated values are retrieved such as the URL to the API Gateway or the Cloudfront Distrbution ID.
4. Now that we know the target URLs, we can injected them into a copy of the frontend artefact.
5. The frontend artefact is uploaded to the S3 bucket.
6. The Cloudfront CDN cache is “invalidated”, meaning effectively that is is cleared.

## Runtime Infrastructure

As mentioned previously, we are running our applications on AWS, preferably on “serverless” infrastructure, meaning that we avoid operating/maintaining own servers. The infrastructure is being deployed through code (hence “Infrastructure as Code”, IaC), in this case using Cloudfront, an AWS-native technology to create self-contained stacks of infrastructure.

For the client-side, we are using an S3 bucket to store the web component and related assets. They will be delivered to the client via a Cloudfront distribution. In order to allow the Cloudfront distribution to access the S3 bucket, the frontend also contains an “Origin Access Identity” (OAI) and a policy to authorise the OAI to actually access the bucket. If you don’t know what this means at the moment, don’t worry.

The backend is deployed to an [AWS Lambda](https://aws.amazon.com/lambda/). As the Lambda itself does not “speak” the HTTP protocoll, it is exposed to the internet as a webservice via an [AWS API Gateway](https://aws.amazon.com/api-gateway/).

## Conclusions and Further Reading

This tutorial discussed the essential elements of an OpenMFE microfrontend. You are now ready to do your own experiments! You should already have the

To learn more about other aspects of microfrontends and Modular Web Architecture, you can look into the following topics:

- Testing and QA
- Logging and monitoring
- Integration with other microfrontends
- Integration into a host environment
- Authentication and authorisation
- Performance
- Search engine optimisation (SEO)
- Analytics and A/B testing
- Static Site Generation

As we extend our information, we will provide articles on them. So, stay tuned!
