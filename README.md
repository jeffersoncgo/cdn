# 🚀 J's CDN - Client-Side JavaScript Utilities

Welcome to J's CDN! This repository hosts a collection of versatile JavaScript scripts designed for client-side web development. These utilities aim to simplify common tasks, enhance user interfaces, and manage application state with ease.

---

## 📜 General Usage

To use any of these scripts in your project, you can include them directly via a `<script>` tag, pointing to their location in this CDN.

```html
<script src="[https://jeffersoncgo.github.io/cdn/script.js](https://jeffersoncgo.github.io/cdn/script.js)"></script>
```

Ensure that dependencies are loaded before the scripts that rely on them. For example, `base.js` and `common.js` are often prerequisites for other scripts.

---

## 🛠️ Core Utilities

These scripts provide foundational functionalities and helper methods used across various other modules.

### 🔩 `base.js`

> **Core foundational script for the JCGWeb namespace and essential DOM utilities.**

`base.js` initializes the `JCGWeb` global namespace, which is used by many other scripts in this collection. It provides a set of fundamental tools for DOM manipulation, event handling, and mouse tracking.

* **Namespace:** `JCGWeb`
    * `JCGWeb.Variables.Mouse`: Stores current mouse X and Y coordinates.
    * `JCGWeb.Functions`: Container for utility functions.
    * `JCGWeb.Observer`: An instance of `Observer` (from `observer.js`) attached to `document.body` by default on page load, used for global mouse position tracking.
    * `JCGWeb.PID`: (Assumed) A utility for generating unique process/instance IDs, used by `windows.js` and potentially others.

* **Key Features & Functions:**
    * `JCGWeb.Functions.toObeserverGetMousePos(event)`: Updates `JCGWeb.Variables.Mouse` with event coordinates.
    * `JCGWeb.Functions.MakeSafePos(width, height, left, top, parent)`: Calculates safe on-screen coordinates for an element within its parent, preventing it from going off-screen.
    * `JCGWeb.Functions.CreateElementFromHTML(htmlString)`: Parses an HTML string and returns an array of DOM elements.
    * `JCGWeb.Functions.FindComponentFromEvent(event, LookFor, ValueToLook)`: Traverses up the DOM tree from an event target to find a parent element matching a specified criteria (class, id, tag, attribute, attribute-value).
    * `JCGWeb.Functions.getUniqueSelector(element)`: Generates a unique CSS selector for a given DOM element.
    * `JCGWeb.Functions.getUniqueSelectorOnClick()`: Adds a click listener to the page that logs and stores the unique selector of the clicked element.

* **Dependencies:**
    * `observer.js` (instantiated as `JCGWeb.Observer`)

* **How to Use:**
    Include `base.js` in your HTML. Its functionalities are then available under the `JCGWeb` namespace.

    ```html
    <script src="https://jeffersoncgo.github.io/cdn/base.js"></script>
    <script>
        // Example: Get unique selector for an element
        const myElement = document.getElementById('myElement');
        const selector = JCGWeb.Functions.getUniqueSelector(myElement);
        console.log(selector);

        // Example: Create an element from HTML
        const [newDiv] = JCGWeb.Functions.CreateElementFromHTML('<div>Hello World</div>');
        document.body.appendChild(newDiv);
    </script>
    ```

---

### 🔧 `common.js`

> **A collection of common utility functions for various tasks.**

The `utils` class provides static methods for common operations like URL manipulation, dynamically adding scripts and styles, and other helper functions.

* **Key Features & Functions (`utils` class):**
    * **Script Information:**
        * `utils.CurrentScriptUrl`: Gets the URL of the currently executing script.
        * `utils.CurrentScriptName`: Gets the filename of the currently executing script.
        * `utils.CurrentUrlToFile(FileName)`: Replaces the current script's filename in its URL with a new filename.
    * **URL Utilities:**
        * `utils.CurrentUrl`, `utils.CurrentUrlPath`, `utils.CurrentUrlParams`, etc.: Get various parts of the current window's URL.
    * **DOM Manipulation:**
        * `utils.AddScript(Url)`: Dynamically adds a `<script>` tag to the document head.
        * `utils.AddStyle(Url)`: Dynamically adds a `<link rel="stylesheet">` tag to the document head.
        * `utils.AddMeta(Name, Content)`: Dynamically adds a `<meta>` tag to the document head.
    * **Type Checking & Object Manipulation:**
        * `utils.isClass(input)`: Checks if the input is a JavaScript class.
        * `utils.makeObjbyPath(obj, path, value)`: Creates or updates a nested property in an object based on a dot-separated path string.
    * **File Utilities:**
        * `utils.safeWindowsFileName(filename)`: Sanitizes a string to be a safe filename for Windows.

* **Dependencies:** None.

