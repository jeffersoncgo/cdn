# JCGWeb CDN — Technical documentation

> Reference written from the source code (revision `aa68604`, updated with the 2026-10-23 fixes).
> Bugs, risks and improvements are in [`AUDIT.md`](AUDIT.md).

## 1. What it is

A collection of "vanilla" JavaScript utilities (no build, no ES modules), published through GitHub Pages at
`https://jeffersoncgo.github.io/cdn/`. Each file is a classic `<script>` that creates **global** variables.

### Who uses it

| Project | How | Note |
|---|---|---|
| **CoverMaker** | Local copies in `js/vendor/` (`base`, `common`, `object`, `search`, `controller`, `pagememory`, `observer`, `fetchqueue`) | Identical to this repository since 2026-10-23; copy the file there when it changes here |
| **content-recommender** | Local copies in `js/vendor/` since 2026-10-23 (`CR-05`; it used to load `https://jeffersoncgo.github.io/cdn/js/...` straight from `main`) | Same rule: copy the file there when it changes here |

### Publishing

`.github/workflows/static.yml` runs the tests (`node --test "tests/*.test.js"`) and then publishes the whole repository
to GitHub Pages on every push to `main` (or manually through `workflow_dispatch`). No build or minification.

## 2. Load order and dependencies

| File | Globals created | Depends on (at load time) | Depends on (at run time) |
|---|---|---|---|
| `js/base.js` | `JCGWeb`, `JCGWeb.Variables.Mouse`, `JCGWeb.Functions.*`, `OnPageLoad` | — | `Observer` (on `DOMContentLoaded`) |
| `js/common.js` | `utils`, `String.prototype` and `Array.prototype` extensions | — | — |
| `js/object.js` | `GetValueFromPath`, `MakeObjFromPath`, `cleanObject`, `mergeObjects`, `flattenKeys`, `flattenValues`, `searchInArray`, `ArraySort`, `ArrayCaseEachWord`, `ArrayNormalize`, `JCGWeb.Functions.addEvent/deleteEvent/clearEvents/execEvents` | `JCGWeb.Functions` (base.js) | `String.prototype.eachWordUp` (common.js) |
| `js/pid.js` | `PID`, `JCGWeb.PID` (if `JCGWeb` exists) | — | — |
| `js/controller.js` | `Controller` | — | — |
| `js/observer.js` | `Observer` | — | — |
| `js/fetchqueue.js` | `FetchQueue` | — | — |
| `js/search.js` | `SearchEngine` (also on `window.SearchEngine`) | — | — |
| `js/pagememory.js` | `PageMemoryDB`, `pageMemory`, `JCGWeb.pageMemory` (**not initialized** instance) | `Controller` | `Observer` |
| `js/TableSorter.js` | `Sorters`, `TableSorter` | — | `Observer`, `Controller` |
| `js/popupmessage.js` | `PopupMessage`, `PopuMessageManager` | `utils` (common.js), `PID` (pid.js) | — |
| `js/treelist.js` | `TreeListCreator`, `TreeListManager` | `utils` (common.js) | — |
| `js/themeControl.js` | `themeCtrl_*`, `shiftTheme`, `invertTheme`, `colorToHex`, … | `utils`, `Controller` | — |

Recommended safe order:

```html
<script src="https://jeffersoncgo.github.io/cdn/js/common.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/base.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/pid.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/controller.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/observer.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/object.js"></script>
<!-- optional -->
<script src="https://jeffersoncgo.github.io/cdn/js/fetchqueue.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/search.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/pagememory.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/TableSorter.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/popupmessage.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/treelist.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/themeControl.js"></script>
```

`popupmessage.js`, `treelist.js` and `themeControl.js` inject their own CSS (`utils.AddStyle(utils.CurrentUrlToFile(...))`),
resolved from the URL of the current `<script>`. This only works with a classic `<script src>` (not with
`type="module"` nor with code injected through `eval`).

**Do not include** the root `script.js`: it is the demo page script and breaks outside it.

## 3. Module reference

### 3.1 `base.js`

Creates the global `JCGWeb` namespace and, on `DOMContentLoaded`, creates `JCGWeb.Observer = new Observer(document.body)`
(it watches the **whole** `body`: mutations + mouse/keyboard/scroll events).

