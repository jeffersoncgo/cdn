// Unit tests for the core helpers. Run from the repository root: node --test "tests/*.test.js"
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const DIR = process.env.CDN_DIR || path.join(__dirname, '..');
global.JCGWeb = { Functions: {} };
global.document = { currentScript: null };
const Controller = require(path.join(DIR, 'js/controller.js'));
const obj = require(path.join(DIR, 'js/object.js'));
const SearchEngine = require(path.join(DIR, 'js/search.js'));
const utils = require(path.join(DIR, 'js/common.js'));
const wait = ms => new Promise(r => setTimeout(r, ms));

test('Controller: superseded call resolves and the new call gets its own result (CDN-01)', async () => {
  const slow = Controller.wrap(async (x) => { await wait(40); return x; });
  let first = 'pending';
  slow('first').then(v => { first = v; });
  await wait(5);
  assert.equal(await slow('second'), 'second');
  await wait(60);
  assert.equal(first, undefined);
});

test('Controller: last call inside the throttle window still runs (CDN-02)', async () => {
  const runs = [];
  const thr = Controller.wrap(async v => { runs.push(v); }, true, 10, 150);
  thr(1); await wait(30);
  const p2 = thr(2), p3 = thr(3);
  await Promise.all([p2, p3]);
  assert.deepEqual(runs, [1, 3]);
});

test('Controller: debounce keeps only the last of quick calls', async () => {
  const runs = [];
  const deb = Controller.wrap(async v => { runs.push(v); return v; }, true, 20);
  const ps = [deb(1), deb(2), deb(3)];
  assert.deepEqual(await Promise.all(ps), [undefined, undefined, 3]);
  assert.deepEqual(runs, [3]);
});

test('Controller: abortBeforeRun=false ignores calls while running', async () => {
  const runs = [];
  const c = Controller.wrap(async v => { runs.push(v); await wait(30); }, false, 0);
  const p1 = c(1); await wait(5); await c(2); await p1;
  assert.deepEqual(runs, [1]);
});

test('Controller: func receives params then the AbortSignal; events fire', async () => {
  let got, done = [], aborted = 0;
  const c = Controller.wrap(async (a, b, signal) => { got = [a, b, signal instanceof AbortSignal]; return a + b; }, true, 0);
  c.Controller.addEvent('onDone', (r) => done.push(r));
  c.Controller.addEvent('onAbort', () => aborted++);
  assert.equal(await c(1, 2), 3);
  assert.deepEqual(got, [1, 2, true]);
  assert.deepEqual(done, [3]);
  c.Controller.abort();
  assert.equal(aborted, 1);
});

test('Controller: wrap accepts delayMs and startDelayMs options', async () => {
  for (const key of ['delayMs', 'startDelayMs']) {
    const c = Controller.wrap(async () => 1, { abortBeforeRun: true, [key]: 25 });
    assert.equal(c.Controller.startDelayMs, 25);
  }
});

test('Controller: errors reject only their own call and fire onError', async () => {
  const errs = [];
  const c = Controller.wrap(async () => { throw new Error('boom'); });
  c.Controller.addEvent('onError', e => errs.push(e.message));
  await assert.rejects(c(), /boom/);
  assert.deepEqual(errs, ['boom']);
});

test('mergeObjects ignores __proto__ (CDN-04) and still merges deeply', () => {
  const r = obj.mergeObjects({ a: 1, b: { x: 10 } }, JSON.parse('{"__proto__":{"polluted":"yes"},"b":{"y":20},"c":3}'));
  assert.equal(({}).polluted, undefined);
  assert.deepEqual(r, { a: 1, b: { x: 10, y: 20 }, c: 3 });
});

test('MakeObjFromPath ignores unsafe keys and keeps working', () => {
  obj.MakeObjFromPath('__proto__.polluted', 'yes', {});
  assert.equal(({}).polluted, undefined);
  assert.deepEqual(obj.MakeObjFromPath('app.settings.theme', 'dark', {}), { app: { settings: { theme: 'dark' } } });
});

test('cleanObject keeps the root and removes empty values (CDN-06)', () => {
  const r = obj.cleanObject({ a: 1, b: null, c: '', d: { e: undefined, f: [] }, g: [1, 2], h: {}, i: { j: 5, k: null } });
  assert.deepEqual(r, { a: 1, g: [1, 2], i: { j: 5 } });
});

