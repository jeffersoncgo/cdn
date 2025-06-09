if (typeof module != 'undefined') {
  Observer = require("./observer");
  Controller = require("./controller");
  TreeListManager = require("./treelist");
  TableSorter = require("./tablesorter");
  pageMemory = require("./pagememory");
}


document.getElementById('currentYear').textContent = new Date().getFullYear();

// --- common.js Demo ---
if (typeof utils !== 'undefined') {
  document.getElementById('common-script-url').textContent = utils.CurrentScriptUrl || 'common.js not fully loaded';
  document.getElementById('common-script-name').textContent = utils.CurrentScriptName || 'common.js not fully loaded';
  document.getElementById('common-page-url').textContent = utils.CurrentUrl;
  document.getElementById('common-page-path').textContent = utils.CurrentUrlPath;
} else {
  console.error("common.js (utils) not loaded.");
  ['common-script-url', 'common-script-name', 'common-page-url', 'common-page-path'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = "Error: common.js not loaded";
  });
}

async function getDummyData() {
  const response = await fetch("dummy/users.json")
  const data = (await response.json())["users"];
  const allFields = flattenKeys(data[0]);
  const fieldSelector = document.getElementById('fieldSelector');
  allFields.forEach(field => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" value="${field}" checked> ${field}`;
    fieldSelector.appendChild(label);
    fieldSelector.appendChild(document.createElement('br'));
  });
  return data;
}

function demoMakeObjByPath() {
  try {
    let obj = {};
    const path = document.getElementById('common-makeobjpath-input').value;
    const value = document.getElementById('common-makeobjvalue-input').value;
    utils.makeObjbyPath(obj, path, value);
    document.getElementById('common-makeobj-result').textContent = JSON.stringify(obj);
  } catch (error) {
    document.getElementById('common-makeobj-result').textContent = error.message
    console.error(error);
  }
}
function demoSafeFilename() {
  const input = document.getElementById('common-filename-input').value;
  document.getElementById('common-safe-filename').textContent = utils.safeWindowsFileName(input);
}

// --- observer.js Demo ---
let observerInstance;
if (typeof Observer !== 'undefined') {
  const observedEl = document.getElementById('observedElement');
  const observerLog = document.getElementById('observer-log');
  observerInstance = new Observer(observedEl);
  observerInstance.AddCallBack((mutationsList, obs) => {
    if (mutationsList && mutationsList.length > 0 && !(mutationsList[0] instanceof Event)) { // It's a mutation
      mutationsList.forEach(mutation => {
        let logMsg = `Mutation: ${mutation.type}. `;
        if (mutation.type === 'attributes') logMsg += `Attr: ${mutation.attributeName}. Old: ${mutation.oldValue}`;
        if (mutation.type === 'childList') logMsg += `${mutation.addedNodes.length} added, ${mutation.removedNodes.length} removed.`;
        if (mutation.type === 'characterData') logMsg += `New data: "${observedEl.textContent.substring(0, 20)}..."`;
        observerLog.innerHTML = logMsg + '<br>' + observerLog.innerHTML;
      });
    }
  });
  observerInstance.AddCallBack((event) => { // For DOM events
    if (event instanceof Event) {
      observerLog.innerHTML = `Event: ${event.type} on target ${event.target.id || event.target.tagName}<br>` + observerLog.innerHTML;
    }
  });
  observerInstance.Start();
} else {
  console.error("Observer class not loaded.");
}
function observerDemoAddAttribute() {
  const el = document.getElementById('observedElement');
  el.setAttribute('data-timestamp', Date.now());
}
function observerDemoAddChild() {
  const el = document.getElementById('observedElement');
  const newChild = document.createElement('p');
  newChild.textContent = "New child added at " + new Date().toLocaleTimeString();
  el.appendChild(newChild);
}

  let demoAsyncFunc = async query => {
    const delay = query === 'fast_query' ? 500 : 2000;
    demoAsyncFunc.Controller.startDelayMs = delay;
    controllerLogOutput.innerHTML = `Starting fetch for: ${query} (will take ${delay}ms)<br>` + controllerLogOutput.innerHTML;
    await new Promise(resolve => setTimeout(resolve, delay));
    return `Data for ${query}`;
  }

  let SearchFunction = async function () {
    const input = document.getElementById('searchInput').value;
    const fields = [...document.querySelectorAll('#fieldSelector input:checked')]
      .map(cb => cb.value);

    console.log(window.users)
    const results = searchInArray(window.users, input, fields);
    return results;
  };

  document.addEventListener('DOMContentLoaded', async () => {
    window.users = await getDummyData();
  });