* **How to Use:**
    Call the static methods directly from the `utils` class.

    ```html
    <script src="https://jeffersoncgo.github.io/cdn/common.js"></script>
    <script>
        // Example: Add a stylesheet
        utils.AddStyle('[https://example.com/styles.css](https://example.com/styles.css)');

        // Example: Get current URL path
        console.log(utils.CurrentUrlPath);

        // Example: Create a nested object property
        let myObj = {};
        utils.makeObjbyPath(myObj, 'user.settings.theme', 'dark');
        console.log(myObj); // { user: { settings: { theme: 'dark' } } }
    </script>
    ```

---

## 👁️ DOM & Event Handling

Scripts focused on observing and reacting to DOM changes and user interactions.

### 🧿 `observer.js`

> **A DOM Event and Mutation Observer Utility Class.**

`Observer` is a lightweight utility class to monitor a DOM element for structural changes (via `MutationObserver`) and listen to a comprehensive list of user interaction events.

* **Key Features:**
    * 👂 Listens to a wide array of user interaction events (keyboard, mouse, clipboard, etc.).
    * 🔁 Tracks DOM mutations (node additions/removals, attribute changes, character data changes).
    * 🧩 Supports multiple callback functions for mutations and events.
    * ♻️ Dynamically add/remove listeners and callbacks at runtime.
    * 🧹 Provides methods to start, stop, and destroy observation.
    * ⚙️ Configurable `MutationObserver` options (`config` property).

* **Default Listeners:**
    `click`, `mouseover`, `mouseout`, `mousemove`, `keydown`, `keyup`, `keypress`, `submit`, `input`, `change`, `focus`, `blur`, `load`, `unload`, `DOMContentLoaded`, `readystatechange`, `oncontextmenu`, `scroll`, `wheel`, `onresize`, `oncopy`, `oncut`, `onpaste`.

* **Dependencies:** None.

* **How to Use:**

    ```html
    <script src="https://jeffersoncgo.github.io/cdn/observer.js"></script>
    <script>
        const myElement = document.getElementById('myInteractiveElement');
        const observer = new Observer(myElement); // Defaults to document.body if no element provided

        // Callback for DOM mutations
        observer.AddCallBack((mutationsList, observerInstance) => {
            console.log('DOM mutated:', mutationsList);
            // mutationsList is an array of MutationRecord objects
        });

        // Callback for DOM events
        observer.AddCallBack((event) => {
            if (event instanceof Event) { // Check if it's a DOM event
                 console.log('User interacted:', event.type, event.target);
            }
        });

        observer.Start(); // Start observing

        // Later...
        // observer.AddListener('dragstart'); // Add a new event type to listen for
        // observer.RemoveCallBack(0); // Remove the first callback
        // observer.Stop(); // Stop observing
        // observer.Destroy(); // Stop and clean up
    </script>
    ```

* **Constructor:**
    `new Observer(targetElement = document.body)`
    * `targetElement`: The DOM element to observe.

* **API Highlights:**
    * `AddCallBack(callbackFn)`: Adds a function to be called on mutations or events.
    * `RemoveCallBack(index)`: Removes a callback by its index.
    * `Start()`: Begins observation.
    * `Stop()`: Halts observation.
    * `AddListener(eventType)`: Adds a new event type to the list of listened events.
    * `RemoveListener(eventType)`: Removes an event type.
    * `RemoveAllListeners()`: Removes all event listeners.
    * `RemoveAllCallBacks()`: Removes all registered callbacks.
    * `Destroy()`: Stops observation and cleans up all listeners and callbacks.

---

### 🎮 `controller.js`

> **A utility class to control and manage asynchronous function execution, allowing for aborting previous calls.**

`Controller` wraps a function to provide better control over its execution, especially useful for operations that might be triggered rapidly (like search-as-you-type or debounced actions) and where only the latest call is relevant.

* **Key Features:**
    * 🎁 Wraps an existing function.
    * 🚦 Manages execution state (`running`).
    * 🛑 Allows aborting an ongoing execution using `AbortController`.
    * 🔔 Provides callbacks for `ondone`, `onerror`, and `onabort`.
    * 🔄 Option to `AbortPreviousOnExecute`: If true, calling `exec()` while a previous execution is running will abort the old one.

* **Dependencies:** None.

