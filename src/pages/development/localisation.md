---
layout: main
title: Microfrontend Localisation
priority: 30
summary: Creating multilingual software is not as easy as it might seem, especially in a modular architecture. This article shows how to localise a modular UI component (such as a microfrontend). You will learn about message catalogs, contexts, plurals, date formats and localised layout as well as a lot about human language in general. By the way, this also works just as well on the backend.
---

## The Demo

The following table shows different use cases for localised messages. The language can be toggled by clicking the `DE` and `EN` buttons.

<div class="l10n-demo">
    <l10n-demo lang="en-GB"></l10n-demo>
</div>

## Local Setup

If you want to install the demo run it on your local machine, execute the following commands in a shell. Fun fact, this is implemented as a web component, so it is pretty close to building a microfrontend; you can basically copy/paste the code into your own project.

```shell
git clone https://github.com/lxg/l10n-demo.git
cd l10n-demo
npm i
npm run dev
```

This will start a little server on your machine and give you a demo page which you can open in your browser. Now you can edit the `./src/demo.js` file and try things out.

## Message Catalog and Translation Tables

But before we start playing, it is important to understand a few technical details about software localisation. The `@lxg/l10n` library is built on a well-established Open Source standard called [Gettext](https://en.wikipedia.org/wiki/Gettext). This standard has a common file type, ending in `.po`, which is called *message catalog*. These PO files, one per target language, are human-readable files which contain pairs of an original message string and the translation.

Here’s an example of such a file:

```po
msgid ""
msgstr ""
"Language: de_DE\n"
"Content-Type: text/plain; charset=utf-8\n"

#: src/demo.js:10
msgid "Hello World"
msgstr "Hallo Welt"
```

After the translators did their jobs, the message catalog is being “compiled” to a *translation table* in a machine-readable format. The `@lxg/l10n` library uses JSON for this.

**Wait a second, why do we have multiple translation files—the PO catalogs and the `translations.json`?**

It may seem redundant to maintain the messages in a PO catalog file and afterwards create a JSON file. Why aren’t the translations put into the JSON file directly?

We create the PO catalog first, because this format is a widely recognised industry standard, allowing software projects to use advanced tools like [Weblate](https://weblate.org/) to organise their localisation efforts. But the PO format is not well-suited for JavaScript: First, the files are much larger than necessary; second, unlike JSON, PO is not a native format to  JavaScript and would require some sort of parser; and third, as it is one file per language, there would be too many files to manage. Therefore, we compile a JSON file from the PO file in a second step.

## Basic Translations

As a convention in Gettext, the original message string is usually the English message rather than some cryptic identifier. For instance, to create a label that you want the user to click, you would pass the actual message to the `l10n.t(msg)` function, resulting in the following code:

```js
const label = l10n.t("Click me")
```

If a different language than English is selected and a translation exists, `label` will have the translated value; otherwise it will have the English one. This is great because the user interface will always be readable, because basically English becomes a fallback language. Which also means that an English translation is not necessary because it is already present.

## Context-aware Translations

In our demo, you see that the English word ”Amount” appears twice in the Demo column. Why is that?

As your software project grows, you will use some of your message strings multiple times in different places. That of course is fine, and the `@lxg/l10n` library will only collect them once into the message catalog. However, you might find that some English words have multiple meanings in one of your target languages. For instance, the English word “amount” can translate to “Betrag” or “Anzahl” in German, depending on the context.

For this purpose, the `@lxg/l10n` library provides the `l10n.x(context, message)` function. This function takes a brief description of your *context* as the first argument and the actual translatable message as the second. If you use this function in your code and then run the extractor, you will find that in the PO file, the entry now has a `msgctxt` line which allows translators to understand the context.

## Pluralised Translations

Something that might not be apparent to most (only) English-speaking developers is the fact how complex pluralisation is. The English language is quite simple in this regard: There are two forms, singular and plural (e.g. *car* and *cars*). The singular form is used when it refers to exactly one item, the plural form is used when referring to zero or to more than one item. And, a few exceptions aside, you can create the plural by appending the letter “s” to the singular form.

This is very different in other languages. There are many rules, and even more exceptions, to form the plural of a word. It is practically impossible to express this in a formal way or automate it. Also, many languages have more than one plural form! Did you know, for example, that the [Arabic language has 6 different forms of plurals](https://understand-arabic.com/2016/03/21/plurals/)?

Speakers of “Western” languages may wonder what all these forms are used for. The answer is that it depends on certain ranges of numbers. For instance, the Russian language has one plural form if the number of items is 2–4 and another one if there are 5 or more items.

Decent localisation systems are aware of this, and they address this with so-called *pluralisation rules*. Here are a [few examples for different languages](http://docs.translatehouse.org/projects/localization-guide/en/latest/l10n/pluralforms.html):

| Language        | Code | Rule                                                                                                    |
| :-------------  | :--- | :------------------------------------------------------------------------------------------------------ |
| English         | en   | `nplurals=2; plural=(n != 1)`                                                                           |
| German          | de   | `nplurals=2; plural=(n != 1)`                                                                           |
| Arabic          | ar   | `nplurals=6; plural=(n==0 ? 0 : n==1 ? 1 : n==2 ? 2 : n%100>=3 && n%100<=10 ? 3 : n%100>=11 ? 4 : 5)`   |
| Vietnamese      | vi   | `nplurals=1; plural=0`                                                                                  |
| Ukrainian       | uk   | `nplurals=3; plural=(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)` |

The rules have the following structure: The `nplurals` number tells the translation system how many plurals there are overall. The `plural=` expression is used to determine which plural form to use, based on a given number.

This is what the `l10n.n(singular, plural, number)` function does for you. The first argument is the English singular, the second one is the English plural, the third one is the actual number which is used to make a decision which pluralisation rule to use, based on the formula we’ve seen above. As we see in the demo, this would look as follows in practice:

```js
const number = 5
l10n.n("1 child", "%s children", number).replace("%s", number)
```

You see that the plural form contains a placeholder. This is where the actual number is later injected via the `.replace()` function which is necessary as the translation function is not aware of placeholders. In your message catalog, this will give you the following entry.

```po
msgid "1 child"
msgid_plural "%s children"
msgstr[0] "1 Kind"
msgstr[1] "%s Kinder"
```

Depending on the language of the catalog, there may be more than two `msgstr[]` entries.

## Adding Your Own Messages

Now that you’ve learned a lot of stuff, we can start playing with the code. Open the `./src/demo.js` file in your editor, you will see the table embedded into the web component.

You can modify the existing entries or add rows to see what happens. After adding or changing translations, you will see an update in the browser immediately, but (obviously) nothing will be translated yet.

## Generating Translation Files

A huge advantage of the `@lxg/l10n` tool is that it can extract translations from your code into the message catalog. You don’t have to manually chase down new or updated messages in your code; a simple `npx l10n -e` from the command line will run the *extractor* which updates all your catalogs. You or your translators can then edit the catalog files to add missing translations. After translating the strings, run `npx l10n -c` as the *compiler* which transforms all messages from all languages into one `./src/translations.json` file. (You can also call `npx l10n -ec` which combines both functions.)

To add languages, create a new entry in the `./package.json` file in the `l10n.locales` array with a valid [BCP-47 language tag](https://en.wikipedia.org/wiki/IETF_language_tag) (`xx-YY`), then run the extractor again to create the translations file. From thereon, proceed as described above.

## Localised Dates

Assuming you want to translate a date expression such as “Today is Monday, 6 June 2022”, you will probably start with a `Today is %s` message and then try some magic with the `Date` class. But how on earth do you get the translation for weekday and month names? Do we want to create a map of all possible variants and maintain it for all languages?

Another thing to consider is that date expressions are different across languages. The above English example uses the `weekdayname, day monthname year` format. But in German, for example, you would need to insert a dot before the number: `weekdayname, day. monthname year`. The short form is even more different: In English, it would be `6/6/2022` whereas in German, it would be `6.6.2022`. (And we haven’t even spoken about the mess with [the order of day and month](https://xkcd.com/2562/).)

Luckily, this is something that the `@lxg/l10n` library will also do for you. However, you have to compose your message from multiple elements:

```js
// some imports
import L10n from "@lxg/l10n"
import { L10nDateFormat }  from "@lxg/l10n/date"
import translations from './translations.json'

// instantiate tools
const l10n = new L10n(translations)
const formatter = new L10nDateFormat(l10n)

// here is the actual code
const date = new Date()
const format = l10n.t("F j, Y")
const today = formatter.fmt(today, format)
const message = l10n.t("Today is %s.").replace("%s", today)

// as a one-liner
const message = l10n.t("Today is %s.").replace("%s", formatter.fmt(new Date(), l10n.t("l, j F, Y")))
```

The `format` variable uses the `l10n.t(message)` function which we already know. But what’s with these letters? Each of them represents an element of a date or time expression. In the string `l, F j Y`, the letters have the following meaning: `l` is the weekday name, `F` is the day of the month, `j` is the month name, `Y` is the full year. This string needs to be passed through the `l10n.t` function to return these placeholders in the local format. For instance, in German, this would be `l, j. F, Y`. Now the formatter uses the translated pattern and inserts the right values for each placeholder. Finally, it is injected into the main message `Today is %s.`.

## Calendars

The [`L10nDate` class](https://github.com/lxg/l10n/blob/master/src/date.js) will also be helpful give you full lists of weekday and month names if you need to build dropdowns or calendars.

Another important aspect to consider when building a calendar is the [first day of the week](https://commons.wikimedia.org/wiki/File:First_Day_of_Week_World_Map.svg): This is also something that differs across countries and cultures. Some start the week on a Monday, others on a Sunday. And when you build a calender UI, you need to generate the right layout, otherwise people may book hotels, flights or car rentals on the wrong days. For instance, somebody may want to book a car for a Saturday, but as a German looks for the sixth column in your calendar and then books a car on a Friday.

Date localisation has even more fascinating aspects, such as different [calendar systems](https://en.wikipedia.org/wiki/List_of_calendars), many of which are still being used as alternatives to the common [Gregorian calendar](https://en.wikipedia.org/wiki/Gregorian_calendar).

## Layout and Spacing

When you create a multilingual application, you also need to be aware that messages in many languages need more space than their English equivalent. For example, see the expression “Good bye” in different languages:

| Language       | Expression         |
| :------------- | :----------------- |
| English        | Good bye           |
| German         | Auf Wiedersehen    |
| French         | Au Revoir          |
| Czech          | Na shledanou       |
| Lithuanian     | Iki pasimatymo     |

As you see, English is by far the shortest, German being almost twice as long. You need to keep this in mind when doing your screen design: Leave enough space for long words in other languages.

## Non-latin Scripts

There are two other aspects that you need to be aware of when using non-latin scripts:

1. Font support: Depending on your target audience, you need to make sure the font and it’s variants (bold, italic, etc.) support non-latin characters. Attention: Even if the font itself supports these characters, your font file might be using a subset.

2. Direction: Some scripts go from right to left (RTL), rather than left-to-right (LTR) as most European languages. If your target audience uses one of the RTL scripts, you need to make sure that your entire screen design is laid out to present the contents and UI elements properly.

Therefore you need to check carefully if everything is being displayed properly. Ideally, this is being done by a native speaker.

## Now to Localise Your Own Projects!

In this article, you have learnt many things you need to know about localisation and now you can apply it to own projects.

Before you start, you might want to try the following things with the demo code:

- Add new messages to the web component and make them appear in the PO catalog.
- Translate them in the message catalog and compile them into the translation table. (If you don’t know the target language, you can as well enter some gibberish.)
- Add a new language to the `package.json` and add a new toggle button to the web component.
- Create more source files with translatable message and add them to the `package.json`.

We will not cover in detail how to integrate the `@lxg/l10n` library into your own project; it is [well documented](https://github.com/lxg/l10n#readme), and you can use the `l10n-demo` project as a reference. It should also be noted that there are multiple alternative libraries available, in case you have different needs.

The result will be an application that can be used by a much larger target audience than you originally were able to address! So, the effort is definitely worth the outcome.

## Further Reading

- [Shopify’s UI Internationalisation Guidelines](https://polaris.shopify.com/foundations/internationalization)


{#
    ## Country and Currency Names

    We often need to refer to entities like country and currencies in their local language. Of course, they could be manually translated, but fortunately, there is an open database for these things, the “Common Locale Data Repository” (CLDR). It contains country, currency, weekday, month and other names in more than a hundred languages. (And lots of things more.)

    This is where another tool comes into play, the  [`@lxg/l10n-cldr`](https://github.com/lxg/l10n-cldr/) library which gives you country, currency, weekday and month names from the CLDR. You will see in the demo how this works and how to use CLDR data in your own project.
#}