// --- controller.js Demo ---
let controllerLogOutput;
if (typeof Controller !== 'undefined') {
  controllerLogOutput = document.getElementById('controller-log');

  const demoController = new Controller(demoAsyncFunc.bind(this));
  demoAsyncFunc = demoController

  demoAsyncFunc.addEvent("onDone", (result, query) => controllerLogOutput.innerHTML = `SUCCESS: ${result} (Original: ${query})<br>` + controllerLogOutput.innerHTML)
  demoAsyncFunc.addEvent("onError", (error) => controllerLogOutput.innerHTML = `ERROR: ${error.message}<br>` + controllerLogOutput.innerHTML)
  demoAsyncFunc.addEvent("onAbort", (query) => controllerLogOutput.innerHTML = `ABORTED by new call (Original: ${query})<br>` + controllerLogOutput.innerHTML)

  demoAsyncFunc.startDelayMs = 0

  demoAsyncFunc = demoAsyncFunc.exec.bind(demoAsyncFunc);

  demoAsyncFunc.Controller = demoController;


  window.demoControlledFetch = (query) => {
    demoAsyncFunc(query);
    if (query === 'slow_query') {
      demoAsyncFunc.Controller.startDelayMs = 2000;
      demoAsyncFunc('fast_query_interrupts_slow');
    } else {
      demoAsyncFunc.Controller.startDelayMs = 0;
      demoAsyncFunc(query);
    }
  };

  // 🧠 Controller-bound Search Function


  // 📡 Bind via Controller
  const SearchController = new Controller(SearchFunction.bind(this));
  SearchFunction = SearchController;

  const searchResult = document.getElementById('searchResult');

  SearchFunction.addEvent("onDone", (result) => {
    TreeListManager.TreeHTML(result).then(() => {
      searchResult.innerHTML = ''; // Clear previous
      searchResult.appendChild(TreeListManager.document);
    });
  });

  SearchFunction.addEvent("onError", (error) => {
    searchResult.innerHTML = `ERROR: ${error.message}<br>`;
  });

  SearchFunction.startDelayMs = 300;
  SearchFunction = SearchFunction.exec.bind(SearchFunction);
  SearchFunction.Controller = SearchController;


  // 🎯 Trigger search as user types or changes checkboxes
  document.getElementById('searchInput').addEventListener('input', () => {
    SearchFunction();
  });
  fieldSelector.addEventListener('change', () => {
    SearchFunction();
  });
    
} else {
  console.error("Controller class not loaded.");
}


// --- base.js Demo ---
if (typeof JCGWeb !== 'undefined' && JCGWeb.Variables && JCGWeb.Variables.Mouse) {
  const mouseXEl = document.getElementById('base-mouse-x');
  const mouseYEl = document.getElementById('base-mouse-y');
  // JCGWeb.Observer (from base.js) should be updating these
  setInterval(() => {
    mouseXEl.textContent = JCGWeb.Variables.Mouse.X;
    mouseYEl.textContent = JCGWeb.Variables.Mouse.Y;
  }, 100);

  window.demoCreateElement = () => {
    const [newP] = JCGWeb.Functions.CreateElementFromHTML('<p class="text-green-600">Hello from CreateElementFromHTML!</p>');
    document.getElementById('base-created-elements-container').appendChild(newP);
  };

  document.getElementById('base-find-child-btn').addEventListener('click', (event) => {
    const parentDiv = JCGWeb.Functions.FindComponentFromEvent(event, 'id', 'base-find-parent');
    if (parentDiv) {
      console.log('Parent with ID "base-find-parent" found!');
      parentDiv.style.border = '2px solid red';
      setTimeout(() => parentDiv.style.border = '', 2000);
    } else {
      console.log('Parent not found.');
    }
  });
  // For getUniqueSelectorOnClick
  const uniqueSelectorOutput = document.getElementById('base-unique-selector-output');
  const htmlEl = document.querySelector('html');
  const originalGetAttribute = htmlEl.getAttribute; // Store original
  htmlEl.setAttribute = function (name, value) { // Monkey-patch to update our span
    HTMLHtmlElement.prototype.setAttribute.apply(this, arguments);
    if (name === 'data-clicked-selector') {
      uniqueSelectorOutput.textContent = value;
    }
  };


  const safePosChild = document.getElementById('base-safe-pos-child');
  const safePosParent = document.getElementById('base-safe-pos-parent');
  window.demoMakeSafePos = (left = 0, top = 0) => {
    const safePos = JCGWeb.Functions.MakeSafePos(
      parseFloat(getComputedStyle(safePosChild).width),
      parseFloat(getComputedStyle(safePosChild).height),
      left,
      top,
      safePosParent
    );
    safePosChild.style.left = safePos.left + 'px';
    safePosChild.style.top = safePos.top + 'px';
    console.log('MakeSafePos applied:', safePos);
  };

} else {
  console.error("JCGWeb (base.js) not fully loaded.");
}