* **How to Use:**

    ```html
    <script src="https://jeffersoncgo.github.io/cdn/controller.js"></script>
    <script>
        // Example function that might take time
        async function fetchData(query, signal) {
            console.log('Fetching data for:', query);
            // Simulate an API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (signal.aborted) {
                console.log('Fetch aborted for:', query);
                throw new DOMException('Aborted', 'AbortError');
            }
            return `Data for ${query}`;
        }

        const onDataFetched = (result, query) => {
            console.log('Success:', result, 'Original query:', query);
        };

        const onError = (error) => {
            console.error('Error:', error);
        };

        const onAborted = (query) => {
            console.log('Operation aborted by new call for query:', query);
        };

        // Create a controller, abort previous on new execution
        const controlledFetch = new Controller(fetchData, onDataFetched, onError, onAborted, true);

        // Execute the controlled function
        controlledFetch.exec('first query'); // Starts fetching

        setTimeout(() => {
            controlledFetch.exec('second query'); // Aborts 'first query', starts 'second query'
        }, 500);

        // To manually abort
        // setTimeout(() => {
        //     controlledFetch.abort('Manually aborted second query');
        // }, 1200);

        // Static bind usage (less common, binds 'this' context if needed for the function)
        // class MyClass {
        //   constructor() {
        //     this.data = "class data";
        //     this.myMethod = Controller.bind(this.actualMethod, null, null, null, true);
        //   }
        //   async actualMethod(param, signal) {
        //     console.log(this.data, param);
        //     await new Promise(r => setTimeout(r, 500));
        //     if(signal.aborted) throw new Error('Aborted');
        //     return "done";
        //   }
        // }
        // const instance = new MyClass();
        // instance.myMethod("call1");
        // instance.myMethod("call2"); // call1 will be aborted
    </script>
    ```

* **Constructor:**
    `new Controller(func, ondone, onerror, onabort, AbortPreviousOnExecute = false)`
    * `func`: The function to be controlled. It will receive an `AbortSignal` as its last argument.
    * `ondone`: Callback executed when `func` completes successfully. Receives `(result, ...originalParams)`.
    * `onerror`: Callback executed if `func` throws an error (not an `AbortError`). Receives `(error)`.
    * `onabort`: Callback executed if the operation is aborted. Receives `(...originalParams)`.
    * `AbortPreviousOnExecute`: Boolean, if true, new `exec` calls abort running ones.

* **API Highlights:**
    * `async exec(...params)`: Executes the wrapped function.
    * `abort(...params)`: Manually aborts the currently running function.
    * `static bind(...)`: A static helper to bind a function and wrap it in a Controller, returning the `exec` method.

---

## 🧩 UI Components

Scripts for creating and managing interactive user interface elements.

### 🖼️ `windows.js`

> **A comprehensive system for creating and managing draggable, resizable, and interactive windows or dialogs.**

`windows.js` (via `JCGWeb.Windows`) allows you to create rich window-like interfaces within your web page. These windows can contain custom content, buttons, and support standard window operations.

* **Key Features:**
    * ✨ Creates `Custom_Window` instances.
    * ↔️ Draggable and (optionally) resizable windows.
    * 🏷️ Customizable title and icon.
    * 🔘 Standard buttons (info, minimize, maximize, close) and custom buttons.
    * 📦 Can host arbitrary HTML elements as content.
    * 🪄 Helper methods for creating common popups (alerts, confirms) and media viewers.
    * 🗂️ Manages multiple window instances.

* **Dependencies:**
    * `base.js` (for `JCGWeb.Functions`, `JCGWeb.PID`).
    * An external `Config` object (e.g., `Config.UserConfig.ThemeIcons`) is used for theme-related settings. This needs to be defined elsewhere in your project.
    * (Implicitly) CSS for styling the windows. The script references classes like `custom-window`, `popup-text`, etc.

* **How to Use:**

    ```html
    <script src="https://jeffersoncgo.github.io/cdn/base.js"></script> <script>
        var Config = { UserConfig: { ThemeIcons: true } }; // Example Config
        var JCGWeb = JCGWeb || {}; JCGWeb.PID = { id: 0, get id() { return this.id++; } }; // Simplified PID for example
    </script>
    <script src="https://jeffersoncgo.github.io/cdn/windows.js"></script>
    <script>
        // Example 1: Create a simple custom window
        const myWindow = JCGWeb.Windows.AddWindow(); // Creates a window with default settings
        myWindow.title = "My First Window";
        myWindow.icon = "<span>🌟</span>"; // Can be HTML string for an icon

        const contentElement = document.createElement('p');
        contentElement.textContent = "Hello from my custom window!";
        myWindow._elements = [contentElement]; // Set content elements

        myWindow.Create_Window(); // Renders the window structure
        myWindow.Show(); // Shows the window (centered by default)

        // Example 2: Create a confirmation popup
        JCGWeb.Windows.CreatePopup(
            "Confirm Action", // Title
            "Are you sure you want to proceed?", // Text/HTML content
            "<span>❓</span>", // Icon HTML
            true, // Show default close button
            "Proceed", // OK button text
            (event) => { // OK callback
                console.log("Proceed clicked!");
                JCGWeb.Windows.CloseWindowByEvent(event); // Close the popup
            },
            "Cancel", // Cancel button text
            (event) => { // Cancel callback
                console.log("Cancel clicked!");
                JCGWeb.Windows.CloseWindowByEvent(event); // Close the popup
            }
        );

        // Example 3: Create an image viewer
        // JCGWeb.Windows.CreateImageViewer('[https://your-cdn.com/https://jeffersoncgo.github.io/cdn/image.jpg](https://your-cdn.com/https://jeffersoncgo.github.io/cdn/image.jpg)');

        // Note: For viewers (image, PDF, video, audio, text), ensure necessary helper functions
        // like `MakeIconElement`, `FetchTextData`, `CreateMidiaElement` are correctly
        // configured or paths (e.g., for icons) are valid.
        // The provided script uses paths like "/fileexplorer/themes/..." for icons.
    </script>
    ```

