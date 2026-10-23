# JCGWeb CDN — Documentação técnica

> Referência escrita a partir do código-fonte (revisão `aa68604`).
> Bugs, riscos e melhorias estão em [`AUDITORIA.md`](AUDITORIA.md).
> Alguns exemplos do `README.md` da raiz descrevem APIs que **não existem**
> (ex.: `JCGWeb.PageMemory.saveElementState`, `JCGWeb.PopupMessage.show`). Use este documento como referência.

## 1. O que é

Uma coleção de utilitários JavaScript "vanilla" (sem build, sem módulos ES), publicada via GitHub Pages em
`https://jeffersoncgo.github.io/cdn/`. Cada arquivo é um `<script>` clássico que cria variáveis **globais**.

### Quem consome

| Projeto | Como consome | Observação |
|---|---|---|
| **CoverMaker** | Cópias locais em `js/vendor/` (`base`, `common`, `object`, `search`, `controller`, `pagememory`, `observer`, `fetchqueue`) | `pagememory.js` e `search.js` divergem da versão deste repositório (ver auditoria) |
| **content-recommender** | `<script src="https://jeffersoncgo.github.io/cdn/js/...">` direto do GitHub Pages | Recebe qualquer alteração publicada em `main` imediatamente, sem versionamento |

### Publicação

`.github/workflows/static.yml` publica o repositório inteiro no GitHub Pages a cada push em `main`
(ou manualmente via `workflow_dispatch`). Não há build, testes ou minificação.

## 2. Ordem de carregamento e dependências

| Arquivo | Globais criados | Depende de (em tempo de carga) | Depende de (em tempo de execução) |
|---|---|---|---|
| `js/base.js` | `JCGWeb`, `JCGWeb.Variables.Mouse`, `JCGWeb.Functions.*`, `OnPageLoad` | — | `Observer` (no `DOMContentLoaded`) |
| `js/common.js` | `utils`, extensões de `String.prototype` e `Array.prototype` | — | — |
| `js/object.js` | `GetValueFromPath`, `MakeObjFromPath`, `cleanObject`, `mergeObjects`, `flattenKeys`, `flattenValues`, `searchInArray`, `ArraySort`, `ArrayCaseEachWord`, `ArrayNormalize`, `JCGWeb.Functions.addEvent/deleteEvent/clearEvents/execEvents` | `JCGWeb.Functions` (base.js) | `String.prototype.eachWordUp` (common.js) |
| `js/pid.js` | `PID`, `JCGWeb.PID` (se `JCGWeb` existir) | — | — |
| `js/controller.js` | `Controller` | — | — |
| `js/observer.js` | `Observer` | — | — |
| `js/fetchqueue.js` | `FetchQueue` | — | — |
| `js/search.js` | `SearchEngine` (também em `window.SearchEngine`) | — | — |
| `js/pagememory.js` | `PageMemoryDB`, `pageMemory`, `JCGWeb.pageMemory` (instância **não inicializada**) | `Controller` | `Observer` |
| `js/TableSorter.js` | `Sorters`, `TableSorter` | — | `Observer`, `Controller` |
| `js/popupmessage.js` | `PopupMessage`, `PopuMessageManager` | `utils` (common.js), `PID` (pid.js) | — |
| `js/treelist.js` | `TreeListCreator`, `TreeListManager` | `utils` (common.js) | — |
| `js/themeControl.js` | `themeCtrl_*`, `shiftTheme`, `invertTheme`, `colorToHex`, … | `utils`, `Controller` | — |

Ordem segura recomendada:

```html
<script src="https://jeffersoncgo.github.io/cdn/js/common.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/base.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/pid.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/controller.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/observer.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/object.js"></script>
<!-- opcionais -->
<script src="https://jeffersoncgo.github.io/cdn/js/fetchqueue.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/search.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/pagememory.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/TableSorter.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/popupmessage.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/treelist.js"></script>
<script src="https://jeffersoncgo.github.io/cdn/js/themeControl.js"></script>
```

`popupmessage.js`, `treelist.js` e `themeControl.js` injetam o próprio CSS (`utils.AddStyle(utils.CurrentUrlToFile(...))`),
que é resolvido a partir da URL do `<script>` atual. Isso só funciona com `<script src>` clássico (não com
`type="module"` nem com código injetado via `eval`).

**Não inclua** `script.js` da raiz: é o script da página de demonstração e quebra fora dela.

## 3. Referência por módulo

### 3.1 `base.js`

Cria o namespace global `JCGWeb` e, no `DOMContentLoaded`, instancia `JCGWeb.Observer = new Observer(document.body)`
(observa **todo** o `body`: mutações + eventos de mouse/teclado/scroll).