| API | Description |
|---|---|
| `JCGWeb.Variables.Mouse.{X,Y}` | Last mouse position, in *client* coordinates (updated by `mousemove` and by the Observer; until 2026-10-23 the Observer wrote *screen* coordinates). |
| `JCGWeb.Functions.MakeSafePos(width, height, left, top, parent = document.body)` | Adjusts `left/top` so a rectangle fits inside `parent`. Returns `{left, top}`. |
| `JCGWeb.Functions.CreateElementFromHTML(html)` | Parses with `DOMParser` and returns `body.children` (HTMLCollection). Does not sanitize. |
| `JCGWeb.Functions.FindComponentFromEvent(event, lookFor, value)` | Walks up the tree from `event.target` until it finds the element. `lookFor`: `'class'` (compares the whole `className`), `'id'`, `'tag'` (`tagName` in uppercase), `'attr'` (presence), `'attr-value'` (`[name, value]`). Stops at `BODY`. |
| `JCGWeb.Functions.getUniqueSelector(el)` | Builds a CSS selector (`#id` or `tag.classes:nth-child(n) > …` up to `html`). |
| `JCGWeb.Functions.getUniqueSelectorOnClick()` | On every click, writes the target's selector to `html[data-clicked-selector]`. |
| `JCGWeb.Functions.GetElementDimensions(el)` | `{width, height, top, left}` (absolute to the page; for `body/html` it uses the window). |

### 3.2 `common.js`

**Prototype extensions** (non-enumerable: they do not show up in `for…in`):

- `String.prototype.eachWordUp()` — "title case" (each word capitalized, the rest lowercase).
- `String.prototype.firstUpCase()` — only the first letter uppercase.
- `Array.prototype.sortInsensitive()` (case-insensitive sorted copy), `eachWordUp()`, `firstUpCase()`,
  `toCase(useLowerCase)`, `toLowerCase()`, `toUpperCase()`, `removeDuplicates()`.

**`class utils`** (static members only):

| Member | Description |
|---|---|
| `CurrentScriptUrl`, `CurrentScriptName`, `CurrentUrlToFile(name)` | URL of the running script (`document.currentScript`) and of a "sibling" file. |
| `CurrentUrl`, `CurrentUrlPath`, `CurrentUrlParams`, `CurrentUrlHash`, `CurrentUrlHost`, `CurrentUrlHostname`, `CurrentUrlPort`, `CurrentUrlProtocol`, `CurrentUrlOrigin` | Shortcuts for `window.location`. |
| `AddScript(url)`, `AddStyle(url)`, `AddMeta(name, content)` | Insert `<script>`, `<link rel=stylesheet>` and `<meta>` into `<head>`. |
| `isClass(fn)` | `true` if the function is a `class`. |
| `makeObjbyPath(obj, 'a.b.c', value)` | Creates the nested structure by mutating `obj` and returns the object (creates a new one if `obj` is `null`). |
| `safeWindowsFileName(name)` | Normalizes (NFKD), replaces characters forbidden on Windows with `_`, removes trailing dots/spaces and prefixes reserved names (`CON`, `NUL`, …). |

### 3.3 `object.js`

| Function | Description |
|---|---|
| `GetValueFromPath('a.b', obj)` | Reads a value by path; `undefined` if any level is missing. |
| `MakeObjFromPath('a.b', value, obj, sep = '.')` | Writes a value by path, creating intermediate objects; returns `obj`. Ignores paths with `__proto__`/`constructor`/`prototype`. |
| `flattenValues(obj)` | List of `{path, value: String}` for every leaf (arrays become `field.0`, `field.1`, …). |
| `flattenKeys(obj)` | List of leaf paths (arrays are treated as leaves). |
| `cleanObject(obj)` | Removes `null`, `undefined`, `''`, empty arrays and empty objects — including the ones left empty after cleaning; arrays are compacted. Changes and returns `obj` itself. |
| `mergeObjects(target, source)` | Deep merge of `source` into `target` (arrays are replaced). Ignores the `__proto__`, `constructor` and `prototype` keys. Returns `target`. |
| `searchInArray(array, query, fields = null)` | Filters objects whose value (in any leaf, or only in the exact `fields`) contains `query` (case-insensitive). Caches by array **identity** (`WeakMap`) and by query. |
| `ArraySort(arr, ignoreCase)` | Sorts **in place**. |
| `ArrayCaseEachWord(arr)`, `ArrayNormalize(arr)` | Apply `eachWordUp` / `firstUpCase` to each string. |
| `JCGWeb.Functions.addEvent/deleteEvent/clearEvents/execEvents` | *Mixins* that use `this.events[name]` — call them with `.call(object)` or copy them onto an object that has `events`. |

