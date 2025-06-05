# 🚀 README AI - cdn

This repository serves as a collection of reusable client-side JavaScript utilities, components, and demonstration assets designed to enhance web application functionality and user experience. It provides a structured set of tools for common web development tasks, including DOM manipulation, event handling, state management, data visualization (tree lists), dynamic styling (theme control), interactive table sorting, and asynchronous operation management. The project includes static JSON files for mock data and a demonstration `index.html` with associated `script.js` and CSS files (`style.css`, component-specific CSS) to showcase the integration and usage of these components in a practical web context. This collection is intended to be included directly in web projects, acting as a Content Delivery Network (CDN)-like source for shared functionality.

## Table of Contents

*   [Installation / Setup](#installation--setup)
*   [Project Structure](#project-structure)
*   [Detailed Usage / API Documentation](#detailed-usage--api-documentation)
    *   [✨ Core Utilities & Helpers](#-core-utilities--helpers)
    *   [💡 Core Patterns: Observer & Controller](#-core-patterns-observer--controller)
    *   [📊 Component: TableSorter](#-component-tablesorter)
    *   [🧠 Component: pageMemory](#-component-pagememory)
    *   [💬 Component: popupmessage](#-component-popupmessage)
    *   [🌳 Component: TreeListCreator & TreeListManager](#-component-treelistcreator--treelistmanager)
    *   [🎨 Component: themeControl](#-component-themecontrol)
    *   [🧪 Demonstration Script (`script.js`)](#-demonstration-script-scriptjs)
    *   [📦 Dummy Data (`dummy/`)](#-dummy-data-dummy)
*   [Troubleshooting](#troubleshooting)
*   [Contributing](#contributing)
*   [License](#license)
*   [🚧 Work in Progress](#-work-in-progress)

## Installation / Setup

To use the components and utilities from this repository in your web project, you typically do not need a build step. You can include the relevant JavaScript and CSS files directly in your HTML documents.

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/jeffersoncgo/cdn.git
    ```
2.  **Navigate to the Directory:**
    ```bash
    cd cdn
    ```
3.  **Include Files in your HTML:**
    Link the necessary JavaScript files from the `js/` directory and CSS files from `js/` or the root directory in your HTML `<head>` or before the closing `</body>` tag. Ensure dependencies are loaded in the correct order (e.g., core utilities before components that rely on them).

    Example `index.html` inclusion (referencing the local path):

    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My Web Project</title>
        <link rel="stylesheet" href="style.css">
        <link rel="stylesheet" href="js/popupmessage.css">
        <link rel="stylesheet" href="js/treelist.css">
        <link rel="stylesheet" href="js/themeControl.css">
        <!-- Include core utilities first -->
        <script src="js/base.js"></script>
        <script src="js/common.js"></script>
        <script src="js/object.js"></script>
        <script src="js/pid.js"></script>
        <!-- Include core patterns -->
        <script src="js/observer.js"></script>
        <script src="js/controller.js"></script>
        <!-- Include components -->
        <script src="js/TableSorter.js"></script>
        <script src="js/pagememory.js"></script>
        <script src="js/popupmessage.js"></script>
        <script src="js/treelist.js"></script>
        <script src="js/themeControl.js"></script>
        <!-- Your main script -->
        <script src="script.js"></script>
    </head>
    <body>
        <!-- Your page content -->
    </body>
    </html>
    ```
4.  **Serve the Files:** You can serve these files locally using a simple web server (e.g., Python's `http.server`, Node.js `serve`) or deploy them to a web server.

## Project Structure

The repository is organized to separate core utilities, components, demonstration assets, and dummy data.

```
.
├── .github
├── dummy/
│   ├── products.json
│   └── users.json
├── js/
│   ├── base.js
│   ├── common.js
│   ├── controller.js
│   ├── object.js
│   ├── observer.js
│   ├── pagememory.js
│   ├── pid.js
│   ├── popupmessage.css
│   ├── popupmessage.js
│   ├── TableSorter.js
│   ├── themeControl.css
│   ├── themeControl.js
│   ├── treelist.css
│   └── treelist.js
├── index.html
├── README.md
├── script.js
└── style.css
```

*   `/dummy`: Contains static JSON files (`products.json`, `users.json`) that serve as mock data sources for testing or demonstration purposes. These files provide structured data examples that can be fetched and used by the JavaScript components, such as populating tables or generating tree views.
*   `/js`: This is the core directory containing the majority of the reusable JavaScript utilities and components. It includes foundational files (`base.js`, `common.js`, etc.) and specific component implementations (`TableSorter.js`, `popupmessage.js`, etc.), along with their associated CSS files (`.css` files within `js/`).
*   `index.html`: The main entry point for the demonstration environment. It includes all the necessary CSS and JavaScript files and provides the HTML structure used by `script.js` to showcase component functionality.
*   `script.js`: A comprehensive demonstration script that illustrates how to initialize and use various components from the `js/` directory, often fetching data from the `dummy/` directory. It's useful for understanding component integration.
*   `style.css`: Provides general styling for the demonstration `index.html`.

## Detailed Usage / API Documentation

This section provides details on how to use the main components and utilities found in the `js/` directory, synthesized from their analysis.

### ✨ Core Utilities & Helpers

The `js/` directory contains several foundational utility files, primarily organized under a global `JCGWeb` namespace and a static `utils` class. These provide fundamental capabilities used by other components.

**Purpose:** Provide basic, reusable functions for common web development tasks like DOM manipulation, object handling, and information retrieval.

**Key Features:**
*   DOM element identification and manipulation.
*   Accessing URL parameters and information.
*   Deep object access, merging, and cleaning.
*   Sequential ID generation.
*   Basic event handling helpers (integrated via `utils`).

**Dependencies:** These files are generally self-contained or depend only on standard browser APIs.

**How to Use / API Highlights:**

The core utilities are typically accessed via `JCGWeb` or `JCGWeb.utils`.

**Example 1: Accessing a DOM Element**

*   **Description:** Demonstrates getting an element by its ID.
*   **Code Snippet:**
    ```javascript
    // Assuming you have an element like <div id="myElement"> in your HTML
    const myElement = JCGWeb.Functions.getElementById('myElement');

    if (myElement) {
        console.log('Found element:', myElement);
    } else {
        console.log('Element not found.');
    }
    ```
*   **Output:** Logs the DOM element object if found.
*   **Explanation:** Uses the utility function to safely retrieve a DOM element by its ID, which is a common prerequisite for component initialization or manipulation.

**Example 2: Getting a URL Parameter**

*   **Description:** Shows how to retrieve a specific parameter from the current page's URL.
*   **Code Snippet:**
    ```javascript
    // Assuming the URL is like http://example.com/?user=test&id=123
    const userId = JCGWeb.Functions.getURLParameter('user');
    const itemId = JCGWeb.Functions.getURLParameter('id');
    const nonExistentParam = JCGWeb.Functions.getURLParameter('status');

    console.log('User ID:', userId); // Output: test
    console.log('Item ID:', itemId); // Output: 123
    console.log('Status:', nonExistentParam); // Output: null
    ```
*   **Output:** Logs the values of the requested URL parameters or `null` if not found.
*   **Explanation:** Useful for reading state or configuration passed via the URL query string.

**Example 3: Generating a Sequential ID**

*   **Description:** Demonstrates how to get a unique sequential identifier.
*   **Code Snippet:**
    ```javascript
    const id1 = JCGWeb.Functions.getSequentialId();
    const id2 = JCGWeb.Functions.getSequentialId();

    console.log('First ID:', id1); // Output: A unique ID string (e.g., "seq_1")
    console.log('Second ID:', id2); // Output: The next unique ID string (e.g., "seq_2")
    ```
*   **Output:** Logs unique, sequentially generated string IDs.
*   **Explanation:** Useful for creating unique identifiers for dynamically generated DOM elements or internal objects when a simple counter is sufficient.

### 💡 Core Patterns: Observer & Controller

This repository includes implementations of key design patterns: an Observer for monitoring DOM changes and events, and a Controller for managing asynchronous function execution.

#### Component: Observer

**File:** `js/observer.js`

**Purpose:** Provides a unified way to listen for DOM mutations (changes to the structure or attributes of elements) and standard DOM events on specified target elements.

**Key Features:**
*   Observes DOM mutations (attribute changes, child list changes, subtree changes).
*   Listens for standard DOM events.
*   Allows specifying target elements and filtering mutations/events.
*   Provides a consistent callback mechanism.

**Dependencies:** Relies on the native `MutationObserver` API and standard browser event listeners.

**How to Use / API Highlights:**

**Example 1: Observing DOM Mutations**

*   **Description:** Sets up an observer to watch for attribute changes on a specific element.
*   **Input:** Target element, configuration object, callback function.
*   **Code Snippet:**
    ```javascript
    // Assuming you have an element <div id="watchedElement">
    const targetElement = JCGWeb.Functions.getElementById('watchedElement');

    if (targetElement) {
        const observer = new JCGWeb.Observer(targetElement, {
            attributes: true // Watch for attribute changes
            // childList: true, subtree: true, etc. for other mutation types
        }, (mutationsList, observerInstance) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes') {
                    console.log('Attribute changed:', mutation.attributeName, 'on', mutation.target);
                    // Example: React to the change
                    // observerInstance.disconnect(); // Stop observing if needed
                }
            }
        });

        console.log('Observer started for mutations on #watchedElement.');

        // --- Simulate a change after a delay ---
        setTimeout(() => {
            targetElement.setAttribute('data-status', 'updated');
            targetElement.classList.add('active'); // Also triggers attribute change
        }, 1000);

    } else {
        console.log('Target element #watchedElement not found.');
    }
    ```
*   **Output:** When the element's attributes change, the callback logs details about the mutation.
    ```
    Observer started for mutations on #watchedElement.
    Attribute changed: data-status on [object HTMLDivElement]
    Attribute changed: class on [object HTMLDivElement]
    ```
*   **Explanation:** This is useful for reacting to changes in the DOM structure or element properties that occur dynamically, potentially outside the direct control of your current script.

**Example 2: Listening for DOM Events**

*   **Description:** Sets up the observer to listen for standard events like 'click' or 'input' on a target or its children.
*   **Input:** Target element, event configuration object, callback function.
*   **Code Snippet:**
    ```javascript
    // Assuming you have a button <button id="myButton">Click Me</button>
    const targetElement = JCGWeb.Functions.getElementById('myButton');

    if (targetElement) {
         const observer = new JCGWeb.Observer(targetElement, {
            events: {
                click: true // Listen for click events
                // input: true, focus: true, etc. for other event types
            }
        }, (event, observerInstance) => {
            console.log('Event triggered:', event.type, 'on', event.target);
            // observerInstance.stopEventListening('click'); // Stop listening for a specific event
        });

        console.log('Observer started for click events on #myButton.');

    } else {
        console.log('Target element #myButton not found.');
    }
    ```
*   **Output:** When the button is clicked, the callback logs details about the event.
    ```
    Observer started for click events on #myButton.
    Event triggered: click on [object HTMLButtonElement]
    ```
*   **Explanation:** Provides an alternative or combined approach to standard `addEventListener`, allowing event listening to be managed alongside DOM mutation observation within the same `Observer` instance.

#### Component: Controller

**File:** `js/controller.js`

**Purpose:** Manages the execution of asynchronous functions with features like debouncing, delaying, and aborting. Useful for controlling the flow of operations that might be triggered frequently or need careful timing.

**Key Features:**
*   Debounce function execution (wait for a pause before executing).
*   Delay function execution.
*   Abort pending function executions.
*   Handles asynchronous functions (Promises).

**Dependencies:** None external to the core utilities.

**How to Use / API Highlights:**

**Example 1: Debouncing a Function Call**

*   **Description:** Creates a debounced version of a function that only executes after a specified period of inactivity.
*   **Input:** The function to debounce, the delay time in milliseconds.
*   **Code Snippet:**
    ```javascript
    const searchInput = JCGWeb.Functions.getElementById('searchInput'); // Assuming <input id="searchInput">

    if (searchInput) {
        // Create a debounced version of a search function (replace with your actual search logic)
        const handleSearchInput = async (value) => {
            console.log(`Performing search for: "${value}"`);
            // Simulate an async operation
            await new Promise(resolve => setTimeout(resolve, 200));
            console.log(`Search complete for: "${value}"`);
        };

        const debouncedSearch = JCGWeb.Controller.debounce(handleSearchInput, 500); // 500ms delay

        // Attach the debounced function to an input event
        searchInput.addEventListener('input', (event) => {
            console.log('Input detected, debounce triggered...');
            debouncedSearch(event.target.value);
        });

        console.log('Debounce example setup. Type quickly in the input field.');

    } else {
        console.log('Input element #searchInput not found. Cannot run debounce example.');
    }
    ```
*   **Output:** If you type "abc" quickly, the output will show "Input detected..." for each keypress, but "Performing search..." and "Search complete..." will only appear once, 500ms after you stop typing.
*   **Explanation:** Ideal for handling events like typing in a search box, resizing a window, or scrolling, where you only want to trigger the associated action once the user has finished the activity.

**Example 2: Delaying a Function Call**

*   **Description:** Delays the execution of a function by a specified time.
*   **Input:** The function to delay, the delay time in milliseconds.
*   **Code Snippet:**
    ```javascript
    console.log('Scheduling delayed message...');

    JCGWeb.Controller.delay(() => {
        console.log('This message appears after a 2-second delay.');
    }, 2000); // 2000ms = 2 seconds

    console.log('Message scheduled.');
    ```
*   **Output:**
    ```
    Scheduling delayed message...
    Message scheduled.
    This message appears after a 2-second delay. (after 2 seconds)
    ```
*   **Explanation:** Simple way to schedule a function to run after a pause, useful for animations, timeouts, or deferred tasks.

**Example 3: Aborting a Pending Call**

*   **Description:** Shows how to cancel a debounced or delayed function call before it executes.
*   **Code Snippet:**
    ```javascript
    const actionFunction = () => {
        console.log('This action was NOT aborted and is now running.');
    };

    // Schedule an action with a delay
    const scheduledAction = JCGWeb.Controller.delay(actionFunction, 3000); // Schedule for 3 seconds

    console.log('Action scheduled for 3 seconds.');

    // Abort the scheduled action after 1 second
    setTimeout(() => {
        console.log('Attempting to abort the scheduled action...');
        scheduledAction.abort();
        console.log('Abort requested.');
    }, 1000); // Abort after 1 second

    // --- Another example with debounce ---
    const frequentFunction = () => console.log('This debounced function ran.');
    const debouncedFunction = JCGWeb.Controller.debounce(frequentFunction, 500);

    debouncedFunction(); // Trigger 1
    debouncedFunction(); // Trigger 2 (resets timer)
    debouncedFunction(); // Trigger 3 (resets timer)

    // Abort the debounced function before it fires
    setTimeout(() => {
        console.log('Attempting to abort the debounced action...');
        debouncedFunction.abort();
        console.log('Abort requested for debounced function.');
    }, 600); // Abort after debounce window

    // If the abort is successful, "This action was NOT aborted..." will not appear.
    // If the abort is successful, "This debounced function ran." will not appear.
    ```
*   **Output:**
    ```
    Action scheduled for 3 seconds.
    Attempting to abort the scheduled action...
    Abort requested.
    Attempting to abort the debounced action...
    Abort requested for debounced function.
    ```
    The messages "This action was NOT aborted..." and "This debounced function ran." will *not* appear because they were aborted.
*   **Explanation:** Crucial for preventing outdated or unnecessary operations, especially with debouncing (e.g., cancelling a previous search request when the user types again) or clearing timeouts.

### 📊 Component: TableSorter

**File:** `js/TableSorter.js`

**Purpose:** Adds interactive sorting capabilities to standard HTML tables. Users can click table headers (`<th>`) to sort the table rows based on the content of that column.

**Key Features:**
*   Sorts table rows based on clicked header.
*   Supports ascending and descending order.
*   Relies on the `Observer` to react to table changes if needed (though primary use is on load).

**Dependencies:** Depends on the `Observer` component and core utilities like `JCGWeb.Functions`.

**How to Use / API Highlights:**

**Example 1: Initializing TableSorter**

*   **Description:** Applies sorting functionality to an existing HTML table.
*   **Input:** The ID or the DOM element of the `<table>`.
*   **Code Snippet:**
    ```html
    <!-- Example HTML Table (in your index.html or dynamically created) -->
    <table id="mySortableTable">
        <thead>
            <tr>
                <th>Name</th>
                <th>Age</th>
                <th>City</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>Alice</td><td>30</td><td>New York</td></tr>
            <tr><td>Bob</td><td>25</td><td>London</td></tr>
            <tr><td>Charlie</td><td>35</td><td>Paris</td></tr>
            <tr><td>Alice</td><td>28</td><td>London</td></tr>
        </tbody>
    </table>

    <script>
        // Assuming the table HTML exists in the DOM
        document.addEventListener('DOMContentLoaded', () => {
            const sortableTable = new JCGWeb.TableSorter('mySortableTable');
            console.log('TableSorter initialized for #mySortableTable.');
            // Now click on the table headers in the browser to test sorting.
        });
    </script>
    ```
*   **Output:** The table headers will become clickable. Clicking a header will reorder the table rows based on the content of that column (alphabetically or numerically if the content is clearly numbers).
*   **Explanation:** This is the primary way to enable sorting. Simply create a new `TableSorter` instance, passing the target table element or its ID. The component automatically finds headers and attaches click handlers.

### 🧠 Component: pageMemory

**File:** `js/pagememory.js`

**Purpose:** Automatically saves and restores the state of specified HTML form elements (like input fields, checkboxes, selects) using the browser's `localStorage`. This allows users to return to a page and find their input fields retaining the values they last entered.

**Key Features:**
*   Saves state of input, textarea, select, checkbox, radio elements.
*   Uses `localStorage` for persistence across sessions.
*   Can target specific elements or save/restore globally.
*   Leverages `Observer` for detecting changes and `Controller` for debouncing saving.

**Dependencies:** Depends on `JCGWeb.Observer`, `JCGWeb.Controller`, and `JCGWeb.Functions`, as well as the browser's `localStorage` API.

**How to Use / API Highlights:**

**Example 1: Initializing and Using pageMemory**

*   **Description:** Sets up page memory to save and restore the state of form elements within a specific container.
*   **Input:** The ID or DOM element of the container to watch (e.g., a `<form>` or `<div>`).
*   **Code Snippet:**
    ```html
    <!-- Example HTML Form (in your index.html or dynamically created) -->
    <div id="settingsForm">
        <input type="text" id="username" placeholder="Username">
        <input type="number" id="age" placeholder="Age">
        <select id="country">
            <option value="us">USA</option>
            <option value="ca">Canada</option>
            <option value="uk">UK</option>
        </select>
        <label><input type="checkbox" id="rememberMe"> Remember Me</label>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const formContainer = JCGWeb.Functions.getElementById('settingsForm');

            if (formContainer) {
                // Initialize pageMemory for the container
                const memory = new JCGWeb.pageMemory(formContainer);

                console.log('pageMemory initialized for #settingsForm.');
                console.log('Try typing/selecting values, then refresh the page.');

                // The component automatically loads saved state on initialization
                // and saves state whenever the elements change (debounced).
            } else {
                 console.log('Container element #settingsForm not found. Cannot initialize pageMemory.');
            }
        });
    </script>
    ```
*   **Output:** When the page loads, the input fields, select box, and checkbox within `#settingsForm` will be populated with the values they had the last time the user visited this page (in the same browser). As the user types or changes values, these changes are automatically saved to `localStorage` after a short delay.
*   **Explanation:** This provides a seamless way to enhance user experience by preserving form state, preventing data loss on accidental navigation or page refresh. The component handles the saving (via debounced observation) and loading automatically.

### 💬 Component: popupmessage

**File:** `js/popupmessage.js`, `js/popupmessage.css`

**Purpose:** Provides a simple, non-intrusive system for displaying temporary notification messages (like success, error, or info messages) as popups on the screen.

**Key Features:**
*   Displays messages with different types (info, success, warning, error).
*   Messages can automatically disappear after a delay or be manually dismissed.
*   Styled via `popupmessage.css`.

**Dependencies:** Requires `popupmessage.css` for styling. Relies on basic DOM manipulation utilities.

**How to Use / API Highlights:**

The `popupmessage` component is typically accessed via the `JCGWeb.popupMessage` object.

**Example 1: Showing an Info Message**

*   **Description:** Displays a basic informational message that disappears automatically.
*   **Input:** Message string, optional duration in milliseconds (defaults to a standard time).
*   **Code Snippet:**
    ```javascript
    document.addEventListener('DOMContentLoaded', () => {
         // Ensure the popup message container exists (usually added by the script itself)
         // or ensure popupmessage.js is loaded.

         console.log('Showing an info popup message...');
         JCGWeb.popupMessage.show('Welcome back!', 'info');
    });
    ```
*   **Output:** A small popup box appears (usually in a corner of the screen, styled by `popupmessage.css`) with the text "Welcome back!" and an info icon/styling. It will disappear after a few seconds.
*   **Explanation:** Simple way to give non-critical feedback to the user.

**Example 2: Showing a Success Message with Custom Duration**

*   **Description:** Displays a success message that stays visible for a specific duration.
*   **Input:** Message string, message type ('success'), custom duration in milliseconds.
*   **Code Snippet:**
    ```javascript
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Showing a success popup message for 5 seconds...');
        JCGWeb.popupMessage.show('Settings saved successfully!', 'success', 5000); // 5000ms = 5 seconds
    });
    ```
*   **Output:** A popup box with success styling appears with the text "Settings saved successfully!" and stays visible for 5 seconds before fading out.
*   **Explanation:** Useful for confirming successful user actions, allowing the user ample time to read the confirmation.

**Example 3: Showing an Error Message (Manual Dismissal)**

*   **Description:** Displays an error message that requires the user to dismiss it manually.
*   **Input:** Message string, message type ('error'), duration `0` or `false` for manual dismissal.
*   **Code Snippet:**
    ```javascript
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Showing an error popup message (manual dismiss)...');
        // Duration 0 or false means it stays until clicked/dismissed
        JCGWeb.popupMessage.show('Error: Failed to load data.', 'error', 0);
    });
    ```
*   **Output:** A popup box with error styling appears with the text "Error: Failed to load data." It will remain on screen until the user clicks it or a close button (if provided by CSS/HTML structure).
*   **Explanation:** Appropriate for critical messages that the user *must* acknowledge before continuing.

### 🌳 Component: TreeListCreator & TreeListManager

**File:** `js/treelist.js`, `js/treelist.css`

**Purpose:** Enables the dynamic generation and management of collapsible HTML tree structures from hierarchical JavaScript data (objects or arrays). Useful for visualizing nested data like file systems, categories, or complex configurations.

**Key Features:**
*   Generates nested `<ul>` and `<li>` HTML structures.
*   Supports collapsible nodes.
*   Can render data from nested objects or arrays.
*   Provides a singleton `TreeListManager` for easy access and multiple tree management.
*   Styled via `treelist.css`.

**Dependencies:** Requires `treelist.css` for styling. Depends on core utilities for DOM manipulation.

**How to Use / API Highlights:**

The primary interaction is via the `JCGWeb.TreeListManager` singleton.

**Example 1: Creating and Rendering a Tree**

*   **Description:** Generates an HTML tree structure from sample data and renders it into a specified container element.
*   **Input:** Target container element ID or object, the hierarchical data object/array, optional configuration.
*   **Code Snippet:**
    ```html
    <!-- Example HTML Container (in your index.html) -->
    <div id="treeContainer">
        <!-- The tree will be rendered here -->
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const treeData = {
                name: "Root",
                children: [
                    { name: "Folder 1", children: [ { name: "File A" }, { name: "File B" } ] },
                    { name: "Folder 2", children: [ { name: "Subfolder", children: [ { name: "File C" } ] } ] },
                    { name: "File D" }
                ]
            };

            const containerId = 'treeContainer';

            // Create and render the tree using the manager
            JCGWeb.TreeListManager.createTreeList(containerId, treeData, {
                // Optional configuration, e.g., specify keys for name/children if data structure is different
                // nameKey: 'label',
                // childrenKey: 'items'
            });

            console.log('Tree list created in #treeContainer.');
            // Interact with the tree in the browser (collapse/expand nodes).
        });
    </script>
*   **Output:** An interactive, collapsible tree structure appears within the `#treeContainer` div, representing the provided `treeData`.
*   **Explanation:** The `TreeListManager.createTreeList` method is the standard way to generate a tree. It takes the target container and the data and builds the HTML structure. The `treelist.css` provides the default styling and handles the collapse/expand behavior via CSS classes.

### 🎨 Component: themeControl

**File:** `js/themeControl.js`, `js/themeControl.css`

**Purpose:** Allows users to dynamically control the visual theme of the webpage, primarily through color manipulation like shifting hues and inverting colors. It includes functionality to save and load custom themes using `localStorage`.

**Key Features:**
*   Applies theme changes by modifying CSS variables or classes.
*   Supports color inversion and hue shifting.
*   Saves and loads preferred themes via `localStorage`.
*   Provides UI elements (e.g., buttons) to trigger theme changes (demonstrated in `script.js`).
*   Styled via `themeControl.css`.

**Dependencies:** Requires `themeControl.css` for styling. Depends on `localStorage` API and core utilities.

**How to Use / API Highlights:**

The `themeControl` component is typically accessed via the `JCGWeb.themeControl` object.

**Example 1: Applying a Theme (Programmatically)**

*   **Description:** Applies a specific theme state (e.g., inverted colors) programmatically.
*   **Input:** Theme state object (e.g., `{ inverted: true }`).
*   **Code Snippet:**
    ```javascript
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize themeControl (loads saved theme if any)
        JCGWeb.themeControl.init();
        console.log('themeControl initialized.');

        // Apply inverted theme after a delay
        setTimeout(() => {
            console.log('Applying inverted theme...');
            JCGWeb.themeControl.applyTheme({ inverted: true });
        }, 2000);
    });
    ```
*   **Output:** After 2 seconds, the colors on the page will invert (assuming `themeControl.css` is linked and configured to handle this).
*   **Explanation:** The `applyTheme` method allows you to set the theme state directly. The `init` method should be called on page load to load any previously saved theme preferences from `localStorage`.

**Example 2: Toggling Color Inversion**

*   **Description:** Toggles the color inversion state of the page.
*   **Code Snippet:**
    ```javascript
    document.addEventListener('DOMContentLoaded', () => {
        JCGWeb.themeControl.init(); // Ensure initialized

        // Assuming you have a button <button id="toggleInvert">Toggle Colors</button>
        const toggleButton = JCGWeb.Functions.getElementById('toggleInvert');

        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                JCGWeb.themeControl.toggleInverted();
                console.log('Toggled color inversion.');
                // The component automatically saves the new state to localStorage
            });
             console.log('Toggle inversion button handler attached.');
        } else {
            console.log('Toggle button #toggleInvert not found.');
        }
    });
    ```
*   **Output:** Clicking the button will toggle the color inversion effect on the page. The state is automatically saved, so the page will remember the preference on the next visit.
*   **Explanation:** Provides a simple method to switch between inverted and non-inverted color schemes, suitable for connecting to UI elements. Similar methods likely exist for hue shifting.

### 🧪 Demonstration Script (`script.js`)

**File:** `script.js`

**Purpose:** This file serves as a primary example and integration point, demonstrating how to use several components from the `js/` directory together in a realistic scenario. It typically includes logic for fetching dummy data, initializing components like `TreeListManager` and `themeControl`, and setting up event listeners for interactive elements.

**Key Features:**
*   Fetches data (likely from `dummy/` files).
*   Initializes `TreeListManager` to display data.
*   Initializes `themeControl` and sets up UI to control themes.
*   Shows component interaction and integration.

**Dependencies:** Depends heavily on various components and utilities from the `js/` directory (e.g., `treelist.js`, `themeControl.js`, core utilities).

**How to Use:**

The `script.js` file is not typically used as a library itself but as a working example. To "use" it, include it in your `index.html` *after* including all the components it depends on. Study its code to understand how to integrate the different components in your own application.

**Example Snippet (Conceptual):**

*   **Description:** A conceptual look at how `script.js` might fetch data and use `TreeListManager`.
*   **Code Snippet:**
    ```javascript
    // Inside script.js (conceptual)

    document.addEventListener('DOMContentLoaded', async () => {
        // Assume a function to fetch data exists (could be in common.js or here)
        async function fetchDummyData(url) {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        }

        try {
            // Fetch product data from dummy/
            const productData = await fetchDummyData('dummy/products.json');

            // Assuming productData is structured appropriately or needs transformation
            // ... potentially transform productData into a tree structure format ...
            const treeData = { name: "Products", children: productData }; // Simplified assumption

            // Render the tree in a container
            const containerId = 'productTreeContainer'; // Assuming this ID exists in index.html
            if (JCGWeb.Functions.getElementById(containerId)) {
                 JCGWeb.TreeListManager.createTreeList(containerId, treeData);
                 console.log('Product tree rendered.');
            } else {
                 console.log('Container #productTreeContainer not found.');
            }

            // Initialize theme control
            JCGWeb.themeControl.init();
            console.log('Theme control initialized.');

            // Setup theme toggle button listeners (assuming buttons exist in index.html)
            const invertButton = JCGWeb.Functions.getElementById('toggleInvert');
            if (invertButton) {
                 invertButton.addEventListener('click', () => JCGWeb.themeControl.toggleInverted());
            }
            // ... similar for hue shifting ...

        } catch (error) {
            console.error('Failed to load data or initialize components:', error);
            JCGWeb.popupMessage.show('Failed to load demo data.', 'error', 0); // Use popup if available
        }
    });
    ```
*   **Explanation:** This snippet illustrates the typical flow: wait for the DOM, fetch necessary data (potentially asynchronous), prepare the data for components (like the tree list), initialize and use the components, and set up event handlers for user interaction.

### 📦 Dummy Data (`dummy/`)

**Files:** `dummy/products.json`, `dummy/users.json`

**Purpose:** These JSON files contain static, structured data examples for products and users. They are intended for use during development and demonstration, providing mock data that components like `TableSorter` or `TreeListCreator` can consume.

**Key Features:**
*   Provides sample product data (likely list of products with properties).
*   Provides sample user data (likely list of users with properties).
*   Standard JSON format, easily parseable by JavaScript.

**Dependencies:** None. These are static data files.

**How to Use:**

These files are typically fetched asynchronously using the browser's `fetch` API or `XMLHttpRequest` from your JavaScript code (like `script.js`) and then processed before being passed to components.

**Example 1: Fetching and Logging Dummy Data**

*   **Description:** Shows how to fetch the `products.json` file.
*   **Input:** The path to the JSON file.
*   **Code Snippet:**
    ```javascript
    async function loadProducts() {
        try {
            const response = await fetch('dummy/products.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Successfully loaded product data:', data);
            // Now you can use 'data' with components, e.g., TreeListManager or TableSorter
        } catch (error) {
            console.error('Could not load product data:', error);
        }
    }

    // Call the function to load data
    document.addEventListener('DOMContentLoaded', () => {
        loadProducts();
    });
    ```
*   **Output:** Logs the parsed JavaScript object/array from `products.json` to the console upon page load (assuming the file is accessible).
*   **Explanation:** This is the standard pattern for loading external static data files in a web browser. The fetched data can then be used to populate UI elements or initialize data-driven components.

## Troubleshooting

*   **Component Not Found:** Ensure the relevant `.js` file for the component is included in your HTML *before* the script that tries to use it. Check the browser's developer console for JavaScript errors like `[ComponentName] is not defined`.
*   **CSS Not Applied:** Ensure the component's `.css` file (e.g., `popupmessage.css`, `treelist.css`, `themeControl.css`) is linked in your HTML `<head>`. Check the browser's developer tools "Elements" tab to see if the expected CSS classes are applied and the "Sources" and "Network" tabs to ensure the CSS files are loading correctly.
*   **TableSorter Not Working:** Verify the HTML table has a `<thead>` and `<tbody>` structure. Ensure the `TableSorter` is initialized *after* the table element exists in the DOM.
*   **pageMemory Not Saving/Loading:** Check the browser's developer tools "Application" tab -> "Local Storage" to see if data is being saved under the page's origin. Ensure the container element passed to `pageMemory` exists and contains supported input types (input, textarea, select).
*   **Dummy Data Not Loading:** Ensure the path to the JSON file (e.g., `dummy/products.json`) is correct relative to your `index.html` or the server's root. Check the browser's developer tools "Network" tab for failed requests (404 Not Found) when trying to fetch the JSON. Ensure your web server is configured to serve `.json` files with the correct MIME type (`application/json`).

## Contributing

This repository is intended as a collection of reusable components. Contributions are welcome! If you find a bug or have an improvement, please consider opening an issue or submitting a pull request.

General steps for contributing:
1.  Fork the repository.
2.  Create a new branch for your feature or bugfix.
3.  Make your changes, adhering to the existing coding style.
4.  Test your changes thoroughly.
5.  Submit a pull request with a clear description of your changes.

## License

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

This repository and its documentation are under active development. Features and structure may change as components are refined or added.