| API | Descrição |
|---|---|
| `JCGWeb.Variables.Mouse.{X,Y}` | Última posição do mouse. Atualizado por `mousemove` (coordenadas de *client*) e pelo Observer (coordenadas de *screen*). |
| `JCGWeb.Functions.MakeSafePos(width, height, left, top, parent = document.body)` | Ajusta `left/top` para que um retângulo caiba dentro de `parent`. Retorna `{left, top}`. |
| `JCGWeb.Functions.CreateElementFromHTML(html)` | Faz parse com `DOMParser` e retorna `body.children` (HTMLCollection). Não sanitiza. |
| `JCGWeb.Functions.FindComponentFromEvent(event, lookFor, value)` | Sobe a árvore a partir de `event.target` até achar o elemento. `lookFor`: `'class'` (compara `className` inteiro), `'id'`, `'tag'` (`tagName` em maiúsculas), `'attr'` (existência), `'attr-value'` (`[nome, valor]`). Para no `BODY`. |
| `JCGWeb.Functions.getUniqueSelector(el)` | Gera um seletor CSS (`#id` ou `tag.classes:nth-child(n) > …` até o `html`). |
| `JCGWeb.Functions.getUniqueSelectorOnClick()` | A cada clique grava o seletor do alvo em `html[data-clicked-selector]`. |
| `JCGWeb.Functions.GetElementDimensions(el)` | `{width, height, top, left}` (absoluto à página; para `body/html` usa a janela). |

### 3.2 `common.js`

**Extensões de protótipos** (não enumeráveis: não aparecem em `for…in`):

- `String.prototype.eachWordUp()` — "título" (cada palavra com inicial maiúscula, resto minúsculo).
- `String.prototype.firstUpCase()` — só a primeira letra maiúscula.
- `Array.prototype.sortInsensitive()` (cópia ordenada sem diferenciar maiúsculas), `eachWordUp()`, `firstUpCase()`,
  `toCase(useLowerCase)`, `toLowerCase()`, `toUpperCase()`, `removeDuplicates()`.

**`class utils`** (somente membros estáticos):

| Membro | Descrição |
|---|---|
| `CurrentScriptUrl`, `CurrentScriptName`, `CurrentUrlToFile(name)` | URL do script em execução (`document.currentScript`) e de um arquivo "irmão". |
| `CurrentUrl`, `CurrentUrlPath`, `CurrentUrlParams`, `CurrentUrlHash`, `CurrentUrlHost`, `CurrentUrlHostname`, `CurrentUrlPort`, `CurrentUrlProtocol`, `CurrentUrlOrigin` | Atalhos para `window.location`. |
| `AddScript(url)`, `AddStyle(url)`, `AddMeta(name, content)` | Inserem `<script>`, `<link rel=stylesheet>` e `<meta>` no `<head>`. |
| `isClass(fn)` | `true` se a função for uma `class`. |
| `makeObjbyPath(obj, 'a.b.c', valor)` | Cria a estrutura aninhada mutando `obj` e retorna o objeto (cria um novo se `obj` for `null`). |
| `safeWindowsFileName(nome)` | Normaliza (NFKD), troca caracteres proibidos no Windows por `_`, remove pontos/espaços finais e prefixa nomes reservados (`CON`, `NUL`, …). |

### 3.3 `object.js`

| Função | Descrição |
|---|---|
| `GetValueFromPath('a.b', obj)` | Lê valor por caminho; `undefined` se algum nível não existir. |
| `MakeObjFromPath('a.b', valor, obj, sep = '.')` | Escreve valor por caminho criando objetos intermediários; retorna `obj`. Ignora caminhos com `__proto__`/`constructor`/`prototype`. |
| `flattenValues(obj)` | Lista `{path, value: String}` de todas as folhas (arrays viram `campo.0`, `campo.1`, …). |
| `flattenKeys(obj)` | Lista de caminhos das folhas (arrays são tratados como folha). |
| `cleanObject(obj)` | Remove `null`, `undefined`, `''`, arrays vazios e objetos vazios — inclusive os que ficam vazios após a limpeza; arrays são compactados. Altera e retorna o próprio `obj`. |
| `mergeObjects(destino, origem)` | Merge profundo de `origem` em `destino` (arrays são substituídos). Ignora as chaves `__proto__`, `constructor` e `prototype`. Retorna `destino`. |
| `searchInArray(array, query, fields = null)` | Filtra objetos cujo valor (em qualquer folha, ou apenas nos `fields` exatos) contenha `query` (case-insensitive). Usa cache por **identidade** do array (`WeakMap`) e por consulta. |
| `ArraySort(arr, ignoreCase)` | Ordena **no lugar**. |
| `ArrayCaseEachWord(arr)`, `ArrayNormalize(arr)` | Aplicam `eachWordUp` / `firstUpCase` em cada string. |
| `JCGWeb.Functions.addEvent/deleteEvent/clearEvents/execEvents` | *Mixins* que usam `this.events[nome]` — devem ser chamados com `.call(objeto)` ou copiados para um objeto que tenha `events`. |