* **`Custom_Window` Constructor (Internal, usually via `JCGWeb.Windows.AddWindow()`):**
    `new Custom_Window(id, width, height, top, left, parent, sizeable, title, buttons, elements, icon)`

* **`JCGWeb.Windows` API Highlights:**
    * `AddWindow()`: Creates and returns a new `Custom_Window` instance.
    * `CreatePopup(Title, Text, Icon, CloseButton, OK_Text, OK_Callback, Cancel_Text, Cancel_Callback, CloseBtnFuncion)`: Versatile popup generator.
    * `CreateMessagePopup1Btn(Icon, Text_HTML, Message_HTML, OkFunction)`: Creates a popup with one button.
    * `CreateMessagePopup2Btn(Icon, Text_HTML, Message_HTML, OkFunction, CancelFunction)`: Creates a popup with two buttons.
    * `CreateImageViewer(ImageUrl)`, `CreatePDFViewer(PDFUrl)`, `CreateVideoViewer(VideoUrl)`, `CreateAudioViewer(AudioUrl)`, `CreateTextViewer(TextUrl)`: Helpers to create media/file viewers.
    * `GetWindowFromEvent(event)`, `GetWindowFromElement(element)`, `GetWindowFromID(id)`: Retrieve window instances.
    * `CloseWindowByEvent(event)`, `CloseWindowByElement(element)`: Close windows.

* **Important Notes:**
    * The script relies on CSS classes for styling. You'll need to provide appropriate CSS definitions.
    * Icon paths (e.g., `Config.UserConfig.ThemeIcons` and `JCGWeb.Windows.MakeIconElement`) might need adjustment based on your project structure.
    * Functions like `saveAs` (used in `CreateTextViewer`) would require an external library like FileSaver.js.

---

### 💬 `popupmessage.js`

> **Displays temporary, dismissible popup messages (toasts/notifications) on the screen.**

`popupmessage.js` provides a system for showing non-intrusive messages to the user. These messages appear for a set duration and can be dismissed manually.

* **Key Features:**
    * 💬 Displays messages with an optional title.
    * ⏱️ Auto-dismisses after a configurable duration.
    * 🖱️ Can be closed manually by clicking a close button.
    * 🎣 Event triggers: `onMessage`, `onClose`, `onShow`, `onMessageClick`, `onTitleClick`.
    * 🏢 Managed by `PopuMessageManager` which handles a queue of messages.
    * 🎨 Requires accompanying CSS for styling (e.g., `styles.css` referenced by `utils.AddStyle`).

* **Dependencies:**
    * `utils.js` (for `utils.AddStyle` and `utils.CurrentUrlToFile`).
    * A `PID` class/object for generating unique IDs (used as `PopuMessageManager.getId.id`). Assumed to be available, possibly from `base.js` (`JCGWeb.PID`).
    * CSS file (e.g., `styles.css`) for styling.

* **How to Use:**

    ```html
    <script src="https://jeffersoncgo.github.io/cdn/utils.js"></script> <script>
        // Simplified PID for example if not using base.js
        // var PID = function() { this.id_counter = 0; Object.defineProperty(this, 'id', { get: () => this.id_counter++ }); };
        // var PopuMessageManager = { getId: new PID() }; // Ensure PopuMessageManager.getId is set before popupmessage.js if not using base.js
    </script>
    <script src="https://jeffersoncgo.github.io/cdn/popupmessage.js"></script>
    <link rel="stylesheet" href="https://jeffersoncgo.github.io/cdn/styles.css"> <script>
        // Simple message
        PopuMessageManager.addMessage('This is a notification!', 'System Update', 5000);

        // Message with callbacks
        PopuMessageManager.addMessage(
            'Item saved successfully.',
            'Success!',
            3000,
            (event) => console.log('Message container clicked:', event), // onMessage
            (event) => console.log('Message closed:', event),          // onClose
            (event) => console.log('Message shown:', event),           // onShow
            (event) => console.log('Message body clicked:', event),    // onMessageClick
            (event) => console.log('Message title clicked:', event)    // onTitleClick
        );
    </script>
    ```

* **`PopuMessageManager.addMessage` Parameters:**
    `addMessage(message, title, durationMs, onMessage, onClose, onShow, onMessageClick, onTitleClick)`
    * All callbacks are optional.

