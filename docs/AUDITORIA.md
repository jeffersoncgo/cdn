# JCGWeb CDN — Auditoria: erros, correções sugeridas e melhorias

> Plano de correções em andamento (fases, regra de não perder funcionalidade, decisões): [`CoverMaker/docs/PLANO-DE-CORRECOES.md`](https://github.com/jeffersoncgo/CoverMaker/blob/main/docs/PLANO-DE-CORRECOES.md).

> Revisão do código em `aa68604`. Cada item indica **como foi verificado**:
> 🧪 reproduzido (Node 22 ou Chromium/Playwright) · 🔎 leitura de código.
> Severidade: **Alta** (comportamento errado/perda de dados/segurança), **Média** (falha em casos comuns),
> **Baixa** (casos de borda, manutenção).

## Resumo

| ID | Sev. | Arquivo | Problema |
|---|---|---|---|
| CDN-01 | Alta | `controller.js` | Chamada nova recebe o resultado da antiga e a antiga nunca resolve (condição de corrida) 🧪 |
| CDN-02 | Alta | `controller.js` | `intervalBetweenRunsMs` descarta a última chamada (perde atualizações) 🧪 |
| CDN-03 | Alta | `pagememory.js` | `_savePageInfo` recebe o `Event` no lugar do `AbortSignal` |
| CDN-04 | Alta | `object.js` | `mergeObjects` permite *prototype pollution* via `__proto__` 🧪 |
| CDN-05 | Alta | `search.js` | `sort()` ordena uma cópia e devolve o array original (ordenação nunca acontece) 🧪 |
| CDN-06 | Alta | `object.js` | `cleanObject` devolve o objeto filho e pula chaves 🧪 |
| CDN-07 | Média | `pagememory.js` | Restaura atributos antigos por cima do HTML novo (blacklist em vez de whitelist) |
| CDN-08 | Média | `pagememory.js` | Salva o `outerHTML` inteiro a cada gravação sem usar |
| CDN-09 | Média | `pagememory.js` | Seletores sem `CSS.escape` e `destroy()` lança erro |
| CDN-10 | Média | `TableSorter.js` | `Sorters.Date` nunca funciona; comparadores com sentidos opostos; comparador booleano |
| CDN-11 | Média | `observer.js` | Nomes de eventos inválidos (`onresize`, `oncopy`…) e `RemoveCallBack` com variável inexistente |
| CDN-12 | Média | `script.js` (demo) | Demo para na linha 123: metade das seções nunca renderiza 🧪 |
| CDN-13 | Média | `popupmessage.js`, `treelist.js` | HTML não escapado (XSS se o conteúdo vier de fora) |
| CDN-14 | Média | `common.js` | `safeWindowsFileName` reintroduz `/` e `:` após `NFKD` 🧪 |
| CDN-15 | Média | `themeControl.js` | Regras `@media` interrompem a varredura; hex de 3 dígitos quebra; condição sempre verdadeira |
| CDN-16 | Baixa | `search.js` | Operador `!=` casa quase tudo; cache por identidade fica velho se o array mudar |
| CDN-17 | Baixa | `common.js`, `object.js`, `fetchqueue.js`, `base.js` | `makeObjbyPath` não retorna; protótipos enumeráveis; `fetch` sem `res.ok`; mouse com coordenadas mistas |
| CDN-18 | Baixa | `README.md` | API descrita não existe; sugere incluir o `script.js` da demo |

---

## Detalhes

### CDN-01 — `Controller`: corrida entre execuções (Alta) 🧪

`js/controller.js:25-61`. Quando `exec()` é chamado enquanto uma execução anterior ainda está no `await this.func(...)`:

1. `abort()` zera `this._resolve/_reject` (linhas 79-80) → a Promise da chamada antiga **nunca resolve**
   (quem fez `await` fica pendurado para sempre).
2. A execução antiga continua (só para se a função respeitar o `signal`) e, ao terminar, chama `this._resolve?.(result)`
   — que agora aponta para a Promise **nova** → a chamada nova recebe o resultado da antiga.
3. O `finally` antigo (linhas 55-61) zera `_timeout`, `_resolve` e `controller` da execução nova.

Reprodução (Node):

```js
const slow = Controller.wrap(async (x) => { await new Promise(r => setTimeout(r, 50)); return x; });
slow('first');                       // nunca resolve
setTimeout(async () => console.log(await slow('second')), 5);   // imprime "first"
```

Correção sugerida — isolar o estado de cada execução:

```js
exec(...params) {
  if (this.running && !this.AbortBeforeRun) return Promise.resolve();
  if (this._lastRun && Date.now() - this._lastRun < this.intervalBetweenRunsMs) {
    return this._scheduleTrailing(params);          // ver CDN-02
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
  run.resolve?.(undefined);          // nunca deixar a Promise pendurada
  this._current = null;
  this.running = false;
  this.execEvents('onAbort', ...params);
}
```

Impacto nos consumidores: no CoverMaker `drawComposite`, `updateTextSettings`, `searchOnLibrary` e
`saveprojectConfig` passam por `Controller.wrap`; no content-recommender, `jellyfin.searchItems`.

### CDN-02 — Throttle descarta a chamada final (Alta) 🧪

`js/controller.js:33-36`. Dentro da janela `intervalBetweenRunsMs` a chamada é resolvida sem executar e a chamada
agendada anterior já foi abortada nas linhas 25-28. Resultado: a **última** atualização se perde.

```js
const runs = [];
const thr = Controller.wrap(async v => runs.push(v), true, 10, 200);
thr(1); setTimeout(() => thr(2), 30);   // runs === [1]  → o valor 2 nunca é processado
```

Isso afeta diretamente o `pagememory` (`savePageInfo` usa 100 ms/2000 ms): digitar por menos de 2 s após um
salvamento faz o valor final não ser gravado até o próximo evento.

Correção: em vez de descartar, reagendar para o fim da janela (*trailing edge*):

```js
_scheduleTrailing(params) {
  const wait = this.intervalBetweenRunsMs - (Date.now() - this._lastRun);
  clearTimeout(this._trailing);
  this._trailingResolve?.(undefined);          // a chamada substituída não fica pendurada
  return new Promise(resolve => {
    this._trailingResolve = resolve;
    this._trailing = setTimeout(() => {
      this._trailingResolve = null;
      resolve(this.exec(...params));
    }, wait);
  });
}
```

Documente também a chave de opções: `wrap(fn, { delayMs })` — o comentário da linha 224 usa `startDelayMs`, que é
ignorado. Aceitar ambos evita confusão: `delayMs: opts.delayMs ?? opts.startDelayMs`.

### CDN-03 — `pagememory`: `signal` errado (Alta) 🔎

`js/pagememory.js:434` declara `_savePageInfo(signal)`, mas o `Controller` chama `func(...params, signal)`.
Os chamadores passam argumentos: o `Observer` passa o `Event` ou a lista de mutações (linha 773) e
`handleWindowEvent` passa `true` (linha 791). Logo `signal` é um `Event`/array/boolean e as verificações
`signal?.aborted` nunca funcionam. (A cópia do CoverMaker tem o mesmo problema.)

```js
// Correção: ignorar parâmetros e pegar o último argumento
this.savePageInfo = Controller.wrap((...args) => this._savePageInfo(args.at(-1)), true, 100, 2000);
```

### CDN-04 — Prototype pollution em `mergeObjects` (Alta) 🧪

`js/object.js:70-83`. `for (let key in obj2)` sobre um objeto vindo de `JSON.parse` inclui a chave `__proto__`;
`obj1['__proto__']` é `Object.prototype` e o merge recursivo grava nele.

```js
mergeObjects({}, JSON.parse('{"__proto__":{"polluted":"yes"}}'));
({}).polluted   // "yes"
```

Correção:

```js
const UNSAFE = new Set(['__proto__', 'constructor', 'prototype']);
for (const key of Object.keys(obj2)) {
  if (UNSAFE.has(key)) continue;
  …
}
```

### CDN-05 — `SearchEngine.sort` não ordena (Alta) 🧪

`js/search.js:95`: `results.slice().sort(...)` ordena uma cópia descartada e a linha 107 devolve `results`
sem alteração. Teste: `se.search([{v:2},{v:1},{v:3}], '', [{fields:['v'], type:'asc'}])` → `[2, 1, 3]`.
Correção: `return results.slice().sort(...)` (e retornar esse valor).
Também afeta o modo "lax": a ordenação por pontuação é feita, mas o desempate pedido pelo chamador não.

### CDN-06 — `cleanObject` (Alta) 🧪

`js/object.js:64`: `obj = cleanObject(obj[key])` troca a referência do objeto que está sendo percorrido.
`cleanObject({a:1, d:{e:1,f:2}, g:null, h:{i:5}})` devolve `{"e":1,"f":2}`.

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

### CDN-07 — Restauração de atributos sobrescreve HTML novo (Média) 🔎

`js/pagememory.js:653-661` restaura **todos** os atributos salvos, exceto uma lista de exclusão. Se uma nova versão
do site mudar `min`, `max`, `placeholder`, `onclick`, `src`, `href`… do elemento, a versão antiga gravada no IndexedDB
volta a valer. O atributo interno `added-trigger` também é salvo e restaurado.

Sugestões: (a) usar lista de **inclusão** (apenas `value`, `checked`, `open`, `selected`, atributos declarados em
`save="attr1 attr2"`); (b) versionar o registro (`{version, data}`) e descartar se a versão do app mudou;
(c) incluir `added-trigger` na lista ignorada.

### CDN-08 — `outerHTML` gravado a cada salvamento (Média) 🧪

`js/pagememory.js:459` grava `document.documentElement.outerHTML` em todo salvamento (campo `dom`), mas a restauração
nunca o lê. No CoverMaker isso dá ~340 KB por gravação (medido). Remova o campo ou torne-o opcional (`this.saveDom = false`).

Outros pontos do mesmo módulo:
- Cada elemento com `save` ganha **dois** gatilhos de salvamento (listener próprio + um `Observer` com
  `MutationObserver` em `subtree`), e o salvamento chama `getElementsToSave()` → `querySelectorAll` + criação de
  objetos por elemento. Em páginas grandes (CoverMaker marca `#leftSide` e `#rightSide` inteiros com `save`),
  qualquer clique ou mutação dispara uma varredura completa.
- `blobCache`/`blobSignatureCache` crescem sem limite; a assinatura `type-size` pode colidir entre imagens
  diferentes com o mesmo tamanho em bytes. Use um hash do conteúdo (ex.: `crypto.subtle.digest('SHA-1', …)`).
- `select` é restaurado por `selectedIndex`; se as opções forem populadas depois (ou mudarem de ordem), o valor
  restaurado é outro. Salve `value`.
- A chave do registro é `location.href` completo (inclui `?query` e `#hash`): qualquer parâmetro na URL cria outro "estado".
- Não há salvamento no `beforeunload` (o `handleWindowEvent` existe mas nunca é registrado).

### CDN-09 — Seletor sem escape e `destroy()` quebrado (Média) 🔎

- `js/pagememory.js:931` (e `base.js:88`): `#${element.id}` sem `CSS.escape` — ids como `1abc`, `a.b`, `a:b`
  geram `SyntaxError` no `querySelector` e o elemento é silenciosamente ignorado na restauração.
  Use `#${CSS.escape(element.id)}` e `CSS.escape` nas classes.
- `js/pagememory.js:999-1014`: `destroy()` apaga todas as propriedades e depois chama `this.blobCache.clear()`
  → `TypeError`. Mova os `clear()` para antes do loop. Note também que `destroy()`/`reset()` **apagam os dados
  salvos** (`cleanMemory → clearSavedMemory`), o que pode não ser o esperado de um "destroy".

### CDN-10 — `TableSorter` (Média) 🔎

- `js/TableSorter.js:32,40`: `Date.parse(...)` já devolve número; `.getTime()` lança `TypeError`, capturado pelo
  `try/catch` → o comparador retorna sempre `0`. Correção: `Date.parse(x.innerText)` (ou `|| 0` para datas inválidas).
- `Sorters.Default` retorna `-1` para `x<y` (quando não-descendente) e `Sorters.Number/Date` retornam `-1` para `x>y`.
  Como `GenerateSortedData` sempre chama com `Descending = true`, colunas numéricas e textuais ordenam em sentidos opostos
  no mesmo clique. Padronize: comparadores sempre ascendentes e inverter na aplicação.
- `DefaultSort_Vanilla` (linha 231) retorna **booleano**; `Array.prototype.sort` exige número negativo/zero/positivo.
  É o comparador usado em colunas sem configuração. Correção: `a.localeCompare(b, undefined, {numeric: true})`.
- O cache `_sortValue` nunca é invalidado: se o conteúdo da célula mudar, ordena pelo valor antigo — justamente o caso
  que o `Observer` do componente pretende tratar. Limpe o atributo em `reIndex()`.
- Linha 197: `return; this.Header.Cells = [];` — o código após o `return` é morto; sem `<thead>` o construtor quebra
  em `SetupHeader`. Inicialize `Cells = []` antes do `return`.
- `AddCollumnIcon` reescreve `innerText` do `<th>`, destruindo ícones/elementos internos do cabeçalho.
- Linhas `_sortignore` dentro do `tbody` desalinham o índice usado em `ApplySortToTable`.
- A demo usa `data-sorttype`, atributo que o componente não lê.

### CDN-11 — `Observer` (Média) 🔎

- `js/observer.js:20-26`: `'oncontextmenu'`, `'onresize'`, `'oncopy'`, `'oncut'`, `'onpaste'` não são nomes de evento
  para `addEventListener` (o correto é sem `on`). `load`, `DOMContentLoaded`, `readystatechange`, `focus`, `blur`
  não borbulham até um elemento — nunca chegam ao callback quando o alvo é `document.body`.
- `RemoveCallBack(index)` (linhas 93-97) usa `callback` inexistente → `ReferenceError`. Correção:
  ```js
  RemoveCallBack(index) {
    const [cb] = this.callbacks.splice(index, 1);
    if (cb) this.RemoveListeners(cb);
  }
  ```
- `base.js` liga um `Observer` em `document.body` com `subtree + attributes + characterData` e eventos como
  `mousemove`/`scroll` em **toda** página que inclui `base.js` — custo constante só para atualizar a posição do mouse,
  que além disso alterna entre `clientX` (listener de `mousemove`) e `screenX` (callback do Observer).
  Sugestão: remover o Observer global e manter só o listener `mousemove` com `{ passive: true }`.

### CDN-12 — Página de demonstração quebrada (Média) 🧪

`script.js:123`: `Controller.wrap` devolve a função `exec` com `.Controller`, sem método `addEvent` →
`TypeError: demoAsyncFunc.addEvent is not a function`. O script para ali: as seções `object.js`, `treelist.js`,
`TableSorter.js` e `pagememory.js` não renderizam (verificado no Chromium) e o botão "Clear Saved Memory" lança
`ReferenceError` (`pageMemoryInstance` em TDZ). Linhas 160-162 têm o mesmo problema (`SearchFunction.exec`,
`SearchController` inexistente).

```js
demoAsyncFunc.Controller.addEvent('onDone', …);
SearchFunction.Controller.startDelayMs = 300;
// remover as linhas 161-162
```

Também: o texto da demo diz que o `pagememory` usa `localStorage` (usa IndexedDB) e o `<p>` da seção themeControl
(`index.html:55`) não é fechado.

### CDN-13 — HTML não escapado (Média) 🔎

- `popupmessage.js:18-21`: `${this._title}` e `${this._message}` em `innerHTML`.
- `treelist.js:69,85`: `summary.innerHTML = key`.

Se esses componentes exibirem dados de API/usuário, há XSS. Use `textContent` por padrão e uma opção explícita
`allowHTML` quando necessário. No `PopupMessage`, os triggers são obrigatórios: `new PopupMessage('x')` sem triggers
lança `TypeError` (linha 23); use `?.bind` ou *no-ops* padrão. `transitionend/transitionstart` não equivalem a
"fechou/abriu" e `close()` não chama `onClose`. `removeMessage` com `indexOf === -1` remove a última mensagem do array.

### CDN-14 — `safeWindowsFileName` (Média) 🧪

`js/common.js:131`: a normalização `NFKD` é feita **depois** da troca de caracteres proibidos e converte
caracteres de largura total em ASCII: `'a／b：c'` → `'a/b:c'`. Normalize primeiro (preferencialmente `NFC`, que não
remove acentos) e depois substitua. Trate também o resultado vazio (`''` → `'_'`) e o limite de 255 caracteres.

### CDN-15 — `themeControl` (Média) 🔎

- `getCSSRulesWithColors` (linha 171): regras sem `.style` (`@media`, `@supports`, `@keyframes`) fazem
  `isColorRule(undefined)` lançar erro dentro do loop; o `try/catch` externo então **pula o resto daquela folha de estilo**.
  Percorra `rule.cssRules` recursivamente e ignore regras sem `style`.
- `isValidHex` aceita qualquer string que comece com 3 dígitos hex e `hexToRgb` exige 6 → `#fff` lança erro em `shiftColor`.
- `fixColorAngle`: valores exatamente `256`/`-256` produzem componente `256` (`"#100…"`, cor inválida). Use `((v % 256) + 256) % 256`.
- `rgbaToHex` com alfa fracionário gera `"7f.8"`; o `split('.')` posterior corta a cor. Use `Math.round`.
- Linha 206: `selector != ':root' || !selector.startsWith('#') || !selector.startsWith('.')` é sempre verdadeira
  (deveria ser `&&`). E `'.' + element.className` com várias classes gera um seletor de descendente errado.
- `let themeShifted = 1` (linha 5) desloca a primeira cor em 1 sem o usuário mexer; deveria iniciar em `0`.
- `JSON.parse(localStorage...)` sem `try/catch`.

### CDN-16 — `SearchEngine` (Baixa) 🔎

- Operador `!=` (linhas 181-186): "algum campo diferente" — praticamente todo objeto com mais de um campo casa.
  Semântica provável: "nenhum campo igual" (`!flatItem.some(... queryValues.has(...))`).
- Cache por identidade (`WeakMap`) não percebe `push`/`splice` no mesmo array → resultados velhos.
  Ofereça `clearCache(array)` ou chave por versão.
- Resultados do cache são devolvidos por referência: se o chamador ordenar/alterar, o cache fica corrompido.

### CDN-17 — Diversos (Baixa) 🔎

- `utils.makeObjbyPath` não retorna o objeto; com `obj = null` o resultado se perde. Adicione `return obj;`.
- `common.js:1-56`: protótipos estendidos por atribuição são **enumeráveis** (`for…in` em arrays passa a listar
  `sortInsensitive`, `eachWordUp`…). Use `Object.defineProperty(Array.prototype, 'x', { value, enumerable: false })`
  e, no longo prazo, funções utilitárias em vez de alterar protótipos nativos.
- `GetValueFromPath` lança em caminhos inexistentes; use `o?.[i]`.
- `FetchQueue.fetch` não verifica `res.ok` e não devolve Promise (não dá para `await`).
- `base.js:121-129`: `getUniqueSelectorOnClick` usa `this` em *arrow function* de topo (vira `window.page`).
- `JCGWeb.Functions = {}` sobrescreve funções registradas por um carregamento anterior.

### CDN-18 — README (Baixa) 🔎

O README foi gerado automaticamente e descreve APIs inexistentes (`JCGWeb.PageMemory.saveElementState/loadAll`,
`JCGWeb.PopupMessage.show`, `JCGWeb.ThemeControl.setTheme/loadSavedTheme`, `JCGWeb.TreeList.render`),
contém erro de sintaxe (`function function loadInput()`), diz que o `pagememory` usa `localStorage` e manda incluir
`https://jeffersoncgo.github.io/cdn/script.js` (o script da demo, que quebra em outras páginas).
Sugestão: substituir as seções de API por exemplos de [`DOCUMENTACAO.md`](DOCUMENTACAO.md).

---

## Melhorias recomendadas (roteiro)

1. **Versionar o CDN.** Publicar tags (`v1.0.0`) e servir por jsDelivr (`https://cdn.jsdelivr.net/gh/jeffersoncgo/cdn@v1.0.0/js/controller.js`)
   ou pastas `/v1/`. Consumidores remotos (content-recommender) passam a fixar versão; adicionar SRI (`integrity`).
2. **Fonte única.** O CoverMaker mantém cópias divergentes em `js/vendor/` (o `pagememory.js` de lá tem um fallback
   para Blob URLs revogadas que não existe aqui). O workflow do CoverMaker já faz `checkout` com `submodules: recursive`:
   transformar `js/vendor` em submódulo deste repositório (ou consumir a versão tagueada) elimina a divergência.
3. **Testes.** Os módulos `controller`, `object`, `search` e `common` são puros e testáveis em Node (já exportam via
   `module.exports`). Um `node --test` com os casos reproduzidos nesta auditoria pegaria todas as regressões acima.
   Rodar no workflow antes do deploy.
4. **ES Modules opcionais.** Manter os globais por compatibilidade, mas oferecer `export` (ex.: `js/esm/controller.js`),
   permitindo `import { Controller } from '…'` sem poluir `window`.
5. **Segurança por padrão.** `textContent` em vez de `innerHTML` nos componentes de UI; whitelist de atributos no
   `pagememory`; guardas contra `__proto__` em todo merge/atribuição por caminho (`MakeObjFromPath`, `makeObjbyPath`).
6. **pagememory mais leve.** Delegação de eventos no `document` (um listener só) em vez de um `Observer` por elemento;
   remover o campo `dom`; salvar `value` dos `select`; versão de esquema no registro.
7. **Tipos/JSDoc.** Completar JSDoc com `@param/@returns` e publicar um `index.d.ts` para autocompletar nos projetos consumidores.
