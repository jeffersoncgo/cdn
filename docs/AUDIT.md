# JCGWeb CDN — Audit: bugs, suggested fixes and improvements

> Fix plan (phases, the no-feature-loss rule, decisions): [`CoverMaker/docs/FIX-PLAN.md`](https://github.com/jeffersoncgo/CoverMaker/blob/main/docs/FIX-PLAN.md).

> Code review at `aa68604`. Each item says **how it was checked**:
> 🧪 reproduced (Node 22 or Chromium/Playwright) · 🔎 code reading.
> Severity: **High** (wrong behavior/data loss/security), **Medium** (fails in common cases),
> **Low** (edge cases, maintenance).

## Summary

> **Status (merged into `main` on 2026-10-23):** ✅ fixed and tested · ◐ partly fixed (only CDN-07, see the item).
> Tests: 23 Node cases in `tests/` (they pass on the new version; the bug cases fail on the old one), run in CI before
> the deploy; demo in Chromium without errors; CoverMaker and content-recommender without regressions.

| ID | Sev. | File | Problem |
|---|---|---|---|
| CDN-01 ✅ | High | `controller.js` | A new call gets the old call's result and the old one never resolves (race condition) 🧪 |
| CDN-02 ✅ | High | `controller.js` | `intervalBetweenRunsMs` drops the last call (updates are lost) 🧪 |
| CDN-03 ✅ | High | `pagememory.js` | `_savePageInfo` gets the `Event` instead of the `AbortSignal` |
| CDN-04 ✅ | High | `object.js` | `mergeObjects` allows *prototype pollution* through `__proto__` 🧪 |
| CDN-05 ✅ | High | `search.js` | `sort()` sorts a copy and returns the original array (sorting never happens) 🧪 |
| CDN-06 ✅ | High | `object.js` | `cleanObject` returns the child object and skips keys 🧪 |
| CDN-07 ◐ | Medium | `pagememory.js` | Restores old attributes over new HTML (blacklist instead of whitelist) |
| CDN-08 ✅ | Medium | `pagememory.js` | Saves the whole `outerHTML` on every save without using it |
| CDN-09 ✅ | Medium | `pagememory.js` | Selectors without `CSS.escape` and `destroy()` throws |
| CDN-10 ✅ | Medium | `TableSorter.js` | `Sorters.Date` never works; comparators with opposite directions; boolean comparator |
| CDN-11 ✅ | Medium | `observer.js` | Invalid event names (`onresize`, `oncopy`…) and `RemoveCallBack` with a variable that does not exist |
| CDN-12 ✅ | Medium | `script.js` (demo) | The demo stops at line 123: half the sections never render 🧪 |
| CDN-13 ✅ | Medium | `popupmessage.js`, `treelist.js` | Unescaped HTML (XSS if the content comes from outside) |
| CDN-14 ✅ | Medium | `common.js` | `safeWindowsFileName` brings back `/` and `:` after `NFKD` 🧪 |
| CDN-15 ✅ | Medium | `themeControl.js` | `@media` rules stop the scan; 3-digit hex breaks; a condition is always true |
| CDN-16 ✅ | Low | `search.js` | The `!=` operator matches almost everything; the identity cache goes stale if the array changes |
| CDN-17 ✅ | Low | `common.js`, `object.js`, `fetchqueue.js`, `base.js` | `makeObjbyPath` does not return; enumerable prototypes; `fetch` without `res.ok`; mouse with mixed coordinates |
| CDN-18 ✅ | Low | `README.md` | The described API does not exist; suggests including the demo's `script.js` |
| CDN-19 ✅ | High | `pagememory.js` | Images identified only by `type + size`: two different images with the same byte size are saved as the same one 🧪 |
| CDN-20 ✅ | High | `pagememory.js` | `canSave` starts `true`: a save before the restore finishes overwrites the saved state with the page defaults 🧪 |
| CDN-21 ✅ | Medium | `pagememory.js` | A superseded save keeps reading images (already revoked Blob URLs → `ERR_FILE_NOT_FOUND`) and updates the "previous state" 🧪 |

---

## Details

### CDN-01 — `Controller`: race between runs (High) 🧪

`js/controller.js:25-61`. When `exec()` is called while a previous run is still in `await this.func(...)`:

1. `abort()` clears `this._resolve/_reject` (lines 79-80) → the old call's Promise **never resolves**
   (whoever awaited it hangs forever).
2. The old run goes on (it only stops if the function honors the `signal`) and, when it ends, calls
   `this._resolve?.(result)` — which now points to the **new** Promise → the new call gets the old one's result.
3. The old `finally` (lines 55-61) clears the new run's `_timeout`, `_resolve` and `controller`.

Repro (Node):

```js
const slow = Controller.wrap(async (x) => { await new Promise(r => setTimeout(r, 50)); return x; });
slow('first');                       // never resolves
setTimeout(async () => console.log(await slow('second')), 5);   // prints "first"
```

Suggested fix — isolate each run's state:

```js
exec(...params) {
  if (this.running && !this.AbortBeforeRun) return Promise.resolve();
  if (this._lastRun && Date.now() - this._lastRun < this.intervalBetweenRunsMs) {
    return this._scheduleTrailing(params);          // see CDN-02
  }
  this.abort(...params);
  const run = { controller: new AbortController() };
  this._current = run;
  return new Promise((resolve, reject) => {
    run.reject = reject; run.resolve = resolve;
    run.timeout = setTimeout(async () => {
      if (this._current !== run) return resolve(undefined);
      this._lastRun = Date.now();
      this.running = true;
      try {
        const result = await this.func(...params, run.controller.signal);
        if (this._current === run) this.execEvents('onDone', result, ...params);
        resolve(result);
      } catch (error) {
        if (error?.name === 'AbortError') resolve(undefined);
        else { this.execEvents('onError', error); reject(error); }
      } finally {
        if (this._current === run) { this.running = false; this._current = null; }
      }
    }, this.startDelayMs);
  });
}

abort(...params) {
  const run = this._current;
  if (!run) return;
  clearTimeout(run.timeout);
  run.controller.abort();
  run.resolve?.(undefined);          // never leave the Promise hanging
  this._current = null;
  this.running = false;
  this.execEvents('onAbort', ...params);
}
```

Impact on consumers: in CoverMaker `drawComposite`, `updateTextSettings`, `searchOnLibrary` and `saveprojectConfig` go
through `Controller.wrap`; in content-recommender, `jellyfin.searchItems`.

### CDN-02 — The throttle drops the final call (High) 🧪

`js/controller.js:33-36`. Inside the `intervalBetweenRunsMs` window the call is resolved without running, and the
previously scheduled call was already aborted at lines 25-28. Result: the **last** update is lost.

```js
const runs = [];
const thr = Controller.wrap(async v => runs.push(v), true, 10, 200);
thr(1); setTimeout(() => thr(2), 30);   // runs === [1]  → the value 2 is never processed
```

This directly affects `pagememory` (`savePageInfo` uses 100 ms/2000 ms): typing for less than 2 s after a save means
the final value is not saved until the next event.

Fix: instead of dropping it, reschedule it for the end of the window (*trailing edge*):

```js
_scheduleTrailing(params) {
  const wait = this.intervalBetweenRunsMs - (Date.now() - this._lastRun);
  clearTimeout(this._trailing);
  this._trailingResolve?.(undefined);          // the replaced call does not hang
  return new Promise(resolve => {
    this._trailingResolve = resolve;
    this._trailing = setTimeout(() => {
      this._trailingResolve = null;
      resolve(this.exec(...params));
    }, wait);
  });
}
```

Also document the options key: `wrap(fn, { delayMs })` — the comment on line 224 uses `startDelayMs`, which is
ignored. Accepting both avoids confusion: `delayMs: opts.delayMs ?? opts.startDelayMs`.

### CDN-03 — `pagememory`: wrong `signal` (High) 🔎

`js/pagememory.js:434` declares `_savePageInfo(signal)`, but the `Controller` calls `func(...params, signal)`.
Callers pass arguments: the `Observer` passes the `Event` or the mutation list (line 773) and `handleWindowEvent`
passes `true` (line 791). So `signal` is an `Event`/array/boolean and the `signal?.aborted` checks never work. (The
CoverMaker copy had the same problem.)

```js
// Fix: ignore the parameters and take the last argument
this.savePageInfo = Controller.wrap((...args) => this._savePageInfo(args.at(-1)), true, 100, 2000);
```

### CDN-04 — Prototype pollution in `mergeObjects` (High) 🧪

`js/object.js:70-83`. `for (let key in obj2)` over an object from `JSON.parse` includes the `__proto__` key;
`obj1['__proto__']` is `Object.prototype` and the recursive merge writes into it.

```js
mergeObjects({}, JSON.parse('{"__proto__":{"polluted":"yes"}}'));
({}).polluted   // "yes"
```

Fix:

```js
const UNSAFE = new Set(['__proto__', 'constructor', 'prototype']);
for (const key of Object.keys(obj2)) {
  if (UNSAFE.has(key)) continue;
  …
}
```

### CDN-05 — `SearchEngine.sort` does not sort (High) 🧪

`js/search.js:95`: `results.slice().sort(...)` sorts a discarded copy and line 107 returns `results` unchanged. Test:
`se.search([{v:2},{v:1},{v:3}], '', [{fields:['v'], type:'asc'}])` → `[2, 1, 3]`.
Fix: `return results.slice().sort(...)` (and return that value).
It also affects the "lax" mode: sorting by score happens, but the tie-break the caller asked for does not.

### CDN-06 — `cleanObject` (High) 🧪

`js/object.js:64`: `obj = cleanObject(obj[key])` replaces the reference of the object being walked.
`cleanObject({a:1, d:{e:1,f:2}, g:null, h:{i:5}})` returns `{"e":1,"f":2}`.

```js
function cleanObject(obj) {
  for (const key of Object.keys(obj)) {
    const v = obj[key];
    if (v === null || v === undefined || v === '') { delete obj[key]; continue; }
    if (typeof v === 'object') {
      cleanObject(v);
      if (Object.keys(v).length === 0) delete obj[key];
    }
  }
  if (Array.isArray(obj)) { const kept = obj.filter(x => x !== undefined); obj.length = 0; obj.push(...kept); }
  return obj;
}
```

### CDN-07 — Attribute restore overwrites new HTML (Medium) 🔎 — ◐ (2026-10-23)

What was done: `added-trigger` is now ignored (Phase 1). The exclusion list was **kept on purpose**: the apps depend on restored attributes (CoverMaker recreates the slots from the `slotsCount` attribute with `customTrigger`). Versioning the record stays a suggestion.

`js/pagememory.js:653-661` restores **every** saved attribute except an exclusion list. If a new version of the site
changes the element's `min`, `max`, `placeholder`, `onclick`, `src`, `href`…, the old version saved in IndexedDB takes
over again. The internal `added-trigger` attribute is also saved and restored.

Suggestions: (a) use an **inclusion** list (only `value`, `checked`, `open`, `selected`, attributes declared in
`save="attr1 attr2"`); (b) version the record (`{version, data}`) and drop it if the app version changed;
(c) add `added-trigger` to the ignored list.

### CDN-08 — `outerHTML` written on every save (Medium) 🧪 — ✅ fixed (2026-10-23)

What was done: `outerHTML` is only written with `new pageMemory({ saveDom: true })` (nothing reads it); CoverMaker's record went from 383 KB to 7 KB, and a save from 10 ms to 2 ms. The image signature already uses the content (`CDN-19`).

`js/pagememory.js:459` writes `document.documentElement.outerHTML` on every save (`dom` field), but the restore never
reads it. In CoverMaker that is ~340 KB per save (measured). Remove the field or make it optional
(`this.saveDom = false`).

Other points in the same module:
- Each element with `save` gets **two** save triggers (its own listener + an `Observer` with a `MutationObserver` on
  `subtree`), and saving calls `getElementsToSave()` → `querySelectorAll` + one object per element. On large pages
  (CoverMaker marks the whole `#leftSide` and `#rightSide` with `save`), any click or mutation triggers a full scan.
- `blobCache`/`blobSignatureCache` grow without a limit; the `type-size` signature can collide between different
  images with the same byte size. Use a hash of the content (e.g. `crypto.subtle.digest('SHA-1', …)`).
- `select` is restored by `selectedIndex`; if the options are filled later (or change order), the restored value is a
  different one. Save `value`.
- The record key is the full `location.href` (it includes `?query` and `#hash`): any URL parameter creates another
  "state".
- There is no save on `beforeunload` (`handleWindowEvent` exists but is never registered).

### CDN-09 — Unescaped selector and broken `destroy()` (Medium) 🔎

- `js/pagememory.js:931` (and `base.js:88`): `#${element.id}` without `CSS.escape` — ids like `1abc`, `a.b`, `a:b`
  cause a `SyntaxError` in `querySelector` and the element is silently skipped on restore.
  Use `#${CSS.escape(element.id)}` and `CSS.escape` on the classes.
- `js/pagememory.js:999-1014`: `destroy()` deletes every property and then calls `this.blobCache.clear()`
  → `TypeError`. Move the `clear()` calls before the loop. Note also that `destroy()`/`reset()` **delete the saved
  data** (`cleanMemory → clearSavedMemory`), which may not be what one expects from a "destroy".

### CDN-10 — `TableSorter` (Medium) 🔎

- `js/TableSorter.js:32,40`: `Date.parse(...)` already returns a number; `.getTime()` throws a `TypeError`, caught by
  the `try/catch` → the comparator always returns `0`. Fix: `Date.parse(x.innerText)` (or `|| 0` for invalid dates).
- `Sorters.Default` returns `-1` for `x<y` (when not descending) and `Sorters.Number/Date` return `-1` for `x>y`.
  Since `GenerateSortedData` always calls with `Descending = true`, numeric and text columns sort in opposite
  directions on the same click. Standardize: comparators always ascending, reversed when applied.
- `DefaultSort_Vanilla` (line 231) returns a **boolean**; `Array.prototype.sort` needs a negative/zero/positive
  number. It is the comparator used for columns without configuration. Fix:
  `a.localeCompare(b, undefined, {numeric: true})`.
- The `_sortValue` cache is never invalidated: if the cell content changes, it sorts by the old value — exactly the
  case the component's `Observer` means to handle. Clear the attribute in `reIndex()`.
- Line 197: `return; this.Header.Cells = [];` — the code after `return` is dead; without `<thead>` the constructor
  breaks in `SetupHeader`. Initialize `Cells = []` before the `return`.
- `AddCollumnIcon` rewrites the `<th>`'s `innerText`, destroying the header's inner icons/elements.
- `_sortignore` rows inside the `tbody` shift the index used in `ApplySortToTable`.
- The demo uses `data-sorttype`, an attribute the component does not read.

### CDN-11 — `Observer` (Medium) 🔎

- `js/observer.js:20-26`: `'oncontextmenu'`, `'onresize'`, `'oncopy'`, `'oncut'`, `'onpaste'` are not event names for
  `addEventListener` (the right ones have no `on`). `load`, `DOMContentLoaded`, `readystatechange`, `focus`, `blur`
  do not bubble up to an element — they never reach the callback when the target is `document.body`.
- `RemoveCallBack(index)` (lines 93-97) uses a `callback` that does not exist → `ReferenceError`. Fix:
  ```js
  RemoveCallBack(index) {
    const [cb] = this.callbacks.splice(index, 1);
    if (cb) this.RemoveListeners(cb);
  }
  ```
- `base.js` attaches an `Observer` to `document.body` with `subtree + attributes + characterData` and events like
  `mousemove`/`scroll` on **every** page that includes `base.js` — a constant cost just to update the mouse position,
  which also alternated between `clientX` (`mousemove` listener) and `screenX` (Observer callback).
  Suggestion: remove the global Observer and keep only the `mousemove` listener with `{ passive: true }`.

### CDN-12 — Broken demo page (Medium) 🧪

`script.js:123`: `Controller.wrap` returns the `exec` function with `.Controller`, without an `addEvent` method →
`TypeError: demoAsyncFunc.addEvent is not a function`. The script stops there: the `object.js`, `treelist.js`,
`TableSorter.js` and `pagememory.js` sections do not render (checked in Chromium) and the "Clear Saved Memory" button
throws `ReferenceError` (`pageMemoryInstance` in the TDZ). Lines 160-162 have the same problem (`SearchFunction.exec`,
a `SearchController` that does not exist).

```js
demoAsyncFunc.Controller.addEvent('onDone', …);
SearchFunction.Controller.startDelayMs = 300;
// remove lines 161-162
```

Also: the demo text says `pagememory` uses `localStorage` (it uses IndexedDB) and the `<p>` of the themeControl section
(`index.html:55`) is not closed.

### CDN-13 — Unescaped HTML (Medium) 🔎

- `popupmessage.js:18-21`: `${this._title}` and `${this._message}` in `innerHTML`.
- `treelist.js:69,85`: `summary.innerHTML = key`.

If these components show API/user data, there is XSS. Use `textContent` by default and an explicit `allowHTML` option
when needed. In `PopupMessage`, the triggers are required: `new PopupMessage('x')` without triggers throws a
`TypeError` (line 23); use `?.bind` or default *no-ops*. `transitionend/transitionstart` are not the same as
"closed/opened" and `close()` does not call `onClose`. `removeMessage` with `indexOf === -1` removes the last message
in the array.

### CDN-14 — `safeWindowsFileName` (Medium) 🧪

`js/common.js:131`: the `NFKD` normalization runs **after** the forbidden characters are replaced and turns
full-width characters into ASCII: `'a／b：c'` → `'a/b:c'`. Normalize first (preferably `NFC`, which does not strip
accents) and then replace. Also handle the empty result (`''` → `'_'`) and the 255-character limit.

### CDN-15 — `themeControl` (Medium) 🔎

- `getCSSRulesWithColors` (line 171): rules without `.style` (`@media`, `@supports`, `@keyframes`) make
  `isColorRule(undefined)` throw inside the loop; the outer `try/catch` then **skips the rest of that stylesheet**.
  Walk `rule.cssRules` recursively and ignore rules without `style`.
- `isValidHex` accepts any string that starts with 3 hex digits and `hexToRgb` requires 6 → `#fff` throws in
  `shiftColor`.
- `fixColorAngle`: values of exactly `256`/`-256` produce a `256` component (`"#100…"`, an invalid color). Use
  `((v % 256) + 256) % 256`.
- `rgbaToHex` with a fractional alpha produces `"7f.8"`; the later `split('.')` cuts the color. Use `Math.round`.
- Line 206: `selector != ':root' || !selector.startsWith('#') || !selector.startsWith('.')` is always true (it should
  be `&&`). And `'.' + element.className` with several classes makes a wrong descendant selector.
- `let themeShifted = 1` (line 5) shifts the first color by 1 without the user touching anything; it should start at
  `0`.
- `JSON.parse(localStorage...)` without `try/catch`.

### CDN-16 — `SearchEngine` (Low) 🔎

- The `!=` operator (lines 181-186): "some field differs" — practically every object with more than one field matches.
  Likely meaning: "no field equal" (`!flatItem.some(... queryValues.has(...))`).
- The identity cache (`WeakMap`) does not notice `push`/`splice` on the same array → stale results.
  Offer `clearCache(array)` or a versioned key.
- Cached results are returned by reference: if the caller sorts/changes them, the cache gets corrupted.

### CDN-17 — Misc (Low) 🔎 — ✅ fixed (2026-10-23)

What was done: `makeObjbyPath` returns the object, non-enumerable prototypes and `GetValueFromPath` with `?.` (Phase 1); `FetchQueue.fetch` checks `res.ok` (4xx/5xx go to `onError`) and returns a Promise; `getUniqueSelectorOnClick` without a global `this`; `JCGWeb.Functions` is no longer reset when `base.js` loads again. Both routines that write `JCGWeb.Variables.Mouse` now use `clientX/Y` (one used `screenX/Y`, and the value alternated between window and screen coordinates; only the demo reads it).

- `utils.makeObjbyPath` does not return the object; with `obj = null` the result is lost. Add `return obj;`.
- `common.js:1-56`: prototypes extended by assignment are **enumerable** (`for…in` on arrays starts listing
  `sortInsensitive`, `eachWordUp`…). Use `Object.defineProperty(Array.prototype, 'x', { value, enumerable: false })`
  and, in the long run, utility functions instead of changing native prototypes.
- `GetValueFromPath` throws on missing paths; use `o?.[i]`.
- `FetchQueue.fetch` does not check `res.ok` and does not return a Promise (it cannot be awaited).
- `base.js:121-129`: `getUniqueSelectorOnClick` uses `this` in a top-level *arrow function* (it becomes `window.page`).
- `JCGWeb.Functions = {}` overwrites functions registered by an earlier load.

### CDN-18 — README (Low) 🔎 — ✅ fixed (2026-10-23)

What was done: README rewritten in the install, structure, usage, configuration and limitations sections, with examples checked against the code.

The README was generated automatically and describes APIs that do not exist (`JCGWeb.PageMemory.saveElementState/loadAll`,
`JCGWeb.PopupMessage.show`, `JCGWeb.ThemeControl.setTheme/loadSavedTheme`, `JCGWeb.TreeList.render`), has a syntax
error (`function function loadInput()`), says `pagememory` uses `localStorage` and tells you to include
`https://jeffersoncgo.github.io/cdn/script.js` (the demo script, which breaks on other pages).
Suggestion: replace the API sections with examples from [`DOCUMENTATION.md`](DOCUMENTATION.md).

### CDN-19 — Image signature collision (High) 🧪 — ✅ fixed (2026-10-23)

Found while checking CoverMaker's `CM-11`. `_savePageInfo` reuses the base64 of an already converted image
(`blobSignatureCache`) when the Blob URL changes, and the key was `${blob.type}-${blob.size}`. Two **different** images
with the same byte size (common with generated images, like the test ones, and possible with photos) got the same key:
after a reload, a slot came back with another slot's image (measured: slots 2 and 3 restored with slot 0's image).