* **Styling:**
    The script creates a `#messageHolder` div in `document.body` and appends individual message boxes (`.messageBox`) to it. These elements, along with `.closeButton`, `.messageTitle`, and `.messageBody`, need to be styled via CSS.

---

### 📊 `TableSorter.js`

> **Adds client-side sorting functionality to HTML tables.**

`TableSorter.js` enables users to sort HTML table rows by clicking on column headers. It supports different data types for sorting and provides visual feedback.

* **Key Features:**
    * 🖱️ Click table headers (`<th>`) to sort.
    * ↕️ Supports ascending and descending sort orders.
    * ⭐ Customizable sort functions for different data types (e.g., `Sorters.Default`, `Sorters.Date`, `Sorters.Number`).
    * 🎨 Adds CSS classes (`collumnsorted`, `sorted_ascending`, `sorted_descending`) and icons ( `SortIcons.Desc`, `SortIcons.Asc`) for visual indication.
    * ⚙️ Configurable on a per-table basis.
    * 🦶 Optional footer support (`hasFooter`).
    * ⚡ Observes table for changes to re-index if necessary.

* **Dependencies:**
    * `observer.js` (for monitoring table content changes).
    * `base.js` (mentioned in comments, likely for global utilities or if `JCGWeb` namespace is used, though not directly apparent in the core sorting logic).
    * CSS for styling sort icons and highlighted headers.

* **How to Use:**

    **HTML Structure:**
    ```html
    <table id="mySortableTable">
        <thead>
            <tr>
                <th sorttitle="Name">Full Name</th> <th sorttitle="Age" data-sorttype="Number">Age</th> <th sorttitle="JoinDate" data-sorttype="Date">Joined</th>
                <th _sortignore>Actions</th> </tr>
        </thead>
        <tbody>
            <tr>
                <td>John Doe</td>
                <td>30</td>
                <td>2023-01-15</td>
                <td>Edit</td>
            </tr>
            <tr>
                <td>Jane Smith</td>
                <td>25</td>
                <td>2022-11-20</td>
                <td>Edit</td>
            </tr>
            </tbody>
        <tfoot>
            <tr>
                <th colspan="4">Table Footer</th>
            </tr>
        </tfoot>
    </table>
    ```

    **JavaScript:**
    ```html
    <script src="https://jeffersoncgo.github.io/cdn/observer.js"></script> <script src="https://jeffersoncgo.github.io/cdn/TableSorter.js"></script>
    <script>
        // Define custom sort functions if needed, or use provided Sorters
        const customSortConfig = {
            'Name': Sorters.Default, // Sorts alphabetically
            'Age': Sorters.Number,   // Sorts numerically
            'JoinDate': Sorters.Date, // Sorts by date
            // 'Actions': () => 0 // Custom function to prevent sorting or define specific logic
        };

        // Initialize the sorter
        const sorter = new TableSorter('mySortableTable', customSortConfig, true); // true for hasFooter

        // To programmatically trigger a sort (e.g., after adding data):
        // sorter.Sort('Name'); // Sorts by the 'Name' column
    </script>
    ```

* **Constructor:**
    `new TableSorter(TableId, SortConfig, hasFooter = false)`
    * `TableId`: String ID of the HTML table or the table element itself.
    * `SortConfig`: An object mapping `sorttitle` (or header text) to sort functions.
        * Sort functions take `(x, y, IsDescending)` as arguments, where `x` and `y` are the cell (`<td>`) elements being compared. They should return -1, 0, or 1.
    * `hasFooter`: Boolean, indicates if the table has a `<tfoot>`.

* **`Sorters` Object:**
    Provides predefined sort functions:
    * `Sorters.Default(x, y, Descending)`: Default string/alphanumeric sort.
    * `Sorters.Date(x, y, Descending)`: Parses cell content as dates for sorting.
    * `Sorters.Number(x, y, Descending)`: Parses cell content as numbers for sorting.
    Cells can have a `_sortValue` attribute to provide a specific value for sorting, otherwise `innerText` is used.

* **Customization:**
    * Use `_sortignore` attribute on `<th>` to make a column unsortable.
    * Use `sorttitle` attribute on `<th>` if the desired key for `SortConfig` is different from the header's `innerText`.
    * Provide your own sort functions in the `SortConfig`.

---

### 🌳 `treelist.js`

> **Creates a collapsible, tree-like list (directory tree view) from a JSON object or array.**

`TreeListCreator` (available via `TreeListManager`) transforms a JavaScript object or array into an HTML structure using nested `<details>` and `<summary>` elements, allowing users to expand and collapse branches of the tree.