### 3.4 `controller.js` — `Controller`

Wraps an async function to get **debounce**, **cancellation of the previous run** and **throttle**.

```js
new Controller(func, AbortBeforeRun = true, startDelayMs = 0, intervalBetweenRunsMs = 0)
```

- `exec(...params)` → schedules `func(...params, signal)` after `startDelayMs`. The last argument `func` receives is
  always an `AbortSignal`.
  - If a run is already scheduled/running, it is aborted (`signal.aborted = true`), the `onAbort` event fires and that
    call's Promise **resolves with `undefined`** (it used to stay pending forever). Whoever awaits it should treat
    `undefined` as "replaced by a newer call".
  - If `AbortBeforeRun === false` and something is running, the new call is ignored (`Promise.resolve()`).
  - If the call happens less than `intervalBetweenRunsMs` after the last run, it is **postponed to the end of the
    window** (only the last postponed call runs; the earlier ones resolve `undefined`). It used to be dropped.
- `abort(...params)` cancels whatever is pending.
- Events: `addEvent('onDone' | 'onAbort' | 'onError', cb)`, `deleteEvent`, `clearEvents`, `execEvents`.
  `onDone(result, ...params)`, `onAbort(...params)`, `onError(error)`.

`Controller.wrap(fn, abortBeforeRunOrOptions, startDelayMs, intervalBetweenRunsMs)` returns a function equivalent to
`exec` with the instance on `.Controller`:

```js
const search = Controller.wrap(async (text, signal) => {
  const r = await fetch(`/api?q=${encodeURIComponent(text)}`, { signal });
  return r.json();
}, { abortBeforeRun: true, delayMs: 300 });   // startDelayMs is also accepted as the option name

search.Controller.addEvent('onDone', result => console.log(result));
input.addEventListener('input', e => search(e.target.value));
```

> The aborted function only really stops if it honors the `signal` itself.
> Change of 2026-10-23 (`CDN-01`/`CDN-02`): each call has its own state — an old run no longer resolves the new one's
> Promise nor clears its timer.

### 3.5 `observer.js` — `Observer`

```js
const obs = new Observer(element = document.body);
obs.AddCallBack(cb);   // cb gets (mutationsList, mutationObserver) OR (event)
obs.Start();
```

Combines a `MutationObserver` (`childList`, `subtree`, `attributes`, `characterData`) with DOM event *listeners*
(`obs.Listeners`: `click`, `mouseover`, `mouseout`, `mousemove`, `keydown`, `keyup`, `keypress`, `submit`, `input`,
`change`, `focus`, `blur`, `load`, `contextmenu`, `scroll`, `wheel`, `resize`, `copy`, `cut`, `paste`). The same
callback gets both kinds of notification — tell them apart with `arg instanceof Event`.

Methods: `Start()`, `Stop()`, `SetListeners(list)`, `AddListener(name)`, `RemoveListener(name)`,
`RemoveListeners(cb)`, `RemoveAllListeners()`, `RemoveAllCallBacks()`, `RemoveAll()`, `Destroy()`.

### 3.6 `pid.js` — `PID`

Sequential generator: `const pid = new PID(10); pid.id // 10, then 11, …`. `pid.id = 0` restarts it.

### 3.7 `fetchqueue.js` — `FetchQueue`

A `fetch` queue with at most `fetchLimit` simultaneous requests (default 5).

```js
const q = new FetchQueue(3);
q.fetch(url, { headers }, (json, response) => { /* success */ }, (error, response) => { /* failure */ });
const { data, error, res } = await q.fetch(url, { headers });   // also returns a Promise (never rejects)
```

`onDone` gets the JSON of `ok` responses. Since 2026-10-23 an HTTP 4xx/5xx response goes to `onError` (it used to
reach `onDone` with the error body), as do network failures and invalid JSON.

### 3.8 `search.js` — `SearchEngine`

```js
const se = new SearchEngine();
se.search(array, query, sorting = undefined, isLaxQuery = false)
```