// --- object.js Demo ---
if (typeof GetValueFromPath !== 'undefined') {
  const sampleObj = { user: { name: 'Alice', details: { age: 30 } } };
  document.getElementById('object-getvalue-result').textContent = GetValueFromPath('user.details.age', sampleObj);

  let objForMake = {};
  MakeObjFromPath('app.settings.theme', 'dark', objForMake);
  document.getElementById('object-makeobj-result').textContent = JSON.stringify(objForMake);

  const dirtyObj = { a: 1, b: null, c: '', d: { e: undefined, f: [] }, g: [1, 2], h: {} };
  document.getElementById('object-clean-result').textContent = JSON.stringify(cleanObject(JSON.parse(JSON.stringify(dirtyObj))));


  let objA = { a: 1, b: { x: 10 } };
  let objB = { b: { y: 20 }, c: 3 };
  document.getElementById('object-merge-result').textContent = JSON.stringify(mergeObjects(objA, objB));
} else {
  console.error("object.js functions not loaded.");
}


// --- treelist.js Demo ---
if (typeof TreeListManager !== 'undefined') {
  const treeJsonData = {
    "Project Files": {
      "src": {
        "components": {
          "Button.js": "Button component code",
          "Card.js": "Card component code"
        },
        "App.js": "Main application file",
        "index.js": "Entry point"
      },
      "public": {
        "index.html": "Main HTML",
        "favicon.ico": "Favicon"
      },
      "package.json": "Project dependencies"
    },
    "Notes/ideas.txt": "Some quick notes here"
  };
  TreeListManager.TreeHTML(treeJsonData).then(html => {
    document.getElementById('treeContainer').appendChild(TreeListManager.document);
  });
} else {
  console.error("TreeListManager not loaded.");
}

// --- TableSorter.js Demo ---
//The colors of a rainbow appear in a specific order: red, orange, yellow, green, blue, indigo, and violet.
const RainbowSort = (x, y, Descending) => {
  const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
  let xValue = x.getAttribute('_sortValue');
  if (xValue == null) {
    xValue = colors.indexOf(x.innerText.toLowerCase());
    x.setAttribute('_sortValue', xValue);
  }
  let yValue = y.getAttribute('_sortValue');
  if (yValue == null) {
    yValue = colors.indexOf(y.innerText.toLowerCase());
    y.setAttribute('_sortValue', yValue);
  }
  const result = parseInt(xValue) - parseInt(yValue)
  return Descending ? -result : result;
} 

if (typeof TableSorter !== 'undefined' && typeof Sorters !== 'undefined') {
  const sortConfig = {
    'Name': Sorters.Default,
    'Age': Sorters.Number,
    'JoinDate': Sorters.Date,
    'RainbowColor': RainbowSort
  };
  new TableSorter('demoSortableTable', sortConfig, false);
} else {
  console.error("TableSorter or Sorters not loaded.");
}

// --- pagememory.js Demo ---
let pageMemoryInstance;
if (typeof pageMemory !== 'undefined') {
  pageMemoryInstance = new pageMemory(); // Initialize
  pageMemoryInstance.addEvent('onMemoryIsEmpty', () => console.log('Memory was empty'))
  pageMemoryInstance.addEvent('onRestoreSucess', () => console.log('Memory restored'))
  pageMemoryInstance.addEvent('onRestoreError', () => console.log('Could not restore memory'))
  pageMemoryInstance.addEvent('onSaveMemory', () => console.log('Memory was saved'))
  pageMemoryInstance.init();

  window.myCustomTriggerHandler = function (element) {
    console.log(`Custom trigger for ${element.id}! Its value is: ${element.value}`);
    console.log(`PageMemory custom trigger fired for element ID: ${element.id}\nValue: ${element.value}`);
    element.style.border = "2px solid green";
    setTimeout(() => element.style.border = "", 2000);
  };
} else {
  console.error("pageMemory not loaded.");
}

// themeControl.js initializes itself by adding a button.
// No specific demo function needed here, just ensure the page has styled elements.

if (typeof JCGWEB != 'undefined') {
  JCGWeb.pageMemory = new pageMemory();
}