* **Key Features:**
    * 🌲 Generates an HTML tree view from JSON data.
    * 🧼 Sanitizes keys in the input data by replacing `/` and `\` with `.` to handle path-like structures.
    * 🧱 Automatically creates nested layers based on dot-separated keys.
    * ↕️ Supports opening and closing all nodes (`OpenAll()`, `CloseAll()`).
    * 🎨 Requires accompanying CSS for styling (e.g., `styles.css` referenced by `utils.AddStyle`).

* **Dependencies:**
    * `utils.js` (for `utils.AddStyle` and `utils.CurrentUrlToFile`).
    * CSS file (e.g., `styles.css`) for styling the tree.

* **How to Use:**

    ```html
    <script src="https://jeffersoncgo.github.io/cdn/utils.js"></script> <script src="https://jeffersoncgo.github.io/cdn/treelist.js"></script>
    <link rel="stylesheet" href="https://jeffersoncgo.github.io/cdn/styles.css"> <div id="treeContainer"></div>

    <button onclick="TreeListManager.OpenAll()">Open All</button>
    <button onclick="TreeListManager.CloseAll()">Close All</button>

    <script>
        const jsonData = {
            "folder1": {
                "file1.txt": "Content of file1",
                "subfolder1.1": {
                    "file1.1.1.doc": "Document content"
                }
            },
            "folder2/file2.js": "JavaScript code", // Path-like key
            "arrayData": [
                { "Key": "Item 1", "value": "Details for item 1" },
                "Simple Item 2"
            ]
        };

        // Get the TreeListManager instance (it's a global singleton)
        // TreeListManager is an instance of TreeListCreator

        TreeListManager.Sanitize = true; // Default, sanitizes keys
        TreeListManager.Opened = false; // Default, determines if new nodes are initially open

        async function displayTree() {
            const treeHtml = await TreeListManager.TreeHTML(jsonData);
            document.getElementById('treeContainer').innerHTML = treeHtml;

            // The TreeListManager.document property holds the root div of the generated tree
            // If you want to append it instead of using innerHTML:
            // TreeListManager.TreeHTML(jsonData).then(() => {
            //    document.getElementById('treeContainer').appendChild(TreeListManager.document);
            // });
        }

        displayTree();
    </script>
    ```

* **`TreeListManager` (instance of `TreeListCreator`):**
    * `Sanitize`: Boolean (default `true`). If true, keys like "a/b" or "a\\b" are treated as "a.b" for nesting.
    * `Opened`: Boolean (default `false`). If true, all `<details>` elements will be initially open.
    * `async TreeHTML(Json)`: Generates the HTML for the tree from the `Json` data and returns it as a string. It also populates `this.document` with the root `div` element of the tree.
    * `MakeTree(Json)`: Processes the input `Json` (sanitizes if `Sanitize` is true) and stores it in `this.Tree`.
    * `OpenAll()`: Opens all `<details>` elements in the generated tree.
    * `CloseAll()`: Closes all `<details>` elements.

* **Styling:**
    The generated HTML uses `<details>`, `<summary>`, and `<li>` elements. You'll need CSS to style them appropriately for a tree view.

---

### 🎨 `themeControl.js`

> **Provides a UI and logic for dynamically changing website themes, including color shifting, inversion, and saving/loading custom themes via `localStorage`.**

`themeControl.js` adds a floating control panel to the webpage, allowing users to manipulate the color schemes of CSS rules and inline styles in real-time.

* **Key Features:**
    * 🖌️ **Theme Control Panel:** Adds a button to toggle a control panel.
    * 🔄 **Color Shifting:** A slider allows shifting color components (e.g., hue) by an angle (0-256).
    * 🌓 **Color Inversion:** A button to invert all detected colors on the page.
    * 💾 **Save Themes:** Users can name and save the current color state as a theme to `localStorage`.
    * 📂 **Load Themes:** A dropdown lists saved themes, allowing users to switch between them.
    * 🗑️ **Delete Themes:** Remove saved themes.
    * 🎯 **Selector Targeting:** (Optional) Apply changes only to elements matching a specific CSS selector chosen from a dropdown, or to all elements ('Auto').
    * 🛠️ **Color Utilities:** Includes internal functions for color conversion (RGB to Hex, HSL to RGB, Hex to RGB) and manipulation.

* **Dependencies:**
    * `utils.js` (for `utils.AddStyle` and `utils.CurrentUrlToFile`).
    * `controller.js` (for debouncing the `shiftTheme` function via `themeSliderControl`).
    * `themeControl.css` (for styling the control panel and its elements).

* **How to Use:**
    1.  Include `utils.js`, `controller.js`, and `themeControl.js` in your HTML.
    2.  Ensure `themeControl.css` is available at the same path as `themeControl.js` or provide the correct path.
    3.  A "brush" icon button will appear on the page. Clicking it opens the theme control panel.

    ```html
    <script src="https://jeffersoncgo.github.io/cdn/utils.js"></script>       <script src="https://jeffersoncgo.github.io/cdn/controller.js"></script> <script src="https://jeffersoncgo.github.io/cdn/themeControl.js"></script>
    <script>
        // The script initializes itself automatically.
        // A theme control button (brush icon) will be added to the page.
        // Clicking this button shows/hides the theme control panel.

        // Interaction is done through the UI panel:
        // - Use the slider to shift colors.
        // - Click "Invert Colors" to invert.
        // - Save current colors as a new theme.
        // - Select a saved theme from the dropdown to apply it.
        // - Delete unwanted themes.
        // - Optionally, target specific CSS rules using the selector dropdown.
    </script>
    ```

* **Key Functions & Global Variables:**
    * `themeSliderControl`: An instance of `Controller` wrapping `shiftTheme`.
    * `themeCtrl_Themes`: Object storing loaded/saved themes.
    * `fixColorAngle(angle)`: Normalizes a color component angle.
    * `isColorValue(value)`: Checks if a string is a CSS color value.
    * `rgbToHex()`, `rgbaToHex()`, `componentToHex()`, `isValidHex()`: Color conversion utilities.
    * `invertColor(color)`, `invertHexColor(color)`: Inverts a given color.
    * `shiftColor(color, angle)`: Shifts a color by a given angle.
    * `invertTheme()`: Applies color inversion to all relevant CSS rules.
    * `shiftTheme(angle)`: Applies color shifting to relevant CSS rules.
    * `getCSSRulesWithColors()`: Scans stylesheets and inline styles for rules containing color properties.
    * `themeCtrl_saveTheme()`: Prompts for a theme name and saves current colors.
    * `themeCtrl_deleteTheme()`: Deletes the selected theme from `localStorage`.
    * `themeCtrl_loadTheme()`: Loads the last used theme from `localStorage` on page load.
    * `themeCtrl_setTheme(themeName)`: Applies a saved theme.
    * `createThemeControlButton()`: Creates the initial brush icon button.
    * `showThemeControl()`: Builds and displays the theme control panel UI.

* **Styling:**
    The script dynamically creates UI elements with IDs like `#theme-control-button`, `#theme-spacer`, `#theme-control`, `#theme-css-selector`, `#theme-slider`, `#theme-list`, etc. These require styling from `themeControl.css`.