test('GetValueFromPath returns undefined for missing paths', () => {
  assert.equal(obj.GetValueFromPath('user.details.age', { user: { details: { age: 30 } } }), 30);
  assert.equal(obj.GetValueFromPath('user.nope.age', { user: {} }), undefined);
});

test('searchInArray still finds by any field and by given fields', () => {
  const data = [{ Name: 'Alien', Genres: ['Horror'] }, { Name: 'Up', Genres: ['Family'] }];
  assert.deepEqual(obj.searchInArray(data, 'ali').map(x => x.Name), ['Alien']);
  assert.deepEqual(obj.searchInArray(data, 'family').map(x => x.Name), ['Up']);
});

test('SearchEngine.sort really sorts (CDN-05)', () => {
  const se = new SearchEngine();
  const data = [{ n: 'b', v: 2 }, { n: 'a', v: 1 }, { n: 'c', v: 3 }];
  assert.deepEqual(se.search(data, '', [{ fields: ['v'], type: 'asc' }]).map(x => x.v), [1, 2, 3]);
  assert.deepEqual(se.search(data, '', [{ fields: ['n'], type: 'desc' }]).map(x => x.n), ['c', 'b', 'a']);
  assert.deepEqual(data.map(x => x.v), [2, 1, 3], 'input array is not mutated');
});

test('SearchEngine complex + lax queries keep working', () => {
  const se = new SearchEngine();
  const data = [{ Id: 1, Genres: ['Action', 'Drama'], R: 8 }, { Id: 2, Genres: ['Drama'], R: 5 }, { Id: 3, Genres: ['Comedy'], R: 9 }];
  assert.deepEqual(se.search(data, [{ operator: 'all', fields: ['Genres'], queries: ['action', 'drama'] }]).map(x => x.Id), [1]);
  assert.deepEqual(se.search(data, [{ operator: '>', fields: ['R'], queries: [7] }]).map(x => x.Id), [1, 3]);
  const lax = se.search(data, [{ operator: 'any', fields: ['Genres'], queries: ['drama', 'action'] }], undefined, true);
  assert.deepEqual(lax.map(x => x.Id), [1, 2]);
  assert.equal(lax[0]._matchScore, undefined);
});

test('safeWindowsFileName: full-width illegal chars do not come back (CDN-14), normal names unchanged', () => {
  assert.equal(utils.safeWindowsFileName('a／b：c'), 'a_b_c');
  assert.equal(utils.safeWindowsFileName('file:name?.txt'), 'file_name_.txt');
  assert.equal(utils.safeWindowsFileName('MOVIES - Ação'), 'MOVIES - Ação'.normalize('NFKD'));
  assert.equal(utils.safeWindowsFileName('con'), '_con');
});

test('makeObjbyPath returns the object', () => {
  assert.deepEqual(utils.makeObjbyPath(null, 'a.b', 1), { a: { b: 1 } });
  const o = {}; utils.makeObjbyPath(o, 'x.y', 2); assert.deepEqual(o, { x: { y: 2 } });
});

test('prototype helpers still work and are not enumerable', () => {
  assert.equal('hello world'.eachWordUp(), 'Hello World');
  assert.deepEqual(['b', 'A', 'c'].sortInsensitive(), ['A', 'b', 'c']);
  assert.deepEqual(['a', 'a', 'b'].removeDuplicates(), ['a', 'b']);
  assert.deepEqual(['ab'].toUpperCase(), ['AB']);
  const keys = []; for (const k in ['x']) keys.push(k);
  assert.deepEqual(keys, ['0']);
});

test("SearchEngine '!=' keeps only items with none of the values (CDN-16)", () => {
  const se = new SearchEngine();
  const data = [{ Id: 1, Genres: ['Action', 'Drama'] }, { Id: 2, Genres: ['Drama'] }, { Id: 3, Genres: ['Comedy'] }];
  assert.deepEqual(se.search(data, [{ operator: '!=', fields: ['Genres'], queries: ['drama'] }]).map(x => x.Id), [3]);
  assert.deepEqual(se.search(data, [{ operator: '!=', fields: ['Genres'], queries: ['drama'] }], undefined, true).map(x => x.Id), [3]);
});

