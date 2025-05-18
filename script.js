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

function demoMakeObjByPath() {
  let obj = {};
  utils.makeObjbyPath(obj, 'test.deep.property', 'Hello from common.js!');
  document.getElementById('common-makeobj-result').textContent = JSON.stringify(obj);
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


// --- controller.js Demo ---
let controllerLogOutput;
if (typeof Controller !== 'undefined') {
  controllerLogOutput = document.getElementById('controller-log');
  async function demoAsyncFunc(query, signal) {
    const delay = query === 'fast_query' ? 500 : 2000;
    controllerLogOutput.innerHTML = `Starting fetch for: ${query} (will take ${delay}ms)<br>` + controllerLogOutput.innerHTML;
    await new Promise(resolve => setTimeout(resolve, delay));
    if (signal.aborted) {
      controllerLogOutput.innerHTML = `Fetch ABORTED for: ${query}<br>` + controllerLogOutput.innerHTML;
      throw new DOMException('Aborted by Controller', 'AbortError');
    }
    return `Data for ${query}`;
  }
  const demoController = new Controller(
    demoAsyncFunc,
    (result, query) => { controllerLogOutput.innerHTML = `SUCCESS: ${result} (Original: ${query})<br>` + controllerLogOutput.innerHTML; },
    (error) => { controllerLogOutput.innerHTML = `ERROR: ${error.message}<br>` + controllerLogOutput.innerHTML; },
    (query) => { controllerLogOutput.innerHTML = `ABORTED by new call (Original: ${query})<br>` + controllerLogOutput.innerHTML; },
    true // AbortPreviousOnExecute = true
  );
  window.demoControlledFetch = (query) => {
    demoController.exec(query);
    if (query === 'slow_query') {
      setTimeout(() => demoController.exec('fast_query_interrupts_slow'), 700);
    }
  };
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
      alert('Parent with ID "base-find-parent" found!');
      parentDiv.style.border = '2px solid red';
      setTimeout(() => parentDiv.style.border = '', 2000);
    } else {
      alert('Parent not found.');
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
if (typeof TableSorter !== 'undefined' && typeof Sorters !== 'undefined') {
  const sortConfig = {
    'Name': Sorters.Default,
    'Age': Sorters.Number,
    'JoinDate': Sorters.Date,
  };
  new TableSorter('demoSortableTable', sortConfig, false);
} else {
  console.error("TableSorter or Sorters not loaded.");
}

// --- windows.js Demo ---
if (typeof JCGWeb !== 'undefined' && JCGWeb.Windows) {
  window.demoCreateWindow = () => {
    const win = JCGWeb.Windows.AddWindow();
    win.title = "Demo Window";
    win.icon = "<span>📄</span>"; // Simple icon
    const content = document.createElement('p');
    content.innerHTML = "This is a window created by <strong>windows.js</strong>. You can drag it by its title bar.";
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type here...';
    win._elements = [content, input];
    win._buttons = ['info', 'minimize', 'maximize', 'close']; // Use default buttons
    win.Create_Window();
    win.Show(undefined, undefined, '400px', '200px', true); // Show centered
  };

  window.demoCreatePopup = () => {
    JCGWeb.Windows.CreatePopup(
      "Confirmation",
      "Are you sure you want to perform this action?",
      "<span>❓</span>", // Icon
      true, // Close button
      "Yes, Proceed",
      (e) => { alert('Proceed clicked!'); JCGWeb.Windows.CloseWindowByEvent(e); },
      "No, Cancel",
      (e) => { alert('Cancel clicked!'); JCGWeb.Windows.CloseWindowByEvent(e); }
    );
  };
} else {
  console.error("JCGWeb.Windows not loaded.");
}

// --- pagememory.js Demo ---
let pageMemoryInstance;
if (typeof pageMemory !== 'undefined') {
  pageMemoryInstance = new pageMemory(); // Initialize
  window.myCustomTriggerHandler = function (element) {
    console.log(`Custom trigger for ${element.id}! Its value is: ${element.value}`);
    alert(`PageMemory custom trigger fired for element ID: ${element.id}\nValue: ${element.value}`);
    element.style.border = "2px solid green";
    setTimeout(() => element.style.border = "", 2000);
  };
} else {
  console.error("pageMemory not loaded.");
}

// themeControl.js initializes itself by adding a button.
// No specific demo function needed here, just ensure the page has styled elements.