### 3.4 `controller.js` — `Controller`

Envolve uma função assíncrona para obter **debounce**, **cancelamento da execução anterior** e **throttle**.

```js
new Controller(func, AbortBeforeRun = true, startDelayMs = 0, intervalBetweenRunsMs = 0)
```

- `exec(...params)` → agenda `func(...params, signal)` após `startDelayMs`. O último argumento recebido por `func`
  é sempre um `AbortSignal`.
  - Se já houver uma execução agendada/rodando, ela é abortada (`signal.aborted = true`), o evento `onAbort` dispara e
    a Promise dessa chamada **resolve com `undefined`** (antes ficava pendente para sempre). Quem faz `await` deve tratar
    o `undefined` como "substituída por uma chamada mais nova".
  - Se `AbortBeforeRun === false` e algo estiver rodando, a nova chamada é ignorada (`Promise.resolve()`).
  - Se a chamada ocorrer a menos de `intervalBetweenRunsMs` da última execução, ela é **adiada para o fim da janela**
    (só a última chamada adiada roda; as anteriores resolvem `undefined`). Antes ela era descartada.
- `abort(...params)` cancela o que estiver pendente.
- Eventos: `addEvent('onDone' | 'onAbort' | 'onError', cb)`, `deleteEvent`, `clearEvents`, `execEvents`.
  `onDone(result, ...params)`, `onAbort(...params)`, `onError(error)`.

`Controller.wrap(fn, abortBeforeRunOuOpcoes, startDelayMs, intervalBetweenRunsMs)` devolve uma função equivalente a
`exec` com a instância em `.Controller`:

```js
const buscar = Controller.wrap(async (texto, signal) => {
  const r = await fetch(`/api?q=${encodeURIComponent(texto)}`, { signal });
  return r.json();
}, { abortBeforeRun: true, delayMs: 300 });   // startDelayMs também é aceito como nome da opção

buscar.Controller.addEvent('onDone', resultado => console.log(resultado));
input.addEventListener('input', e => buscar(e.target.value));
```

> A função abortada só para de verdade se ela própria respeitar o `signal`.
> Mudança de 2026-10-23 (`CDN-01`/`CDN-02`): cada chamada tem estado próprio — uma execução antiga não resolve mais a
> Promise da nova nem apaga o timer dela.

### 3.5 `observer.js` — `Observer`

```js
const obs = new Observer(elemento = document.body);
obs.AddCallBack(cb);   // cb recebe (mutationsList, mutationObserver) OU (event)
obs.Start();
```

Combina um `MutationObserver` (`childList`, `subtree`, `attributes`, `characterData`) com *listeners* de eventos DOM
(`obs.Listeners`: `click`, `mouseover`, `mouseout`, `mousemove`, `keydown`, `keyup`, `keypress`, `submit`, `input`,
`change`, `focus`, `blur`, `load`, `contextmenu`, `scroll`, `wheel`, `resize`, `copy`, `cut`, `paste`). O mesmo callback recebe os dois tipos de notificação — diferencie com
`arg instanceof Event`.

Métodos: `Start()`, `Stop()`, `SetListeners(lista)`, `AddListener(nome)`, `RemoveListener(nome)`,
`RemoveListeners(cb)`, `RemoveAllListeners()`, `RemoveAllCallBacks()`, `RemoveAll()`, `Destroy()`.

### 3.6 `pid.js` — `PID`

Gerador sequencial: `const pid = new PID(10); pid.id // 10, depois 11, …`. `pid.id = 0` reinicia.

### 3.7 `fetchqueue.js` — `FetchQueue`

Fila de `fetch` com no máximo `fetchLimit` requisições simultâneas (padrão 5).

```js
const q = new FetchQueue(3);
q.fetch(url, { headers }, (json, response) => { /* sucesso */ }, erro => { /* falha de rede ou JSON inválido */ });
```

A resposta é sempre lida como JSON e `onDone` é chamado mesmo para status HTTP 4xx/5xx.

### 3.8 `search.js` — `SearchEngine`

```js
const se = new SearchEngine();
se.search(array, consulta, ordenacao = undefined, isLaxQuery = false)
```