* **Important Notes:**
    * The script attempts to modify CSS rules directly. This might have limitations with cross-origin stylesheets or very complex CSS setups.
    * Performance for `getCSSRulesWithColors()` and applying changes can vary depending on the number of stylesheets and elements on the page.
    * The `makeQueryPathUntilBody` function for inline styles generates selectors that might not always be perfectly unique or efficient but aims to provide a reasonable target.

---

## 💾 Data & State Management

Scripts for handling data structures and persisting application state.

### 📦 `object.js`

> **A collection of utility functions for working with JavaScript objects.**

This script provides standalone functions for common object manipulation tasks such as accessing nested properties, creating objects from paths, cleaning objects, and merging them.

* **Key Features & Functions:**
    * `GetValueFromPath(path, obj)`: Retrieves a value from a nested object property using a dot-separated path string.
        * Example: `GetValueFromPath('user.address.city', myObj)`
    * `MakeObjFromPath(path, value, obj, spliter = '.')`: Creates or updates a nested property in an object based on a path string.
        * Example: `MakeObjFromPath('config.settings.theme', 'dark', myAppConfig)`
    * `cleanObject(obj)`: Recursively removes properties from an object that are `null`, `undefined`, empty strings, empty arrays, or empty plain objects.
    * `mergeObjects(obj1, obj2)`: Recursively merges properties from `obj2` into `obj1`. If `obj1` doesn't have a property, it's added. If both have an object at the same key, they are merged. Otherwise, `obj2`'s value overwrites `obj1`'s.

* **Dependencies:** None.

* **How to Use:**
    Include the script and call the functions directly.

    ```html
    <script src="https://jeffersoncgo.github.io/cdn/object.js"></script>
    <script>
        let user = {
            name: "John Doe",
            details: {
                age: 30,
                address: null // Will be removed by cleanObject
            },
            preferences: {} // Will be removed by cleanObject
        };

        // Get a nested value
        console.log(GetValueFromPath('details.age', user)); // 30

        // Create/update a nested property
        MakeObjFromPath('details.contact.email', 'john.doe@example.com', user);
        console.log(user.details.contact.email); // john.doe@example.com

        // Clean the object
        let cleanedUser = cleanObject(JSON.parse(JSON.stringify(user))); // Deep clone before cleaning to see effect
        console.log(cleanedUser);
        // Output: { name: "John Doe", details: { age: 30, contact: { email: "john.doe@example.com" } } }


        // Merge objects
        let defaults = { settingA: true, settingB: "default", nested: { item1: 1 } };
        let overrides = { settingB: "custom", settingC: 123, nested: { item2: 2 } };
        let merged = mergeObjects(defaults, overrides);
        console.log(merged);
        // Output: { settingA: true, settingB: "custom", settingC: 123, nested: { item1: 1, item2: 2 } }
    </script>
    ```

---

### 🧠 `pagememory.js`

