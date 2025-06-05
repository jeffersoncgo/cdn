# 🚀 README AI - cdn

This repository houses a collection of client-side JavaScript utilities, CSS styles, and sample data designed for web development projects. The core purpose of these files is to provide reusable components and helper functions to address common frontend challenges, such as DOM manipulation, state management, asynchronous task control, dynamic styling, and data presentation. It serves as a potential 'cdn' (Content Delivery Network) source for integrating these utilities into various web applications, offering a structured and organized approach to enhancing user interfaces and managing client-side logic effectively.

## 📄 Table of Contents

*   [🚀 README AI - cdn](#readme-ai---cdn)
*   [📄 Table of Contents](#-table-of-contents)
*   [✨ Features](#--features)
*   [🛠️ Installation / Setup](#️-installation--setup)
*   [📂 Project Structure](#-project-structure)
*   [📋 Requirements](#-requirements)
*   [🔒 Security & Safety Highlights](#-security--safety-highlights)
*   [📖 Detailed Usage / API Documentation](#-detailed-usage--api-documentation)
    *   [Global Namespace and Core Utilities (`js/base.js`, `js/common.js`)](#global-namespace-and-core-utilities--jsbasejs-jscommonjs)
    *   [Object Manipulation (`js/object.js`)](#object-manipulation--jsobjectjs)
    *   [DOM and Event Observation (`js/observer.js`)](#dom-and-event-observation--jsobserverjs)
    *   [Asynchronous Task Control (`js/pid.js`)](#asynchronous-task-control--jspidjs)
    *   [Table Sorting (`js/TableSorter.js`)](#table-sorting--jstablsorterjs)
    *   [Popup Messages (`js/popupmessage.js`, `js/popupmessage.css`)](#popup-messages--jspopupmessagejs-jspopupmessagecss)
    *   [Theme Control (`js/themeControl.js`, `js/themeControl.css`)](#theme-control--jsthemecontroljs-jsthemecontrolcss)
    *   [Tree Lists (`js/treelist.js`, `js/treelist.css`)](#tree-lists--jstreelistjs-jstreelistcss)
    *   [Page Memory / State Persistence (`js/pagememory.js`)](#page-memory--state-persistence--jspagememoryjs)
    *   [Controller (`js/controller.js`)](#controller--jscontrollerjs)
    *   [Demonstration Script (`script.js`)](#demonstration-script--scriptjs)
    *   [Dummy Data (`dummy/`)](#dummy-data--dummy)
*   [⚙️ Configuration](#️-configuration)
*   [⚠️ Limitations and Edge Cases](#️-limitations-and-edge-cases)
*   [🤝 Contributing](#--contributing)
*   [📄 License](#-license)
*   [🚧 Work in Progress](#--work-in-progress)

## ✨ Features

*   Centralized `JCGWeb` namespace for organizing client-side utilities.
*   Core helpers for DOM manipulation, event handling, and position calculations.
*   Utility for parsing URL parameters.
*   Dynamic loading of HTML elements.
*   Generation of unique identifiers.
*   Advanced object path manipulation for accessing nested properties.
*   Comprehensive DOM change and event observation capabilities using `MutationObserver`.
*   Asynchronous task control with cancellation via `AbortController`.
*   Client-side table sorting functionality.
*   User interface state persistence across page loads using `localStorage`.
*   Temporary popup notification system.
*   Dynamic theme switching and persistence.
*   Generation of interactive, collapsible tree list structures.
*   Mock JSON data for development and testing purposes.
*   Demonstration script showcasing integration and usage of various components.

## 🛠️ Installation / Setup

This repository contains client-side assets (JavaScript, CSS, HTML) and does not require a server-side environment for basic usage.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/jeffersoncgo/cdn.git
    ```
2.  **Navigate to the repository directory:**
    ```bash
    cd cdn
    ```
3.  **Open `index.html`:**
    Simply open the `index.html` file in a modern web browser. This file demonstrates the usage of the various JavaScript utilities and CSS styles included in the repository.

To integrate these utilities into your own project, you can:

*   Copy the relevant files (`.js`, `.css`) from the `js/` directory into your project.
*   Include the scripts and stylesheets in your HTML files using `<script>` and `<link>` tags, ensuring the paths are correct.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Project</title>
    <!-- Include core styles -->
    <link rel="stylesheet" href="path/to/style.css">
    <!-- Include component specific styles -->
    <link rel="stylesheet" href="path/to/js/popupmessage.css">
    <link rel="stylesheet" href="path/to/js/themeControl.css">
    <link rel="stylesheet" href="path/to/js/treelist.css">
</head>
<body>
    <!-- Your HTML content -->

    <!-- Include core JS utilities -->
    <script src="path/to/js/base.js"></script>
    <script src="path/to/js/common.js"></script>
    <script src="path/to/js/object.js"></script>
    <script src="path/to/js/observer.js"></script>
    <script src="path/to/js/pagememory.js"></script>
    <script src="path/to/js/pid.js"></script>
    <script src="path/to/js/TableSorter.js"></script>

    <!-- Include component specific JS -->
    <script src="path/to/js/popupmessage.js"></script>
    <script src="path/to/js/themeControl.js"></script>
    <script src="path/to/js/treelist.js"></script>

    <!-- Include your main script -->
    <script src="path/to/script.js"></script>
</body>
</html>
```

## 📂 Project Structure

The repository is organized as follows:

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

*   `.github/`: Contains GitHub-specific files, potentially including workflows or issue templates.
*   `dummy/`: Holds static JSON files (`products.json`, `users.json`) serving as mock data sources for development or demonstration.
*   `js/`: The primary directory for all client-side JavaScript utility files and associated CSS. Each file typically encapsulates a specific module or set of related functionalities.
*   `index.html`: The main HTML file, likely serving as a demonstration page that includes and utilizes the various JavaScript and CSS assets.
*   `README.md`: This file, providing documentation for the repository.
*   `script.js`: A main script file that likely orchestrates the loading and usage of the components from the `js/` directory, serving as the primary entry point for the `index.html` demo.
*   `style.css`: Contains general styles for the `index.html` or common styles used across components.

## 📋 Requirements

*   A modern web browser (Chrome, Firefox, Safari, Edge) supporting standard JavaScript (ES6+) and CSS3.

## 🔒 Security & Safety Highlights

This project is designed to be a collection of client-side utilities. Key security and safety aspects include:

*   **Client-Side Execution:** All code runs within the user's browser sandbox, limiting potential server-side risks.
*   **No Sensitive Data Handling:** The included dummy data is public mock data. The utilities themselves are not designed to handle sensitive user credentials or private information unless explicitly integrated and handled securely by the consuming application.
*   **Local Storage Usage:** The state persistence (`pagememory.js`, `themeControl.js`) utilizes browser `localStorage`, which is scoped to the domain and generally considered safe for non-sensitive user preferences or UI states. Users can clear browser data to reset this storage.
*   **Structured Code:** The use of a global `JCGWeb` namespace helps prevent global scope pollution and potential conflicts with other libraries.
*   **Asynchronous Control:** The PID utility provides mechanisms for managing asynchronous operations, potentially helping to prevent resource exhaustion or race conditions in complex frontend logic.

As with any client-side code, integrating these utilities into a larger application requires careful consideration of how user input is handled and how data is transmitted to or from a server, but the utilities themselves provide a safe foundation for common frontend tasks.

## 📖 Detailed Usage / API Documentation

The JavaScript utilities in this repository are primarily organized under the global `JCGWeb` namespace to prevent conflicts. Below are descriptions and usage examples for key components based on the provided analysis.

### Global Namespace and Core Utilities (`js/base.js`, `js/common.js`)

These files establish the foundation for the library, defining the `JCGWeb` namespace and providing fundamental helper functions for DOM manipulation, event handling, element positioning, URL parsing, dynamic loading, and unique ID generation.

*   **Description:** Provides core helper functions essential for frontend development within the `JCGWeb` namespace. Includes utilities for selecting DOM elements, adding/removing event listeners, calculating element positions, parsing URL query strings, loading HTML content dynamically, and generating unique identifiers.
*   **Key Features:**
    *   DOM element selection (`JCGWeb.id`, `JCGWeb.query`, `JCGWeb.queryAll`).
    *   Event handling utilities (`JCGWeb.addEvent`, `JCGWeb.removeEvent`).
    *   Element position and dimension calculations (`JCGWeb.getPosition`, `JCGWeb.getSize`).
    *   URL parameter parsing (`JCGWeb.getURLParameters`).
    *   Dynamic element loading (`JCGWeb.loadHTML`).
    *   Unique ID generation (`JCGWeb.newId`).
*   **Dependencies:** None (core utilities).
*   **How to Use / API Highlights / Examples:**

    **Example 1: Selecting elements and adding an event listener**

    *   **Input:** An HTML button with ID `myButton`, and a function to call when clicked.
    *   **Code Snippet:**
        ```javascript
        // Assuming an element like <button id="myButton">Click Me</button> exists
        const myButton = JCGWeb.id('myButton'); // Select element by ID

        if (myButton) {
            JCGWeb.addEvent(myButton, 'click', function() {
                alert('Button clicked!');
            });
        } else {
            console.error('Button with ID "myButton" not found.');
        }
        ```
    *   **Output:** Clicking the button will trigger a browser alert with the message "Button clicked!".
    *   **Explanation:** Demonstrates how to use `JCGWeb.id` to get a DOM element reference and `JCGWeb.addEvent` to attach an event listener safely across different browser environments.

    **Example 2: Parsing URL parameters**

    *   **Input:** A URL like `http://example.com/page?id=123&name=test`.
    *   **Code Snippet:**
        ```javascript
        // Assuming the current page URL is http://example.com/page?id=123&name=test
        const urlParams = JCGWeb.getURLParameters();
        console.log(urlParams);
        console.log('ID:', urlParams.id);
        console.log('Name:', urlParams.name);
        ```
    *   **Output:**
        ```
        { id: "123", name: "test" }
        ID: 123
        Name: test
        ```
    *   **Explanation:** Shows how `JCGWeb.getURLParameters` can easily parse the query string of the current URL into a JavaScript object.

### Object Manipulation (`js/object.js`)

*   **Description:** Provides utilities for safely accessing and manipulating properties within nested JavaScript objects using a string path notation (e.g., `'user.address.city'`).
*   **Key Features:**
    *   Get nested property value by path (`JCGWeb.Object.get`).
    *   Set nested property value by path (`JCGWeb.Object.set`).
    *   Check if a nested property exists by path (`JCGWeb.Object.has`).
*   **Dependencies:** `js/base.js` (relies on `JCGWeb` namespace).
*   **How to Use / API Highlights / Examples:**

    **Example 1: Getting a nested property**

    *   **Input:** A nested object and a property path string.
    *   **Code Snippet:**
        ```javascript
        const user = {
            id: 1,
            profile: {
                name: 'Alice',
                address: {
                    city: 'Wonderland',
                    zip: '12345'
                }
            },
            roles: ['admin', 'editor']
        };

        const city = JCGWeb.Object.get(user, 'profile.address.city');
        const firstRole = JCGWeb.Object.get(user, 'roles.0'); // Access array elements by index
        const nonExistent = JCGWeb.Object.get(user, 'profile.contact.email'); // Path that doesn't exist

        console.log('City:', city);
        console.log('First Role:', firstRole);
        console.log('Non-existent:', nonExistent);
        ```
    *   **Output:**
        ```
        City: Wonderland
        First Role: admin
        Non-existent: undefined
        ```
    *   **Explanation:** Demonstrates using `JCGWeb.Object.get` to retrieve values from deep within an object structure using a simple dot-notation path. It also shows how it gracefully handles non-existent paths by returning `undefined`.

    **Example 2: Setting a nested property**

    *   **Input:** An object, a property path string, and the new value.
    *   **Code Snippet:**
        ```javascript
        const user = {
            id: 1,
            profile: {
                name: 'Alice',
                address: {
                    city: 'Wonderland'
                }
            }
        };

        JCGWeb.Object.set(user, 'profile.address.zip', '98765'); // Set an existing path
        JCGWeb.Object.set(user, 'profile.contact.email', 'alice@example.com'); // Set a path, creating objects if necessary
        JCGWeb.Object.set(user, 'isActive', true); // Set a top-level property

        console.log(user);
        ```
    *   **Output:**
        ```javascript
        {
          id: 1,
          profile: {
            name: 'Alice',
            address: {
              city: 'Wonderland',
              zip: '98765' // Added
            },
            contact: { // Created
              email: 'alice@example.com' // Added
            }
          },
          isActive: true // Added
        }
        ```
    *   **Explanation:** Illustrates how `JCGWeb.Object.set` can modify existing properties or create new ones (including intermediate objects) based on the provided path.

### DOM and Event Observation (`js/observer.js`)

*   **Description:** Provides a wrapper around `MutationObserver` and standard event listeners to simplify observing changes to the DOM or specific events on elements.
*   **Key Features:**
    *   Observe DOM mutations (attributes, child list, subtree) on a target element.
    *   Observe standard events (click, input, etc.) on a target element.
    *   Unified interface for different observation types.
    *   Easy disconnection/cleanup of observers and listeners.
*   **Dependencies:** `js/base.js`.
*   **How to Use / API Highlights / Examples:**

    **Example 1: Observing DOM attribute changes**

    *   **Input:** A target DOM element and a callback function.
    *   **Code Snippet:**
        ```javascript
        // Assuming an element like <div id="myDiv"></div> exists
        const myDiv = JCGWeb.id('myDiv');

        if (myDiv) {
            // Create a new observer instance
            const divObserver = new JCGWeb.Observer(myDiv);

            // Start observing attribute changes
            divObserver.observe('attributes', function(mutations) {
                mutations.forEach(mutation => {
                    console.log(`Attribute '${mutation.attributeName}' changed on element:`, mutation.target);
                });
            });

            // --- Simulate a change after a short delay ---
            setTimeout(() => {
                myDiv.setAttribute('data-state', 'active');
            }, 1000);

            // To stop observing later:
            // divObserver.disconnect('attributes');
        }
        ```
    *   **Output:** After 1 second, a console message will appear: `Attribute 'data-state' changed on element: <div id="myDiv" data-state="active"></div>`.
    *   **Explanation:** Shows how to instantiate `JCGWeb.Observer` and use the `observe` method with type `'attributes'` to react to changes in the element's attributes.

    **Example 2: Observing a standard event**

    *   **Input:** A target DOM element and a callback function for a specific event type.
    *   **Code Snippet:**
        ```javascript
        // Assuming an element like <input type="text" id="myInput"></div> exists
        const myInput = JCGWeb.id('myInput');

        if (myInput) {
             // Use the same observer instance or a new one
            const inputObserver = new JCGWeb.Observer(myInput);

            // Start observing 'input' events
            inputObserver.observe('input', function(event) {
                console.log('Input value changed:', event.target.value);
            });

            // To stop observing later:
            // inputObserver.disconnect('input');
        }
        ```
    *   **Output:** As the user types in the input field, console messages will appear showing the current value.
    *   **Explanation:** Demonstrates using `JCGWeb.Observer` to attach standard event listeners, providing a consistent API alongside DOM mutation observation.

### Asynchronous Task Control (`js/pid.js`)

*   **Description:** Provides a mechanism to manage and cancel asynchronous tasks, likely utilizing `AbortController`, allowing for controlled execution of operations like fetching data or animations. The name "PID" might be a historical or internal reference; its functionality aligns with process/task management.
*   **Key Features:**
    *   Create cancellable task contexts.
    *   Signal task cancellation.
    *   Associate tasks with a cancellation signal.
*   **Dependencies:** `js/base.js`. Relies on the browser's native `AbortController` API.
*   **How to Use / API Highlights / Examples:**

    **Example 1: Creating and using a cancellable task**

    *   **Input:** An asynchronous operation (e.g., `fetch`) that supports `AbortSignal`.
    *   **Code Snippet:**
        ```javascript
        async function fetchData(url, signal) {
            try {
                console.log('Fetching data...');
                const response = await fetch(url, { signal });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                console.log('Data fetched successfully:', data);
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('Fetch aborted.');
                } else {
                    console.error('Fetch error:', error);
                }
            }
        }

        // Create a PID (task controller)
        const dataPid = new JCGWeb.PID();

        // Start the fetch operation, passing the signal from the PID
        fetchData('https://jsonplaceholder.typicode.com/todos/1', dataPid.signal);

        // --- Simulate cancelling the task after a short delay ---
        setTimeout(() => {
            console.log('Attempting to cancel fetch...');
            dataPid.cancel(); // Cancel the task
        }, 50); // Cancel very quickly

        // To check if cancelled:
        // console.log('Is cancelled?', dataPid.isCancelled());
        ```
    *   **Output:**
        ```
        Fetching data...
        Attempting to cancel fetch...
        Fetch aborted.
        ```
        (If the timeout was longer, the fetch might complete before cancellation).
    *   **Explanation:** Demonstrates creating a `JCGWeb.PID` instance, which internally manages an `AbortController`. The `signal` from the PID is passed to an async operation (`fetch` in this case). Calling `dataPid.cancel()` triggers the abort signal, allowing the async operation to detect the cancellation and stop.

### Table Sorting (`js/TableSorter.js`)

*   **Description:** Provides client-side functionality to make HTML tables sortable by clicking on column headers. It handles different data types and sorting orders.
*   **Key Features:**
    *   Sort table rows based on column data.
    *   Toggle ascending/descending order.
    *   Automatic detection of data types (numbers, strings, dates - potentially).
*   **Dependencies:** `js/base.js`. Requires a structured HTML `<table>`.
*   **How to Use / API Highlights / Examples:**

    **Example 1: Making a table sortable**

    *   **Input:** An HTML `<table>` element.
    *   **Code Snippet:**
        ```html
        <table id="mySortableTable">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Date Joined</th>
                </tr>
            </thead>
            <tbody>
                <tr><td>Charlie</td><td>30</td><td>2020-01-15</td></tr>
                <tr><td>Alice</td><td>25</td><td>2021-05-20</td></tr>
                <tr><td>Bob</td><td>35</td><td>2019-11-01</td></tr>
            </tbody>
        </table>

        <script>
            // Wait for the DOM to be ready
            JCGWeb.addEvent(document, 'DOMContentLoaded', function() {
                const tableElement = JCGWeb.id('mySortableTable');
                if (tableElement) {
                    // Initialize the TableSorter
                    const sorter = new JCGWeb.TableSorter(tableElement);
                    console.log('TableSorter initialized.');
                } else {
                    console.error('Table with ID "mySortableTable" not found.');
                }
            });
        </script>
        ```
    *   **Output:** The headers of the table (`Name`, `Age`, `Date Joined`) will become clickable. Clicking a header will reorder the table rows based on the content of that column. Clicking again will reverse the sort order.
    *   **Explanation:** Instantiate `JCGWeb.TableSorter` with the target `<table>` element. The sorter automatically adds event listeners to `<th>` elements within the `<thead>` to trigger sorting when clicked.

### Popup Messages (`js/popupmessage.js`, `js/popupmessage.css`)

*   **Description:** Provides a simple system for displaying temporary, non-intrusive popup messages (like toasts) on the screen.
*   **Key Features:**
    *   Display messages with different types (e.g., success, error, info).
    *   Messages disappear automatically after a set duration.
    *   Configurable position and styling (via CSS).
*   **Dependencies:** `js/base.js`, `js/popupmessage.css`.
*   **How to Use / API Highlights / Examples:**

    **Example 1: Showing an info message**

    *   **Input:** Message text.
    *   **Code Snippet:**
        ```javascript
        // Ensure popupmessage.css is linked in your HTML
        JCGWeb.addEvent(document, 'DOMContentLoaded', function() {
             // Show a simple info message
            JCGWeb.PopupMessage.show('This is an informational message.');

            // Show a message with a specific type
            setTimeout(() => {
                JCGWeb.PopupMessage.show('Action completed successfully!', 'success');
            }, 1000);

             // Show a message with a different type
            setTimeout(() => {
                 JCGWeb.PopupMessage.show('An error occurred.', 'error');
            }, 2000);
        });
        ```
    *   **Output:** Three different popup messages will appear sequentially on the screen, styled according to the CSS for 'info', 'success', and 'error' types, and then automatically disappear.
    *   **Explanation:** The `JCGWeb.PopupMessage.show()` method is used to display messages. The optional second argument specifies the message type, which can be used by the accompanying CSS for styling.

### Theme Control (`js/themeControl.js`, `js/themeControl.css`)

*   **Description:** Manages dynamic theme switching for the web page, allowing users to select a preferred theme (e.g., light/dark mode) and potentially persisting this choice using `localStorage`.
*   **Key Features:**
    *   Apply themes by adding CSS classes (e.g., `theme-dark`, `theme-light`) to a root element (like `<body>` or `<html>`).
    *   Persist the selected theme using `localStorage`.
    *   Load the preferred theme automatically on page load.
*   **Dependencies:** `js/base.js`, `js/themeControl.css`. Requires CSS rules defined for different theme classes.
*   **How to Use / API Highlights / Examples:**

    **Example 1: Switching and persisting themes**

    *   **Input:** Theme name string (e.g., `'dark'`, `'light'`).
    *   **Code Snippet:**
        ```javascript
        // Ensure themeControl.css is linked in your HTML
        // Your CSS should define rules like:
        // body.theme-dark { background: #333; color: #eee; }
        // body.theme-light { background: #eee; color: #333; }

        JCGWeb.addEvent(document, 'DOMContentLoaded', function() {
            // Initialize ThemeControl (loads saved theme or default)
            JCGWeb.ThemeControl.init();
            console.log('ThemeControl initialized. Current theme loaded from localStorage or default.');

            // --- Simulate user clicking a theme switch button ---
            // Assuming a button with ID 'toggleThemeButton' exists
            const toggleButton = JCGWeb.id('toggleThemeButton');
            if (toggleButton) {
                 JCGWeb.addEvent(toggleButton, 'click', function() {
                    const currentTheme = JCGWeb.ThemeControl.getCurrentTheme();
                    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

                    JCGWeb.ThemeControl.setTheme(newTheme); // Switch theme and save to localStorage
                    console.log(`Switched theme to: ${newTheme}`);
                 });
            }

            // You can also directly set a theme:
            // JCGWeb.ThemeControl.setTheme('dark');
        });
        ```
    *   **Output:** On page load, the previously saved theme (or a default) is applied. Clicking the toggle button switches between 'light' and 'dark' themes, updating the appearance via CSS classes on the `<body>` element and saving the preference to `localStorage`.
    *   **Explanation:** `JCGWeb.ThemeControl.init()` should be called on page load. `JCGWeb.ThemeControl.setTheme(themeName)` applies the theme (by adding/removing `theme-{themeName}` classes) and saves it. `JCGWeb.ThemeControl.getCurrentTheme()` retrieves the currently active theme name.

### Tree Lists (`js/treelist.js`, `js/treelist.css`)

*   **Description:** Generates interactive, collapsible HTML tree structures from hierarchical data. Useful for displaying file systems, categories, nested menus, etc.
*   **Key Features:**
    *   Render nested data as an unordered list (`<ul>`).
    *   Nodes can be expanded and collapsed.
    *   Supports node labels and potentially icons or other custom content.
*   **Dependencies:** `js/base.js`, `js/treelist.css`. Requires data in a hierarchical structure (e.g., an array of objects with nested children arrays).
*   **How to Use / API Highlights / Examples:**

    **Example 1: Rendering a basic tree**

    *   **Input:** A target DOM element (where the tree will be rendered) and an array representing the tree structure.
    *   **Code Snippet:**
        ```html
        <div id="treeContainer"></div>

        <script>
            // Sample hierarchical data
            const treeData = [
                {
                    label: 'Documents',
                    children: [
                        { label: 'Report.pdf' },
                        { label: 'Presentation.pptx' }
                    ]
                },
                {
                    label: 'Images',
                    children: [
                        { label: 'Nature', children: [{ label: 'forest.jpg' }] },
                        { label: 'Cities' }
                    ]
                },
                { label: 'Videos' }
            ];

            JCGWeb.addEvent(document, 'DOMContentLoaded', function() {
                 const container = JCGWeb.id('treeContainer');
                 if (container) {
                    // Render the tree inside the container
                    JCGWeb.TreeList.render(container, treeData);
                    console.log('Tree rendered.');
                 } else {
                    console.error('Tree container not found.');
                 }
            });
        </script>
        ```
    *   **Output:** An interactive tree structure will be generated inside the `div#treeContainer`. Parent nodes ('Documents', 'Images', 'Nature') will be collapsible.
    *   **Explanation:** The `JCGWeb.TreeList.render(containerElement, dataArray)` method takes the target element and the hierarchical data array to build the tree UI. The data structure is expected to have `label` properties for node text and optional `children` arrays for nested items.

### Page Memory / State Persistence (`js/pagememory.js`)

*   **Description:** Provides utilities to persist the state of specific HTML elements or user interface configurations across page loads using `localStorage`. This is useful for remembering things like scroll positions, form input values, or the expanded/collapsed state of UI elements.
*   **Key Features:**
    *   Save the state of an element or value to `localStorage`.
    *   Load the saved state on page load.
    *   Associate states with unique keys.
*   **Dependencies:** `js/base.js`. Relies on the browser's native `localStorage` API.
*   **How to Use / API Highlights / Examples:**

    **Example 1: Persisting an input field value**

    *   **Input:** An input element and a unique storage key.
    *   **Code Snippet:**
        ```html
        <input type="text" id="persistentInput" placeholder="Enter something...">

        <script>
            JCGWeb.addEvent(document, 'DOMContentLoaded', function() {
                const inputElement = JCGWeb.id('persistentInput');
                const storageKey = 'myInputState';

                if (inputElement) {
                    // Load saved value on page load
                    const savedValue = JCGWeb.PageMemory.get(storageKey);
                    if (savedValue !== null) {
                        inputElement.value = savedValue;
                        console.log(`Loaded saved value for input: "${savedValue}"`);
                    } else {
                        console.log('No saved value found for input.');
                    }

                    // Save value whenever the input changes
                    JCGWeb.addEvent(inputElement, 'input', function() {
                        JCGWeb.PageMemory.set(storageKey, inputElement.value);
                        console.log(`Saved value for input: "${inputElement.value}"`);
                    });
                }
            });
        </script>
        ```
    *   **Output:** When you type into the input field, its value is saved to `localStorage`. If you refresh the page, the saved value will be loaded back into the input field.
    *   **Explanation:** `JCGWeb.PageMemory.get(key)` retrieves a saved value. `JCGWeb.PageMemory.set(key, value)` saves a value. This pattern can be extended to save other types of state, like the scroll position of a container or the checked state of checkboxes.

### Controller (`js/controller.js`)

*   **Description:** While not explicitly detailed in the analysis, a file named `controller.js` in a client-side context often suggests logic for handling user interactions, managing application state flow, or coordinating between different components (like views and data utilities). It likely serves as a central point for event handling and directing actions based on user input or application state changes.
*   **Key Features:** (Inferred)
    *   Event handling layer.
    *   Logic for responding to UI events.
    *   Coordination between different `JCGWeb` modules.
*   **Dependencies:** `js/base.js`, potentially other `JCGWeb` modules.
*   **How to Use / API Highlights / Examples:** Usage would depend heavily on its specific implementation, but it would likely involve initializing the controller and potentially binding UI elements to controller methods.

    **Example (Inferred): Initializing a Controller**

    *   **Code Snippet:**
        ```javascript
        JCGWeb.addEvent(document, 'DOMContentLoaded', function() {
            // Assuming Controller requires initialization
            if (JCGWeb.Controller && typeof JCGWeb.Controller.init === 'function') {
                 JCGWeb.Controller.init();
                 console.log('Controller initialized.');
            }
        });
        ```
    *   **Explanation:** This is speculative based on typical client-side controller patterns. The actual implementation in `js/controller.js` would define its specific API and how it interacts with the page.

### Demonstration Script (`script.js`)

*   **Description:** This file serves as the main script for the `index.html` demo page. It imports and orchestrates the usage of various utilities from the `js/` directory, demonstrating how they can be integrated and used together in a typical web application context.
*   **Purpose:** To showcase the functionalities of the different `JCGWeb` components and provide working examples for users exploring the repository. It likely contains code that fetches dummy data, initializes components like `TableSorter`, `ThemeControl`, and `TreeList`, and sets up event listeners using the core utilities.
*   **Dependencies:** Depends on all other relevant `.js` files being loaded before it.
*   **Usage:** This file is not a utility to be used *by* other scripts but rather the script that *uses* the utilities for demonstration purposes. Reviewing `script.js` is essential to understand how the various `JCGWeb` components are intended to be initialized and used together.

### Dummy Data (`dummy/`)

*   **Description:** The `dummy/` directory contains static JSON files (`products.json`, `users.json`) providing mock data. This data is likely used by `script.js` or other demo code to populate tables, lists, or other UI elements, allowing the utilities to be demonstrated without needing a live backend.
*   **Usage:** These files are typically fetched using standard web requests (e.g., `fetch` API) by client-side JavaScript during development or demonstration.

    **Example: Fetching dummy data**

    *   **Code Snippet:**
        ```javascript
        async function loadDummyData() {
            try {
                const productsResponse = await fetch('dummy/products.json');
                const products = await productsResponse.json();
                console.log('Loaded products:', products);

                const usersResponse = await fetch('dummy/users.json');
                const users = await usersResponse.json();
                console.log('Loaded users:', users);

                // Now you can use 'products' and 'users' data with other JCGWeb utilities
                // e.g., populate a table using TableSorter, render a tree list, etc.

            } catch (error) {
                console.error('Failed to load dummy data:', error);
            }
        }

        JCGWeb.addEvent(document, 'DOMContentLoaded', loadDummyData);
        ```
    *   **Explanation:** Demonstrates how client-side code would typically fetch and use the JSON data provided in the `dummy/` directory.

## ⚙️ Configuration

This repository primarily consists of client-side JavaScript utilities and does not have a centralized, project-level configuration file (like a `.env` or `config.json`) in the typical sense.

Individual components might have internal options or parameters that can be configured during their instantiation or through method calls, as seen in the usage examples (e.g., specifying the message type for `JCGWeb.PopupMessage.show`).

The `dummy/` directory contains static data files (`products.json`, `users.json`) which serve as mock data sources, but these are not runtime configuration files for the utilities themselves.

## ⚠️ Limitations and Edge Cases

*   **Browser Compatibility:** While `js/base.js` and `js/common.js` might include some basic compatibility checks, extensive testing across a wide range of legacy browsers is not guaranteed. Features relying on newer APIs like `MutationObserver` (`js/observer.js`) or `AbortController` (`js/pid.js`) will only work in modern browsers.
*   **Performance:** Utilities like `TableSorter` might experience performance limitations with extremely large datasets as sorting is performed client-side within the browser's main thread.
*   **Complexity:** The `JCGWeb.Object` utility's path manipulation might have limitations with complex key names or advanced array manipulation beyond simple index access.
*   **Specificity:** CSS files (`popupmessage.css`, `themeControl.css`, `treelist.css`, `style.css`) provide default styling, but integration into an existing project may require adjusting CSS specificity or overriding styles to match the project's design system.

## 🤝 Contributing

If you are interested in contributing to this project, please consider the following:

*   This repository is intended as a collection of reusable frontend utilities. Contributions that enhance existing utilities, add new general-purpose components, or improve documentation are welcome.
*   Ensure new code adheres to the existing structure (e.g., using the `JCGWeb` namespace) and coding style.
*   Provide clear documentation and usage examples for any new features or components.
*   Submit a Pull Request with a clear description of the changes.

## 📄 License

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
