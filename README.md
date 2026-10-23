# 🚀 README AI - cdn

> 📚 **Verified technical docs (pt-BR):** [docs/DOCUMENTACAO.md](docs/DOCUMENTACAO.md) · [Code audit & known issues](docs/AUDITORIA.md)
>
> The examples below were checked against the code on 2026-10-23 (an earlier auto-generated version described APIs that do not exist). Full reference: [docs/DOCUMENTACAO.md](docs/DOCUMENTACAO.md).

This repository houses a collection of client-side JavaScript utilities and UI components designed to enhance web page interactivity and manage client-side state. It provides a modular toolkit for front-end development, offering functionalities ranging from core DOM manipulation and event handling to advanced UI elements like sortable tables, dynamic popup messages, theme control, and interactive tree structures. The project also includes utilities for managing asynchronous operations, sequential ID generation, and persisting simple page state using browser storage. Intended for web developers, this library facilitates the creation of dynamic and responsive web interfaces without relying on server-side frameworks for basic functionalities.

## 📋 Table of Contents

*   [✨ Features](#-features)
*   [⚙️ Installation / Setup](#️-installation--setup)
*   [📂 Project Structure](#-project-structure)
*   [📖 Detailed Usage / API Documentation](#-detailed-usage--api-documentation)
*   [🔧 Configuration](#-configuration)
*   [🔒 Security & Safety Highlights](#-security--safety-highlights)
*   [🚧 Limitations and Edge Cases](#-limitations-and-edge-cases)
*   [🤝 Contributing](#-contributing)
*   [📜 License](#-license)
*   [🚧 Work in Progress](#-work-in-progress)

## ✨ Features

*   **Core Utilities:** Essential functions for DOM manipulation, event handling, and object operations.
*   **Asynchronous Control:** `Controller` (debounce, cancel the previous run, throttle) and `FetchQueue` (limited parallel requests).
*   **Search:** `SearchEngine` (text and structured queries over arrays of objects, with sorting and scoring).
*   **Sequential ID Generation:** Simple mechanism for generating unique IDs client-side.
*   **Page State Persistence:** `pageMemory` saves and restores elements marked with `save` (values, checkboxes, `<details>`, images) in IndexedDB.
*   **Sortable Tables:** A JavaScript component (`TableSorter`) for making HTML tables sortable client-side.
*   **Popup Messages:** Dynamic, temporary message overlays (`popupmessage`) for user feedback.
*   **Dynamic Theme Control:** Functionality (`themeControl`) to manage and apply visual themes, including saving theme preferences.
*   **Interactive Tree Structures:** Component (`treelist`) to render and manage collapsible hierarchical data displays.
*   **Observer Pattern:** Implementation of an Observer (`observer`) for reacting to DOM changes or other events.
*   **Dummy Data:** Includes mock JSON data (`dummy/`) for testing and demonstration purposes.

## ⚙️ Installation / Setup

No build step. Include the files you need with `<script>` tags, the core ones first. They are published at
`https://jeffersoncgo.github.io/cdn/js/<file>`; for an app you maintain, copying them into the app (as CoverMaker and
content-recommender do in `js/vendor/`) avoids breaking when this repository changes.

```html
<link rel="stylesheet" href="https://jeffersoncgo.github.io/cdn/js/popupmessage.css">
<script src="https://jeffersoncgo.github.io/cdn/js/base.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/common.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/object.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/controller.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/observer.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/pagememory.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/popupmessage.js"></script>
```

The root `index.html`, `script.js` and `style.css` are the **demo page** — do not include `script.js` in other pages.

## 📂 Project Structure

```
js/base.js          JCGWeb namespace, mouse position, getUniqueSelector, element helpers
js/common.js        utils (safeWindowsFileName…), String/Array helpers (non-enumerable)
js/object.js        searchInArray, path helpers, mergeObjects, cleanObject
js/controller.js    Controller: debounce, abort the previous run, throttle
js/observer.js      Observer: MutationObserver + DOM events
js/pid.js           PID helper
js/fetchqueue.js    FetchQueue: fetch with a concurrency limit
js/search.js        SearchEngine
js/pagememory.js    pageMemory / PageMemoryDB (IndexedDB)
js/TableSorter.js   sortable tables
js/popupmessage.js  stacked popup messages (+ .css)
js/treelist.js      collapsible tree from an object (+ .css)
js/themeControl.js  color theme editor bar (+ .css)
dummy/              sample JSON for the demo
tests/              unit tests (Node 20+: `node --test "tests/*.test.js"`)
```

## 📖 Usage (short examples)

**Controller** — the wrapped function always receives an `AbortSignal` as its last argument:

```js
const search = Controller.wrap(async (text, signal) => {
  const r = await fetch(`/api?q=${encodeURIComponent(text)}`, { signal });
  return r.json();
}, { abortBeforeRun: true, delayMs: 300 });
search.Controller.addEvent('onDone', result => console.log(result));
input.addEventListener('input', e => search(e.target.value)); // a superseded call resolves with undefined
```

**pageMemory** — mark elements with `save` (give them a stable `id`):

```html
<input id="server" save>
<script>
  const memory = new pageMemory({ saveDelayMs: 500 });
  memory.addEvent('onMemoryIsEmpty', () => { /* first visit */ });
  memory.init(); // restores the saved state, then saves on input/change/click/submit/toggle
</script>
```

**SearchEngine**

```js
const se = new SearchEngine();
se.search(items, 'matrix');                                                   // text anywhere in the item
se.search(items, [{ operator: 'any', fields: ['Genres'], queries: ['Action', 'Drama'] },
                  { operator: '..', fields: ['ProductionYear'], queries: [1990, 2000] }],
          [{ fields: ['CommunityRating'], type: 'desc' }]);
```

**FetchQueue** — callbacks, and a Promise you can await:

```js
const q = new FetchQueue(3);
const { data, error } = await q.fetch(url, { headers }, json => {}, err => {});
```

**TableSorter**

```html
<table id="people"><thead><tr><th sorttitle="Name">Name</th><th sorttitle="Age">Age</th></tr></thead><tbody>…</tbody></table>
<script>new TableSorter('people', { Age: Sorters.Number, Name: Sorters.Default });</script>
```

**Popup message** — text by default; pass `true` as the 9th argument to render HTML:

```js
PopuMessageManager.addMessage('Saved!', 'Success', 3000);
```

**TreeList**

```js
await TreeListManager.TreeHTML({ folder: { 'file.txt': 'content' } });
container.appendChild(TreeListManager.document);
```

**themeControl** — loading the script adds a brush button that opens the theme bar; themes are kept in
`localStorage.themeCtrlThemes`.

## 🔧 Configuration

There are no configuration files. Options are passed to the constructors (see the docs). Storage used:
`pageMemory` → IndexedDB `pageMemoryDB`; `themeControl` → `localStorage` (`themeCtrlThemes`, `themeCtrlTheme`).

## 🔒 Security & Safety Highlights

*   Everything runs in the browser; nothing is sent anywhere.
*   `popupmessage` and `treelist` insert text, not HTML, unless you opt in (`allowHTML`).
*   `mergeObjects` / path helpers ignore `__proto__`, `constructor` and `prototype` keys.
*   `pageMemory` stores whatever the marked elements contain: do not mark password fields with `save`.

## 🚧 Limitations and Edge Cases

*   `pageMemory` locates elements by `id` (or a generated CSS path) — elements without a stable `id` may not restore.
*   `themeControl` cannot read stylesheets served from other domains.
*   Large tables/trees are rendered on the main thread.

## 🤝 Contributing

This project is open source under the MIT License. Contributions are welcome!

If you wish to contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bugfix.
3.  Make your changes, adhering to the existing code style.
4.  Test your changes thoroughly.
5.  Submit a pull request detailing the changes you have made.

## 📜 License

MIT License

Copyright (c) 2025 jeffersoncgo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 🚧 Work in Progress

This repository and its documentation are under active development. Features and structure may change.