test('SearchEngine cache returns copies and clearCache sees in-place changes', () => {
  const se = new SearchEngine();
  const data = [{ n: 'alpha' }, { n: 'beta' }];
  const first = se.search(data, 'a'); first.length = 0;
  assert.equal(se.search(data, 'a').length, 2, 'cached result not corrupted by caller');
  data.push({ n: 'gamma' });
  se.clearCache(data);
  assert.equal(se.search(data, 'a').length, 3);
});

// ---- Browser-only classes, loaded in a sandbox (they have no module.exports) ----
const fs = require('fs');
const vm = require('vm');
const loadInSandbox = (files, extra = {}) => {
  const ctx = vm.createContext({ console, setTimeout, clearTimeout, Promise, Blob, Uint8Array, crypto: globalThis.crypto, Controller, ...extra });
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(DIR, 'js', f), 'utf8'), ctx, { filename: f });
  return ctx;
};

test('FetchQueue: ok responses reach onDone, HTTP errors reach onError, and the call can be awaited', async () => {
  const responses = {
    '/ok': { ok: true, status: 200, statusText: 'OK', json: async () => ({ a: 1 }) },
    '/404': { ok: false, status: 404, statusText: 'Not Found', json: async () => ({ error: 'nf' }) },
  };
  const ctx = loadInSandbox(['fetchqueue.js'], { fetch: async (url) => responses[url] });
  const q = vm.runInContext('new FetchQueue(2)', ctx);
  const seen = [];
  const ok = await q.fetch('/ok', {}, (data) => seen.push(['done', data.a]), () => seen.push(['error']));
  const bad = await q.fetch('/404', {}, () => seen.push(['done']), (err, res) => seen.push(['error', res.status]));
  assert.deepEqual(seen, [['done', 1], ['error', 404]]);
  assert.equal(ok.data.a, 1);
  assert.match(String(bad.error.message), /404/);
});

test('FetchQueue: never runs more than fetchLimit requests at once', async () => {
  let running = 0, max = 0;
  const ctx = loadInSandbox(['fetchqueue.js'], { fetch: async () => { running++; max = Math.max(max, running); await wait(15); running--; return { ok: true, status: 200, json: async () => ({}) }; } });
  const q = vm.runInContext('new FetchQueue(2)', ctx);
  await Promise.all(Array.from({ length: 7 }, () => q.fetch('/x')));
  assert.equal(max, 2);
});

test('pageMemory.blobSignature: same bytes match, different bytes of the same size do not (CDN-19)', async () => {
  const ctx = loadInSandbox(['observer.js', 'pagememory.js'], { window: {}, document: { addEventListener() {}, querySelectorAll: () => [] }, module: undefined });
  const memory = vm.runInContext('new pageMemory()', ctx);
  const a = new Blob([new Uint8Array([1, 2, 3, 4])], { type: 'image/png' });
  const b = new Blob([new Uint8Array([1, 2, 3, 5])], { type: 'image/png' });
  const a2 = new Blob([new Uint8Array([1, 2, 3, 4])], { type: 'image/png' });
  const [sa, sb, sa2] = await Promise.all([memory.blobSignature(a), memory.blobSignature(b), memory.blobSignature(a2)]);
  assert.equal(sa, sa2);
  assert.notEqual(sa, sb);
  assert.equal(memory.canSave, false, 'nothing is saved before init() restored the page (CDN-20)');
  assert.equal(memory.saveDom, false, 'the outerHTML snapshot is opt-in (CDN-08)');
});

test('base.js: both mouse handlers write viewport coordinates', () => {
  const listeners = {};
  const ctx = vm.createContext({ console, DOMParser: class { parseFromString() { return { body: { children: [] } }; } }, document: { addEventListener: (n, f) => { listeners[n] = f; }, querySelector: () => null } });
  vm.runInContext(fs.readFileSync(path.join(DIR, 'js', 'base.js'), 'utf8'), ctx, { filename: 'base.js' });
  const J = vm.runInContext('JCGWeb', ctx);
  J.Functions.toObeserverGetMousePos({ clientX: 10, clientY: 20, screenX: 900, screenY: 800 });
  assert.deepEqual([J.Variables.Mouse.X, J.Variables.Mouse.Y], [10, 20]);
  listeners.mousemove({ clientX: 11, clientY: 21, screenX: 901, screenY: 801 });
  assert.deepEqual([J.Variables.Mouse.X, J.Variables.Mouse.Y], [11, 21]);
});