- **Simple query** (string): an item is returned if any leaf contains the text.
- **Complex query** (array of groups):
  `[{ operator, fields: ['Genres', 'People.Name'], queries: [...] }, …]`
  - `operator`: `'all'` (every query present), `'any'`, `'!='`, `'='`, `'>'`, `'<'`, `'..'` (range `[min, max]`).
  - `fields` matches by **prefix** of the flattened path (`Genres` matches `Genres[0]`, `Genres[1]`…).
- **Strict mode** (`isLaxQuery = false`): returns items that match **any** group (OR).
- **"Lax" mode** (`isLaxQuery = true`): computes a score per item, sorts by it and returns **shallow copies** of the
  items (not the original references).
- `sorting`: `[{ fields: ['CommunityRating'], type: 'desc' }, …]` — criteria applied in order (ties broken by the next
  one). The input array is not changed.
- Results are memoized by array identity + query JSON and returned as a copy. Changed the array in place? Call
  `se.clearCache(array)` (or `se.clearCache()` for everything).
- `'!='` matches items where **none** of the given fields equals any of the values.

### 3.9 `pagememory.js` — `pageMemory` / `PageMemoryDB`

Persists the state of elements marked with the `save` (or `data-save`) attribute in **IndexedDB**
(database `pageMemoryDB`, store `pageData`, key = the full `window.location.href`).

```js
const memory = new pageMemory();           // or JCGWeb.pageMemory (already created, with the default options)
// Options (all optional, added on 2026-10-23):
// new pageMemory({ listeners: ['input', 'change', 'submit', 'toggle'], saveDelayMs: 500, saveIntervalMs: 2000, restoreDelayMs: 500, saveDom: false })
memory.addEvent('onMemoryIsEmpty', () => { /* first visit */ });
memory.addEvent('onRestoreSucess', record => { /* state restored */ });
await memory.init();                       // opens IndexedDB, registers listeners and restores
```

What is saved per element:

| Element | Saved property | Event fired on restore |
|---|---|---|
| checkbox/radio `input` | `checked` | `change` |
| other `input`, `textarea` | `value` | `input` |
| `select` | `selectedIndex` (the index, not the value) | `change` |
| `details` | `open` | `toggle` |
| `option` | `selected` | `change` |
| `img` with a `blob:` `src` | image content in base64 (reused across Blob URLs by the content's `type-size-SHA256`; FNV-1a outside a secure context) | — |
| all | attributes, except `id`, `class`, `style`, `data-*`, `aria-*`, `role`, `hidden`, `title`… | — |

- On restore the element is found by a generated CSS selector (`#id` if it has one, otherwise a
  `tag.classes:nth-child()` path); **give every element with `save` a stable `id`**.
- `customTrigger="globalFunctionName"` attribute: after the restore, calls `window[name](element)`.
- Nothing is saved before `init()` finishes the restore (`canSave`); calling `savePageInfo()` early is safe.
- The page's `outerHTML` is only saved (`dom` field) with `new pageMemory({ saveDom: true })`; nothing reads it back.
  Until 2026-10-23 it was always saved (~340 KB per save in CoverMaker; the record is now ~7 KB).
- A new save aborts the previous one midway (even between one image and the next).
- Saves are triggered by the `input/change/click/submit/toggle` events (configurable in `listeners`) and by DOM
  mutations on the marked elements, with a 100 ms debounce (`saveDelayMs`) and a 2 s minimum interval
  (`saveIntervalMs`). A change made inside the interval is saved at its end (it used to be lost).
- `canSave = false` suspends saving. `blob:` images whose URL was already revoked are saved from the `<img>`'s own
  pixels (taken from the CoverMaker copy).

Events: `onSaveMemory`, `onRestoreSucess`, `onRestoreError`, `onMemoryIsEmpty`, `onDBSuccess`, `onDBError`
(the names with "Sucess" are spelled that way in the code).

Other methods: `clearSavedMemory()`, `cleanMemory()`, `reset()`, `destroy()`, `setDebug(true)`, `getStats()`,
`getSaveTargets()`, `startAutoSave()/stopAutoSave()/setAutoSaveDelay(ms)` (periodic autosave is not on by default).

### 3.10 `TableSorter.js`

```html
<table id="table" SortConfig="myConfig">
  <thead><tr><th sorttitle="Name">Name</th><th sorttitle="Age">Age</th><th _sortignore>Actions</th></tr></thead>
  <tbody>…</tbody>
</table>
<script>
  const myConfig = { 'Age': Sorters.Number, 'Name': Sorters.Default };
  new TableSorter('table', myConfig /* or leave it empty to use table[SortConfig] */, /*hasFooter*/ false);
</script>
```

- Clicking a `<th>` toggles ascending/descending; CSS classes applied: `cansortcollumn`, `collumnsorted`,
  `sorted_ascending`, `sorted_descending`; an icon (`⤴`/`⤵`) is added to the header.
- Comparators: `(tdA, tdB, descending) => number`; with `descending = true` they must sort from largest to smallest
  (that is how the component calls them). Ready-made: `Sorters.Default`, `Sorters.Number`, `Sorters.Date` (invalid text
  goes to the end). The computed value is kept in the cell's `_sortValue` attribute and recomputed on every sort (edited
  cells sort by the new value). The icon sits in a `<span class="tablesorter-icon">` inside the `<th>`.