> **Persists and restores the state of specified DOM elements across page loads using `localStorage`.**

`pageMemory` helps in remembering user inputs, element attributes, or other dynamic states on a page. Elements marked with a `save` attribute will have their relevant properties stored and reapplied when the user revisits the page.

* **Key Features:**
    * 💾 Saves state of elements with the `save` attribute to `localStorage`.
    * 🔄 Restores element state (attributes, values like `checked`, `value`, `selectedIndex`, `open`) on page load if saved data exists for the current URL.
    * 🎯 Identifies elements using unique CSS selectors.
    * 🔍 Ignores certain common attributes (e.g., `id`, `class`, `style`, `data-*`, `aria-*`) during save/restore to prevent conflicts, but saves others.
    * ⚡ Uses `Observer` to monitor changes in "saveable" elements and trigger saves.
    * ⏳ Uses `Controller` to debounce save operations for efficiency.
    * ⚙️ Supports custom triggers (`customTrigger` attribute on elements) that call a global function after an element is restored. The restored element is passed as parameter.
    * ⏱️ (Deprecated) Auto-save functionality at a configurable interval (though `startAutoSave` is commented out in `init`). It now uses Observer to observer changes for efficiency.

* **Dependencies:**
    * `observer.js`
    * `controller.js`
    * `base.js` (specifically `JCGWeb.Functions.getUniqueSelector`).

* **How to Use:**

    **HTML:**
    Mark elements you want to save with the `save` attribute.
    ```html
    <input type="text" id="username" save>
    <input type="checkbox" id="rememberMe" save>
    <select id="themeSelector" save>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
    </select>
    <details id="advancedSettings" save>
        <summary>Advanced Settings</summary>
        <p>Some advanced content here.</p>
    </details>

    <input type="text" id="specialInput" save customTrigger="handleSpecialInputRestored">
    ```

    **JavaScript:**
    ```html
    <script src="https://jeffersoncgo.github.io/cdn/base.js"></script>       <script src="https://jeffersoncgo.github.io/cdn/observer.js"></script>   <script src="https://jeffersoncgo.github.io/cdn/controller.js"></script> <script src="https://jeffersoncgo.github.io/cdn/pagememory.js"></script>
    <script>
        // Define any custom trigger functions globally if used
        window.handleSpecialInputRestored = function(element) {
            console.log(element.id + ' was restored, applying custom logic.');
            // e.g., element.style.borderColor = 'green';
        }

        // Initialize pageMemory
        const memory = new pageMemory();

        // The script automatically initializes, restores saved info, and starts observing.

        // To manually save (though it's mostly automatic on interaction):
        // memory.savePageInfo();

        // To clear all saved data for this page and stop observation:
        // memory.destroy();

        // To clear only the localStorage data:
        // memory.clearSavedMemory();
    </script>
    ```

* **Constructor:**
    `new pageMemory()`
    * No arguments needed for default behavior.

* **How it Works:**
    1.  On instantiation, `pageMemory` attempts to restore data from `localStorage` if the URL matches.
    2.  It identifies elements with the `save` attribute.
    3.  For each such element, it determines the relevant event for triggering saves (e.g., `input` for text fields, `change` for checkboxes/selects, `toggle` for `<details>`).
    4.  An `Observer` is attached to each "saveable" element to detect changes (mutations or specified events).
    5.  When a change occurs, `savePageInfo()` is called (debounced by `Controller`) to update `localStorage`.
    6.  `getElementInfo` captures attributes (excluding those in `attributesToIgnore`) and relevant properties (like `value`, `checked`, `open`, `selectedIndex`).

* **Key Methods (mostly for internal use or advanced control):**
    * `savePageInfo()`: Saves current state.
    * `restorePageInfo()`: Restores state from localStorage.
    * `getElementsToSave()`: Returns an array of info about elements marked with `save`.
    * `setOriginalPageInfo()` / `getOriginalPageInfo()`
    * `setPreviousPageInfo()` / `getPreviousPageInfo()`
    * `clearPreviousPageInfo()` / `clearOriginalPageInfo()` / `clearSavedMemory()`
    * `cleanMemory()`: Stops auto-save and clears all internal and localStorage data.
    * `reset()`: Resets observers and cleans memory.
    * `destroy()`: Full cleanup, removes event listeners, intervals, and attempts to delete instance properties.
    * `startAutoSave()` / `stopAutoSave()` / `setAutoSaveDelay(delay)`: Manage auto-save behavior (if enabled).

---

## 📄 License

This collection of scripts is released under the **MIT License**. Feel free to use, adapt, and distribute them as per the license terms.

```
MIT License

Copyright (c) 2025 Jeffersoncgo

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
```

---

## 🚧 Work in Progress

This CDN and its scripts are actively being developed. More utilities, features, and improvements (including CSS styles) may be added over time. Your feedback and contributions are welcome!

---
