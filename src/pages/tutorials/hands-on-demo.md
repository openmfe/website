---
layout: main
title: Quick Hands-on Demo
data: navigation
priority: 10
---

# Quick Hands-on Demo

In order to get you started with native microfrontends, we will first launch a minimalistic demo of a web component to show the basic pattern. This will give you a feeling of what native microfrontends are about, and it will not take more than two minutes.

First, create a folder `openmfe-test`, navigate into it, and paste the following snippet into a file named `my-mfe.js`:

```js
class MyMFE extends HTMLElement
{
    static get observedAttributes() {
        return ['person']
    }

    constructor() {
        super()
        this._shadow = this.attachShadow({ mode: 'open' })
    }

    connectedCallback() {
        this._shadow.innerHTML = `
            <style>
                div { all: initial; border: 1px dotted #222; padding: 10px; }
            </style>

            <div>
                Hello, ${this.getAttribute('person')}
            </div>
        `
    }
}

customElements.define('my-mfe', MyMFE)
```

Second, paste the following into a file named `index.html`:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Demo</title>
        <style>
            p { margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <p>This is the page content.</p>
        <my-mfe person="John Doe"></my-mfe>
        <script src="/my-mfe.js" async></script>
    </body>
</html>
```

Third, and finally, install a simple dev server and open the page in your browser:

```shell
npm i serve
npx serve .
```

Tadaah, your first microfrontend is running! Well, at this point, it is just a simple web component.

If you don’t know what web components are, don’t worry—we will discuss the key concepts in the next article. And, you can bookmark [web.dev](https://web.dev/web-components/) and [MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) to dive deeper afterwards.

Now, proceed to the next article, [Understanding Real-world Microfrontends](/tutorials/realworld-microfrontend/).