- **Consulta simples** (string): item é retornado se qualquer folha contiver o texto.
- **Consulta complexa** (array de grupos):
  `[{ operator, fields: ['Genres', 'People.Name'], queries: [...] }, …]`
  - `operator`: `'all'` (todas as queries presentes), `'any'`, `'!='`, `'='`, `'>'`, `'<'`, `'..'` (intervalo `[min, max]`).
  - `fields` compara por **prefixo** do caminho achatado (`Genres` casa `Genres[0]`, `Genres[1]`…).
- **Modo estrito** (`isLaxQuery = false`): retorna itens que casam com **qualquer** grupo (OU).
- **Modo "lax"** (`isLaxQuery = true`): calcula uma pontuação por item, ordena por ela e retorna **cópias rasas**
  dos itens (não as referências originais).
- `ordenacao`: `[{ fields: ['CommunityRating'], type: 'desc' }, …]` — critérios aplicados em ordem (desempate pelo
  seguinte). O array de entrada não é alterado.
- Resultados são memorizados por identidade do array + JSON da consulta e devolvidos como cópia. Alterou o array no
  lugar? Chame `se.clearCache(array)` (ou `se.clearCache()` para tudo).
- `'!='` casa itens em que **nenhum** dos campos indicados é igual a algum dos valores.

### 3.9 `pagememory.js` — `pageMemory` / `PageMemoryDB`

Persiste o estado de elementos marcados com o atributo `save` (ou `data-save`) no **IndexedDB**
(banco `pageMemoryDB`, store `pageData`, chave = `window.location.href` completo).

```js
const memoria = new pageMemory();           // ou JCGWeb.pageMemory (já instanciado, com as opções padrão)
// Opções (todas opcionais, adicionadas em 2026-10-23):
// new pageMemory({ listeners: ['input', 'change', 'submit', 'toggle'], saveDelayMs: 500, saveIntervalMs: 2000, restoreDelayMs: 500 })
memoria.addEvent('onMemoryIsEmpty', () => { /* primeira visita */ });
memoria.addEvent('onRestoreSucess', registro => { /* estado restaurado */ });
await memoria.init();                       // abre o IndexedDB, registra listeners e restaura
```

O que é salvo por elemento:

| Elemento | Propriedade salva | Evento disparado ao restaurar |
|---|---|---|
| `input` checkbox/radio | `checked` | `change` |
| outros `input`, `textarea` | `value` | `input` |
| `select` | `selectedIndex` (índice, não o valor) | `change` |
| `details` | `open` | `toggle` |
| `option` | `selected` | `change` |
| `img` com `src` `blob:` | conteúdo da imagem em base64 (reaproveitado entre Blob URLs pelo `tipo-tamanho-SHA256` do conteúdo; FNV-1a fora de contexto seguro) | — |
| todos | atributos, exceto `id`, `class`, `style`, `data-*`, `aria-*`, `role`, `hidden`, `title`… | — |

- O elemento é localizado na restauração por um seletor CSS gerado (`#id` se houver, senão um caminho
  `tag.classes:nth-child()`); **dê `id` estável a todo elemento com `save`**.
- Atributo `customTrigger="nomeDeFuncaoGlobal"`: após restaurar, chama `window[nome](elemento)`.
- Cada gravação também guarda `document.documentElement.outerHTML` inteiro (campo `dom`), que não é usado na restauração.
- Salvamentos são disparados pelos eventos `input/change/click/submit/toggle` (configurável em `listeners`) e por
  mutações de DOM nos elementos marcados, com debounce de 100 ms (`saveDelayMs`) e intervalo mínimo de 2 s
  (`saveIntervalMs`). Uma alteração feita dentro do intervalo é salva no fim dele (antes era perdida).
- `canSave = false` suspende os salvamentos. Imagens `blob:` cuja URL já foi revogada são salvas a partir dos pixels
  do próprio `<img>` (vindo da cópia do CoverMaker).

Eventos: `onSaveMemory`, `onRestoreSucess`, `onRestoreError`, `onMemoryIsEmpty`, `onDBSuccess`, `onDBError`
(os nomes com "Sucess" são grafados assim no código).

Outros métodos: `clearSavedMemory()`, `cleanMemory()`, `reset()`, `destroy()`, `setDebug(true)`, `getStats()`,
`startAutoSave()/stopAutoSave()/setAutoSaveDelay(ms)` (o autosave periódico não é ligado por padrão).

### 3.10 `TableSorter.js`