- Rows with `_sortignore` stay out of the sort. An `Observer` re-sorts when the `tbody` changes.
- Without `<thead>` the component just does not create clickable headers.

### 3.11 `popupmessage.js`

```js
PopuMessageManager.addMessage('Saved!', 'Success', 3000,
  onMessage, onClose, onShow, onMessageClick, onTitleClick);   // optional callbacks
```

Shows stacked boxes in the bottom-right corner (`#messageHolder`) and returns the `PopupMessage` instance.
Message and title are inserted as **text**; to render HTML (the old behavior) pass `true` as the 9th argument
(`allowHTML`) or `triggers.allowHTML` in the constructor. `onShow` fires when shown and `onClose` when closed (click on
×, timeout or `close()`). Non-string objects are converted with `JSON.stringify`.

### 3.12 `treelist.js`

```js
const html = await TreeListManager.TreeHTML({ folder: { 'file.txt': 'content' } });
container.appendChild(TreeListManager.document);   // the rendered <div>
TreeListManager.OpenAll(); TreeListManager.CloseAll();
```

Renders objects/arrays as nested `<details>/<summary>` (keys as text) and primitive values as `<li>`.
With `Sanitize = true` (default), keys containing `/` or `\` become levels (`"a/b"` → `a > b`).

### 3.13 `themeControl.js`

On load it adds a button (brush) that opens a fixed bar with: a CSS rule picker, a color shift *slider*, the list of
saved themes, save/delete theme and invert colors. It works by rewriting the color values of the rules in
`document.styleSheets` (including inside `@media`/`@supports`) and of *inline* styles. It accepts `#rgb`, `#rrggbb`,
`#rrggbbaa`, `rgb()`, `rgba()`, `hsl()` colors; each component is shifted with wrap-around in 0…255. Stylesheets from
other domains are ignored.

Storage: `localStorage.themeCtrlThemes` (JSON `{name: [{selector, property, value}]}`) and
`localStorage.themeCtrlTheme` (active theme, reapplied 100 ms after load).

## 3.14 Tests

`node --test "tests/*.test.js"` (Node 20+, no dependencies): `Controller`, `object`, `search`, `common`, `FetchQueue`,
the `pageMemory` image signature and the mouse coordinates. They run in CI before the deploy (`static.yml`: `deploy`
depends on `test`). When you change a file here, also copy it to `CoverMaker/js/vendor/` and
`content-recommender/js/vendor/`.

## 4. Demo page

`index.html` + `script.js` + `style.css` (Tailwind through a CDN) demonstrate each module; `dummy/users.json` and
`dummy/products.json` are sample data (dummyjson.com format: `{users|products, total, skip, limit}`).
Since 2026-10-23 every section loads (execution used to stop at the Controller section, `CDN-12`).

To run it locally (an HTTP server is needed because of the `fetch` of the JSON files):

```bash
python3 -m http.server 8080   # and open http://localhost:8080/
```

## 5. Browser storage

| Where | Key | Written by |
|---|---|---|
| IndexedDB `pageMemoryDB` / `pageData` | Full page URL | `pagememory.js` |
| `localStorage.themeCtrlThemes`, `themeCtrlTheme` | — | `themeControl.js` |

## 6. General limitations

- Everything is global; two files that define the same name silently overwrite each other.
- No versioning: anyone loading the files from GitHub Pages always gets the latest `main`.
- `common.js` adds methods to `String.prototype`/`Array.prototype` (non-enumerable).