Fix: `blobSignature(blob)` = `type-size-SHA256(content)` (`crypto.subtle`; FNV-1a when the page is not a secure
context). The cost is one read of the blob, which already happened to build the base64, and only for new Blob URLs
(the ones already seen use the per-URL `blobCache`). Old signatures saved in IndexedDB stay valid as keys.

### CDN-20 — Save before the restore (High) 🧪 — ✅ fixed (2026-10-23)

`_savePageInfo` only saves if `canSave`, but the constructor already set it to `true`. Between the database opening and
`restorePageInfo()` finishing (a configurable delay, 500 ms in CoverMaker), any save — an `input`, a mutation observer
or a call from the page itself — wrote the page's **default** state over the saved one. Found when making CoverMaker
rewrite the record right after login (which happens exactly in that window). Fix: `canSave = false` in the constructor;
`_init()` enables it in the restore's `finally` (also when nothing is saved or the restore fails).

### CDN-21 — Superseded save (Medium) 🧪 — ✅ fixed (2026-10-23)

The `Controller` aborts the previous save when a new one starts, but `_savePageInfo` only looked at the `signal` at the
start and at the end: in between, it kept converting images whose Blob URLs the page had already revoked (CoverMaker
revokes them when it switches projects — 18 `ERR_FILE_NOT_FOUND` measured when opening two gallery projects in a row)
and called `setPreviousPageInfo` with the stale state. Fix: the loop checks the `signal` on each element; an image that
left the page or changed during the save is not fetched (the change schedules a new save); `setPreviousPageInfo` only
runs if the save was not aborted. New `getSaveTargets()` (the `[save]` elements), used by `getElementsToSave()`.