```html
<table id="tabela" SortConfig="minhaConfig">
  <thead><tr><th sorttitle="Nome">Nome</th><th sorttitle="Idade">Idade</th><th _sortignore>Ações</th></tr></thead>
  <tbody>…</tbody>
</table>
<script>
  const minhaConfig = { 'Idade': Sorters.Number, 'Nome': Sorters.Default };
  new TableSorter('tabela', minhaConfig /* ou deixe vazio para usar table[SortConfig] */, /*hasFooter*/ false);
</script>
```

- Clique no `<th>` alterna ascendente/descendente; classes CSS aplicadas: `cansortcollumn`, `collumnsorted`,
  `sorted_ascending`, `sorted_descending`; um ícone (`⤴`/`⤵`) é anexado ao texto do cabeçalho.
- Comparadores: `(tdA, tdB, descending) => número`; com `descending = true` devem ordenar do maior para o menor (é assim
  que o componente os chama). Prontos em `Sorters.Default`, `Sorters.Number`, `Sorters.Date` (texto inválido vai para o fim).
  O valor calculado é guardado no atributo `_sortValue` da célula e recalculado a cada ordenação (células editadas
  ordenam pelo valor novo). O ícone fica num `<span class="tablesorter-icon">` dentro do `<th>`.
- Linhas com `_sortignore` ficam fora da ordenação. Um `Observer` reordena quando o `tbody` muda.
- Sem `<thead>` o componente apenas não cria cabeçalhos clicáveis.

### 3.11 `popupmessage.js`

```js
PopuMessageManager.addMessage('Salvo!', 'Sucesso', 3000,
  onMessage, onClose, onShow, onMessageClick, onTitleClick);   // callbacks opcionais
```

Mostra caixas empilhadas no canto inferior direito (`#messageHolder`) e retorna a instância `PopupMessage`.
Mensagem e título são inseridos como **texto**; para renderizar HTML (comportamento antigo) passe `true` como 9º
argumento (`allowHTML`) ou `triggers.allowHTML` no construtor. `onShow` dispara ao exibir e `onClose` ao fechar
(clique no ×, tempo esgotado ou `close()`). Objetos não-string são convertidos com `JSON.stringify`.

### 3.12 `treelist.js`

```js
const html = await TreeListManager.TreeHTML({ pasta: { 'arquivo.txt': 'conteúdo' } });
container.appendChild(TreeListManager.document);   // o <div> renderizado
TreeListManager.OpenAll(); TreeListManager.CloseAll();
```

Renderiza objetos/arrays como `<details>/<summary>` aninhados (chaves como texto) e valores primitivos como `<li>`.
Com `Sanitize = true` (padrão), chaves contendo `/` ou `\` viram níveis (`"a/b"` → `a > b`).

### 3.13 `themeControl.js`

Ao carregar, adiciona um botão (pincel) que abre uma barra fixa com: seletor de regra CSS, *slider* de deslocamento de
cor, lista de temas salvos, salvar/excluir tema e inverter cores. Opera reescrevendo os valores de cor das regras dos
`document.styleSheets` (inclusive dentro de `@media`/`@supports`) e dos estilos *inline*. Aceita cores `#rgb`,
`#rrggbb`, `#rrggbbaa`, `rgb()`, `rgba()`, `hsl()`; cada componente é deslocado com volta em 0…255. Folhas de estilo de
outros domínios são ignoradas.

Armazenamento: `localStorage.themeCtrlThemes` (JSON `{nome: [{selector, property, value}]}`) e
`localStorage.themeCtrlTheme` (tema ativo, reaplicado 100 ms após o carregamento).

## 4. Página de demonstração

`index.html` + `script.js` + `style.css` (Tailwind via CDN) demonstram cada módulo; `dummy/users.json` e
`dummy/products.json` são dados de exemplo (formato dummyjson.com: `{users|products, total, skip, limit}`).
Desde 2026-10-23 todas as seções carregam (antes a execução parava na seção do Controller, `CDN-12`).

Para rodar localmente (necessário servidor HTTP por causa do `fetch` dos JSONs):

```bash
python3 -m http.server 8080   # e abra http://localhost:8080/
```

## 5. Armazenamento no navegador

| Onde | Chave | Quem grava |
|---|---|---|
| IndexedDB `pageMemoryDB` / `pageData` | URL completa da página | `pagememory.js` |
| `localStorage.themeCtrlThemes`, `themeCtrlTheme` | — | `themeControl.js` |

## 6. Limitações gerais

- Tudo é global; dois arquivos que definam o mesmo nome se sobrescrevem silenciosamente.
- Sem versionamento: consumidores remotos sempre recebem a última versão de `main`.
- `common.js` adiciona métodos a `String.prototype`/`Array.prototype` (não enumeráveis).
- Sem testes automatizados.
