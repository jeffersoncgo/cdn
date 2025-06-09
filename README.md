# 🚀 README AI - cdn

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
*   **Asynchronous Control:** Tools for managing and potentially canceling asynchronous processes.
*   **Sequential ID Generation:** Simple mechanism for generating unique IDs client-side.
*   **Page State Persistence:** Ability to save and restore simple page element states using `localStorage`.
*   **Sortable Tables:** A JavaScript component (`TableSorter`) for making HTML tables sortable client-side.
*   **Popup Messages:** Dynamic, temporary message overlays (`popupmessage`) for user feedback.
*   **Dynamic Theme Control:** Functionality (`themeControl`) to manage and apply visual themes, including saving theme preferences.
*   **Interactive Tree Structures:** Component (`treelist`) to render and manage collapsible hierarchical data displays.
*   **Observer Pattern:** Implementation of an Observer (`observer`) for reacting to DOM changes or other events.
*   **Dummy Data:** Includes mock JSON data (`dummy/`) for testing and demonstration purposes.

## ⚙️ Installation / Setup

This project is primarily a collection of client-side assets. To use the components and utilities:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/jeffersoncgo/cdn.git
    ```
2.  **Include the files:**
    *   Navigate to the cloned directory.
    *   Include the necessary `.js` and `.css` files in your HTML documents using `<script>` and `<link>` tags. Ensure the core utility files (`base.js`, `common.js`, `object.js`, etc.) are included before components that depend on them.
    *   For example, to include the main script and styles in `index.html`:
        ```html
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Project</title>
            <link rel="stylesheet" href="https://jeffersoncgo.github.io/cdn/style.css">
            <link rel="stylesheet" href="https://jeffersoncgo.github.io/cdn/js/popupmessage.css">
            <link rel="stylesheet" href="https://jeffersoncgo.github.io/cdn/js/themeControl.css">
            <link rel="stylesheet" href="https://jeffersoncgo.github.io/cdn/js/treelist.css">
            <!-- Include core JS files first -->
            <script src="https://jeffersoncgo.github.io/cdn/js/base.js"></script>
            <script src="https://jeffersoncgo.github.io/cdn/js/common.js"></script>
            <script src="https://jeffersoncgo.github.io/cdn/js/object.js"></script>
            <script src="https://jeffersoncgo.github.io/cdn/js/observer.js"></script>
            <script src="https://jeffersoncgo.github.io/cdn/js/pid.js"></script>
            <script src="https://jeffersoncgo.github.io/cdn/js/controller.js"></script>
            <script src="https://jeffersoncgo.github.io/cdn/js/pagememory.js"></script>
            <!-- Include component JS files -->
            <script src="https://jeffersoncgo.github.io/cdn/js/TableSorter.js"></script>
            <script src="https://jeffersoncgo.github.io/cdn/js/popupmessage.js"></script>
            <script src="https://jeffersoncgo.github.io/cdn/js/themeControl.js"></script>
            <script src="https://jeffersoncgo.github.io/cdn/js/treelist.js"></script>
            <!-- Include your main application script -->
            <script src="https://jeffersoncgo.github.io/cdn/script.js"></script>
        </head>
        <body>
            <!-- Your content here -->
        </body>
        </html>
        ```

No server-side setup or build process is strictly required for basic usage, as this is a collection of standalone client-side assets.

## 📂 Project Structure

<details>
<summary>Click to Expand</summary>

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

</details>

*   `.github/`: Contains GitHub-specific configuration files, likely for workflows or issue templates.
*   `dummy/`: Stores static JSON files (`products.json`, `users.json`) providing mock data, useful for testing components or demonstrating data loading.
*   `js/`: This directory is the core of the library, containing all the modular JavaScript files and associated CSS for specific components. Each `.js` file typically represents a distinct utility or UI component (e.g., `TableSorter.js`, `popupmessage.js`, `themeControl.js`, `treelist.js`), while others (`base.js`, `common.js`, `object.js`, `controller.js`, `observer.js`, `pagememory.js`, `pid.js`) provide foundational utilities and patterns.
*   `index.html`: The main entry point, likely serving as a demonstration page that includes and utilizes the JavaScript and CSS assets from the `js/` directory and the data from `dummy/`.
*   `README.md`: This file, providing documentation for the repository.
*   `script.js`: A central script, likely responsible for orchestrating the usage of various components and utilities from the `js/` directory, potentially including loading data from `dummy/`.
*   `style.css`: The main stylesheet for the demonstration page (`index.html`), providing general styling.

## 📖 Detailed Usage / API Documentation

This repository provides a suite of client-side JavaScript components and utilities, often organized under a potential `JCGWeb` namespace. Below is a breakdown of key modules and how to use them, synthesized from the file analyses.

### ✨ Core Utilities (e.g., `base.js`, `common.js`, `object.js`, `controller.js`, `observer.js`, `pid.js`, `pagememory.js`)

These files offer foundational functionalities used by other components or available for general use. They cover DOM manipulation, event handling, object operations, asynchronous control, sequential ID generation, observing DOM changes, and persisting page state.

*   **Description:** A collection of core helper functions and classes for common web development tasks. They provide abstractions over standard browser APIs and implement useful patterns like the Observer and a simple PID (Process ID) system for managing asynchronous operations. `pagememory.js` offers a simple way to save and restore the state of specific page elements using `localStorage`.
*   **Key Features:**
    *   Simplified DOM element selection and manipulation.
    *   Cross-browser event handling utilities.
    *   Object property manipulation and checking.
    *   Mechanism for tracking and potentially cancelling asynchronous tasks (`pid`).
    *   Generating unique client-side identifiers.
    *   Observing DOM attribute changes (via `observer`).
    *   Saving and restoring input values and potentially other element states (`pagememory`).
*   **Dependencies:** Primarily relies on native browser APIs. Components might depend on utilities defined earlier in the inclusion order (e.g., `common.js` functions used by `controller.js`).

#### How to Use / API Highlights / Examples:

Usage typically involves calling static methods or functions exposed globally or within a top-level namespace (like `JCGWeb.Functions`).

**Example 1: Using a Common Utility (e.g., `getById` or similar)**

This example demonstrates selecting a DOM element using a common utility function.

*   **Input:** An element ID string.
*   **Code Snippet:**
    ```javascript
    // Assuming a function like JCGWeb.Functions.getById exists
    const myElement = JCGWeb.Functions.getById('myDiv');

    if (myElement) {
        console.log('Element found:', myElement);
        myElement.textContent = 'Content updated by script!';
    } else {
        console.error('Element not found!');
    }
    ```
*   **Output:** Logs the element if found and updates its text content.
*   **Explanation:** Core utilities often wrap common DOM tasks, making them potentially simpler or more robust across different browser versions compared to raw `document.getElementById`.

**Example 2: Using Page Memory (`pagememory.js`)**

This example shows how to save and load the value of an input field.

*   **Input:** An input element and potentially a unique key.
*   **Code Snippet:**
    ```html
    <input type="text" id="myInput" data-memory-key="userInput">
    <button onclick="saveInput()">Save</button>
    <button onclick="loadInput()">Load</button>

    <script>
    // Assuming JCGWeb.PageMemory exists and is initialized
    function saveInput() {
        const inputElement = document.getElementById('myInput');
        // saveElementState function likely takes element or key and saves its state
        JCGWeb.PageMemory.saveElementState(inputElement);
        console.log('Input state saved.');
    }

    function function loadInput() {
        const inputElement = document.getElementById('myInput');
         // loadElementState function likely takes element or key and restores its state
        JCGWeb.PageMemory.loadElementState(inputElement);
        console.log('Input state loaded.');
    }

    // On page load, attempt to load state for all elements with data-memory-key attribute
    document.addEventListener('DOMContentLoaded', () => {
         JCGWeb.PageMemory.loadAll(); // Or similar function to initialize/load
    });
    </script>
    ```
*   **Output:** Saves the current value of the input to `localStorage` and loads it back.
*   **Explanation:** `pagememory.js` provides a simple way to persist UI state across page reloads or sessions, enhancing user experience for forms or interactive elements. The mechanism likely relies on data attributes (like `data-memory-key`) to identify elements and their associated storage keys.

### 📊 Component: TableSorter (`TableSorter.js`)

*   **Description:** A JavaScript class or set of functions designed to make standard HTML `<table>` elements sortable by clicking on column headers. It manipulates the DOM to reorder rows based on the content of cells in the clicked column, handling different data types (text, numbers).
*   **Key Features:**
    *   Sort HTML tables dynamically.
    *   Supports sorting by different columns.
    *   Handles ascending and descending order.
    *   Likely attempts to infer data types for appropriate sorting.
*   **Dependencies:** Relies on core DOM manipulation utilities from `js/`.

#### How to Use / API Highlights / Examples:

Usage involves selecting the table and initializing the sorter.

**Example 1: Basic Table Sorting**

This example initializes sorting on a table with ID `mySortableTable`.

*   **Input:** An HTML table element or its ID.
*   **Code Snippet:**
    ```html
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
        </tbody>
    </table>

    <script>
    document.addEventListener('DOMContentLoaded', () => {
        const table = document.getElementById('mySortableTable');
        // Assuming TableSorter is available globally or via JCGWeb
        if (typeof TableSorter !== 'undefined') {
            new TableSorter(table); // Initialize the sorter
        } else {
            console.error('TableSorter not loaded.');
        }
    });
    </script>
    ```
*   **Output:** The table headers become clickable. Clicking a header sorts the table rows based on that column's data.
*   **Explanation:** The `TableSorter` constructor takes the table element and attaches click event listeners to the `<thead>` cells, triggering the sorting logic.

### 💬 Component: PopupMessage (`popupmessage.js`, `popupmessage.css`)

*   **Description:** Provides functionality to display temporary, non-intrusive popup messages (like toasts or notifications) on the screen to provide feedback to the user. It includes associated CSS for styling the messages.
*   **Key Features:**
    *   Display transient messages.
    *   Customizable message content.
    *   Timed auto-dismissal.
    *   Associated CSS for visual styling.
*   **Dependencies:** Requires `popupmessage.css` for styling and potentially core DOM manipulation utilities.

#### How to Use / API Highlights / Examples:

Usage likely involves a function call to trigger a message.

**Example 1: Displaying a Success Message**

This example shows how to display a simple success notification.

*   **Input:** Message text, potentially message type (success, error, info), and duration.
*   **Code Snippet:**
    ```javascript
    // Assuming a function like JCGWeb.PopupMessage.show exists
    function showSuccess() {
        JCGWeb.PopupMessage.show('Operation completed successfully!', 'success', 3000); // Text, Type, Duration in ms
    }

    // Call this function on button click or after an action
    // <button onclick="showSuccess()">Show Success</button>
    ```
*   **Output:** A small popup message appears on the screen with the text "Operation completed successfully!" and fades away after 3 seconds.
*   **Explanation:** The `show` function likely creates a message element, adds it to the DOM, applies appropriate styling based on the type, and uses `setTimeout` to remove it after the specified duration.

### 🎨 Component: ThemeControl (`themeControl.js`, `themeControl.css`)

*   **Description:** Enables dynamic control over the visual theme of a web page. It allows applying different color schemes or styles and includes functionality to save the user's preferred theme using `localStorage` so it persists across sessions.
*   **Key Features:**
    *   Apply predefined or custom themes.
    *   Dynamically change page styles (likely via CSS variables or class names).
    *   Save the currently active theme to `localStorage`.
    *   Load the saved theme on page load.
    *   Associated CSS for defining themes or variables.
*   **Dependencies:** Requires `themeControl.css` and relies on `localStorage` browser API.

#### How to Use / API Highlights / Examples:

Usage involves initializing the theme control and calling functions to apply or save themes.

**Example 1: Applying a Theme**

This example shows how to switch the page's theme programmatically.

*   **Input:** A theme identifier (e.g., a string name).
*   **Code Snippet:**
    ```javascript
    // Assuming JCGWeb.ThemeControl exists and is initialized
    function applyDarkTheme() {
        JCGWeb.ThemeControl.setTheme('dark'); // Apply the theme named 'dark'
    }

    function applyLightTheme() {
        JCGWeb.ThemeControl.setTheme('light'); // Apply the theme named 'light'
    }

    // Call these functions via UI elements like buttons or dropdowns
    // <button onclick="applyDarkTheme()">Dark Mode</button>
    ```
*   **Output:** The page's visual style changes according to the 'dark' or 'light' theme defined in the CSS and managed by the `themeControl.js`.
*   **Explanation:** The `setTheme` function likely adds a class to the `<body>` or `<html>` element (e.g., `theme-dark`) which CSS rules then target to apply specific styles or variable values.

**Example 2: Saving and Loading Theme Preference**

This example demonstrates how the theme preference is saved and automatically loaded.

*   **Input:** No direct input for loading; saving takes the current theme.
*   **Code Snippet:**
    ```javascript
    // In themeControl.js or initialization script:
    document.addEventListener('DOMContentLoaded', () => {
        JCGWeb.ThemeControl.loadSavedTheme(); // Attempt to load theme from localStorage

        // Assuming a UI element triggers saving
        document.getElementById('saveThemeButton').addEventListener('click', () => {
            JCGWeb.ThemeControl.saveCurrentTheme(); // Save the theme currently applied
            JCGWeb.PopupMessage.show('Theme preference saved.', 'info', 2000);
        });
    });
    ```
*   **Output:** On page load, the last saved theme is applied. Clicking the save button stores the current theme choice in `localStorage`.
*   **Explanation:** The `loadSavedTheme` function checks `localStorage` for a saved theme preference key and applies the corresponding theme using `setTheme`. `saveCurrentTheme` reads the active theme and stores it in `localStorage`.

### 🌳 Component: TreeList (`treelist.js`, `treelist.css`)

*   **Description:** A component for rendering hierarchical data as an interactive, collapsible tree structure within an HTML element. It allows users to expand and collapse nodes to navigate through nested data.
*   **Key Features:**
    *   Render hierarchical data visually.
    *   Expand and collapse tree nodes.
    *   Support for nested data structures.
    *   Associated CSS for tree node styling and icons.
*   **Dependencies:** Requires `treelist.css` and likely core DOM manipulation utilities.

#### How to Use / API Highlights / Examples:

Usage involves providing hierarchical data (e.g., an array of objects with nested children) and initializing the tree component on a target element.

**Example 1: Rendering a Simple Tree**

This example shows how to display a basic tree structure.

*   **Input:** A target HTML element and an array representing the tree data.
*   **Code Snippet:**
    ```html
    <div id="myTreeContainer"></div>

    <script>
    document.addEventListener('DOMContentLoaded', () => {
        const treeData = [
            {
                id: 'node1',
                text: 'Parent Node 1',
                children: [
                    { id: 'node1_1', text: 'Child Node 1.1' },
                    { id: 'node1_2', text: 'Child Node 1.2' }
                ]
            },
            {
                id: 'node2',
                text: 'Parent Node 2',
                children: [
                    { id: 'node2_1', text: 'Child Node 2.1' }
                ]
            }
        ];

        const container = document.getElementById('myTreeContainer');

        // Assuming JCGWeb.TreeList exists and has a render method
        if (typeof JCGWeb.TreeList !== 'undefined') {
             JCGWeb.TreeList.render(container, treeData); // Render the tree
        } else {
            console.error('TreeList component not loaded.');
        }
    });
    </script>
    ```
*   **Output:** An interactive tree structure is rendered inside the `myTreeContainer` div, with "Parent Node 1" and "Parent Node 2" initially visible and collapsible/expandable.
*   **Explanation:** The `render` function takes the container element and the data array, then recursively builds the HTML structure for the tree, attaching event listeners for expand/collapse actions.

## 🔧 Configuration

Client-side configuration is primarily handled through the initialization of components and the use of browser `localStorage` for persistence.

*   **Theme Persistence:** The `themeControl.js` component saves the active theme name to `localStorage` under a specific key. Users can change themes via UI elements, and the preference is automatically saved and loaded on subsequent visits. The key used for storage is internal to the component.
*   **Page Memory:** The `pagememory.js` utility saves the state of elements (like input values) to `localStorage`, using keys derived from element IDs or `data-memory-key` attributes. This provides a simple, element-specific state persistence mechanism.

There are no external configuration files (like `.env` or `.json` configs) processed by the client-side code itself; the `dummy/` files are data sources, not configuration.

## 🔒 Security & Safety Highlights

This library is designed for client-side execution within the user's browser.

*   **No Server Interaction Required:** The core functionalities operate purely in the browser environment, minimizing reliance on external servers beyond serving the initial files.
*   **No Sensitive Data Handling:** The components primarily handle UI state and presentation logic. There is no inherent functionality for processing sensitive user credentials or private data.
*   **Local Storage Usage:** Theme preferences and page memory use `localStorage`, which is isolated to the user's browser and the specific domain. While convenient for persistence, developers should be mindful that `localStorage` is not encrypted and should not be used for highly sensitive information.
*   **DOM Manipulation:** Standard DOM manipulation techniques are used. Care should be taken when using these utilities with user-provided content to prevent potential Cross-Site Scripting (XSS) vulnerabilities, though the utilities themselves do not introduce new inherent risks beyond the standard browser environment.

The project emphasizes safe operation within the browser sandbox, focusing on enhancing user interface functionality without requiring elevated permissions or handling sensitive data externally.

## 🚧 Limitations and Edge Cases

*   **Client-Side Only:** All functionality runs in the user's browser. This is not suitable for server-side tasks, complex data processing, or operations requiring access to server-side resources.
*   **Browser Compatibility:** While basic DOM manipulation is broadly compatible, specific features (like `localStorage`) might have minor variations or require polyfills for very old browsers. Modern browsers are assumed.
*   **Performance:** Manipulating large tables or deeply nested trees client-side can impact performance, especially on less powerful devices.
*   **No Formal Package Management:** The files are intended for direct inclusion via `<script>` and `<link>` tags. There are no build steps or package manager configurations (`npm`, `yarn`, etc.) included in this repository structure, which might limit integration into larger, module-based front-end projects without manual effort.
*   **State Persistence Limits:** `localStorage` is limited in capacity and intended for relatively small amounts of data. `pagememory` is best suited for simple state like input values, not complex application state.

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