---

## Recommended improvements (roadmap)

1. **Version the CDN.** Publish tags (`v1.0.0`) and serve through jsDelivr
   (`https://cdn.jsdelivr.net/gh/jeffersoncgo/cdn@v1.0.0/js/controller.js`) or `/v1/` folders. Remote consumers pin a
   version; add SRI (`integrity`).
2. **Single source.** CoverMaker kept diverging copies in `js/vendor/` (its `pagememory.js` had a fallback for revoked
   Blob URLs that did not exist here). Since 2026-10-23 the copies are identical, and content-recommender has its own
   copies too. CoverMaker's workflow already checks out with `submodules: recursive`: turning `js/vendor` into a
   submodule of this repository (or using the tagged version) would remove the manual copying.
3. **Tests.** The `controller`, `object`, `search` and `common` modules are pure and testable in Node (they already
   export through `module.exports`). A `node --test` with the cases reproduced in this audit catches every regression
   above. Done on 2026-10-23: `tests/cdn.test.js`, run in the workflow before the deploy.
4. **Optional ES Modules.** Keep the globals for compatibility, but offer `export` (e.g. `js/esm/controller.js`),
   allowing `import { Controller } from '…'` without polluting `window`.
5. **Secure by default.** `textContent` instead of `innerHTML` in the UI components; an attribute whitelist in
   `pagememory`; guards against `__proto__` in every merge/path assignment (`MakeObjFromPath`, `makeObjbyPath`).
6. **Lighter pagememory.** Event delegation on `document` (a single listener) instead of one `Observer` per element;
   remove the `dom` field; save the `value` of `select`s; a schema version in the record.
7. **Types/JSDoc.** Complete the JSDoc with `@param/@returns` and publish an `index.d.ts` for autocomplete in the
   consuming projects.
