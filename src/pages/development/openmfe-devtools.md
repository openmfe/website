---
layout: main
title: OpenMFE Devtools
priority: 80
summary: OpenMFE is not prescriptive when it comes to the “how” of your implementation. But to ensure contract validity and integrity as well as runtime compliance, we are providing some development tools.
---

## Validate the contract

As soon as you feel that the attributes, events and public functions of your microfrontend are stable, you should write the manifest which serves as the formal contract of the microfrontend’s API. If you haven’t written an OpenMFE manifest before, there are some resources to help you:

- Have a look at a [real-world manifest](https://github.com/openmfe/demo-microfrontend/blob/main/frontend/src/openmfe/manifest.yaml).
- Familiarise yourself with the [OpenMFE specification](/architecture/specification), especially the last chapter which covers the manifest file structure.
- Have a look at the validator tool, especially at the [JSON Schema](https://github.com/openmfe/manifest/blob/main/lib/schema.json).

The validator can be used during development to make sure that the manifest is valid. Note that the validator is not able to check if your API specification complies with the implementation. This is something you have to do yourself at this point.

Install and run the contract validator:

```shell
# In the frontend folder of your microfrontend repo
npm i -D @openmfe/manifest
npx openmfe-validate http://localhost:9081/openmfe/manifest.yaml
```

In the above example the tool would expect the microfrontend to be running on the local machine. You can also use the contract checker to test remote URLs.

### History Check

The `@openmfe/manifest` tool has a second function, it can track changes of your contract over time and thereby validates its integrity. As a microfrontend evolves, interfaces may change – but this must happen in a non-breaking way. This means that the contract can be extended, but existing APIs must not be altered or removed.

```shell
npx openmfe-contract http://localhost:9081/openmfe/manifest.yaml
```

Running the `openmfe-contract` command will extract the contract-relevant aspects from your manifest. (NB: Icons, descriptions etc. are not part of the contract and may change at any time.) If the command runs for the first time, it will create a file in the repo called `.contracts`. On subsequent runs, it will check if the current contract is still compliant with the one in the `.contracts` file. If not, it will raise an error. If the contract is compliant but has been extended, the tool will update the contract.

## Check Runtime Behaviour

The [OpenMFE specification](http://localhost:8081/architecture/specification/) has lots and lots of provisions that govern the behaviour of a microfrontend at runtime. (Did we say OpenMFE is not prescriptive? We might have to take that back.) The purpose of them is to make sure that the microfrontend stays as strongly isolated as ever possible in order to avoid inadvertent dependencies on the host environment. To learn more about the rationales behind these provisions, read the article [“Behind the OpenMFE Spec”](http://localhost:8081/architecture/openmfe-considerations/)

To help a bit with checking the runtime behaviour, there is the [@openmfe/check-runtime](https://github.com/openmfe/check-runtime) tool. To be very honest, this tool is really early stage at this point, meaning that it performs just a few basic checks. A successful check does not at all mean that the microfrontend complies with the specification, it’s just a first indicator.

Install the tool in your project and run it (but before you do, finish reading this page):

```shell
# In the frontend folder of your microfrontend repo
npm i -D @openmfe/check-runtime
npx openmfe-check-runtime http://localhost:9081/openmfe/manifest.yaml
```

Again, this expects the microfrontend to run locally and the manifest to be available at the given URL.

Please note that this tool relies on Puppeteer which again relies on Chromium to launch a runtime test environment. If you have Chrome/Chromium already installed (which is likely on a local dev machine), you may want to install and run the tool as follows:

```shell
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 npm i @openmfe/check-runtime
PUPPETEER_EXECUTABLE_PATH=<path to Chrome/Chromium> npx openmfe-check-runtime http://localhost:9081/openmfe/manifest.yaml
```

This will spare you from downloading and installing the whole Chromium browser into your project dependencies.

