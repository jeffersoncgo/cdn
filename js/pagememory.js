if (typeof module != 'undefined') {
  Observer = require("./observer");
  Controller = require("./controller");
}



class pageMemory {
    constructor() {
        // Storage for previous page information
        this.previousPageInfo = {
            Title: null,
            Url: null,
            DOM: null,
            SavedElements: null,
        };

        // Initialize original page information
        this.originalPageInfo = {
            Title: null,
            Url: null,
            DOM: null,
            SavedElements: null,
        };

        this.Listeners = [
            'click',
            'keydown',
            'keyup',
            'keypress',
            'submit',
            'input',
            'change',
            'load',
            'unload',
            'DOMContentLoaded',
            'readystatechange',
            'onresize',
            'oncopy',
            'oncut',
            'onpaste'
        ]

        this.attributesToIgnore = [
            "id",               // Unique identifier – should not be duplicated/restored blindly
            "class",            // CSS classes – often dynamic or context-dependent
            "style",            // Inline styles – can be auto-injected or JS-generated
            "data-*",           // Dynamic user-defined data (handled via dataset API)
            "role",             // Accessibility-related; shouldn't be modified casually
            "aria-*",           // ARIA attributes – best left untouched
            "contenteditable",  // Editing state – volatile
            "draggable",        // UI interaction hint
            "tabindex",         // Keyboard focus control
            "hidden",           // Visibility toggling – usually not persistent
            "slot",             // Shadow DOM content slotting
            "autofocus",        // Transient focus behavior
            "dir",              // Text direction
            "lang",             // Language context
            "title",            // Tooltip – possibly dynamic
            "translate"         // i18n behavior
          ];

        // Initialize storage key and auto-save interval
        this.storageKey = 'pageMemoryData';
        this.autoSaveInterval = null;
        this.autoSaveDelay = 5000; // 5 seconds

        this.events = {
            onSaveMemory: [],
            onRestoreSucess: [],
            onRestoreError: [],
            onMemoryIsEmpty: [],
        }


        // initialize the page memory with a delay
        this.savePageInfo = new Controller(this.savePageInfo.bind(this))
        this.savePageInfo = this.savePageInfo.exec.bind(this.savePageInfo);
        this.restorePageInfo = new Controller(this.restorePageInfo.bind(this))
        this.restorePageInfo = this.restorePageInfo.exec.bind(this.restorePageInfo);

        this.addEvent = JCGWeb.Functions.addEvent;
        this.deleteEvent = JCGWeb.Functions.deleteEvent;
        this.clearEvents = JCGWeb.Functions.clearEvents;
        this.execEvents = JCGWeb.Functions.execEvents;

        this.observers = [];
    }

    init() {
        console.log('pageMemory initialized');
        this.setOriginalPageInfo();
        // this.startAutoSave();
        this.restorePageInfo();
    }


    // Get the current page information
    getCurrentPageInfo() {
        return {
            Title: document.title,
            Url: window.location.href,
            DOM: document.documentElement.outerHTML,
            SavedElements: this.getElementsToSave(),
        };
    }

    setOriginalPageInfo() {
        this.originalPageInfo = {
            Title: document.title,
            Url: window.location.href,
            DOM: document.documentElement.outerHTML,
            SavedElements: this.getElementsToSave(),
        };
    }

    // Set previous page information
    setPreviousPageInfo(title, url, dom, savedElements) {
        this.previousPageInfo.Title = title;
        this.previousPageInfo.Url = url;
        this.previousPageInfo.DOM = dom;
        this.previousPageInfo.SavedElements = savedElements;
    }

    // Get previous page information
    getPreviousPageInfo() {
        return this.previousPageInfo;
    }

    // Clear previous page information
    clearPreviousPageInfo() {
        this.previousPageInfo = {
            Title: null,
            Url: null,
            DOM: null,
            SavedElements: null,
        };
    }

    clearOriginalPageInfo() {
        this.originalPageInfo = {
            Title: null,
            Url: null,
            DOM: null,
            SavedElements: null,
        };
    }

    clearSavedMemory() {
        localStorage.removeItem(this.storageKey);
    }

    cleanMemory() {
        this.stopAutoSave();
        this.clearPreviousPageInfo();
        this.clearOriginalPageInfo();
        this.clearSavedMemory();
    }

    // Get elements marked with 'save' attribute
    getElementsToSave() {
        return [...document.querySelectorAll('[save]'), ...document.querySelectorAll('[data-save]')].map(this.getElementInfo);
    }

    // Save current page information to memory and localStorage
    async savePageInfo() {
        try {
            const title = document.title;
            const url = window.location.href;
            const dom = document.documentElement.outerHTML;
            const savedElements = this.getElementsToSave();

            this.setPreviousPageInfo(title, url, dom, savedElements);
            const data = {
                url: url,
                data: savedElements
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            this.execEvents('onSaveMemory', data);
            return true;
        } catch (error) {
            console.error('Error saving page info:', error);
            return false;
        }
    }

    shouldIgnoreAttribute(name) {
        return this.attributesToIgnore.includes(name) ||
               name.startsWith("data-") ||
               name.startsWith("aria-");
      }

    getElementChangeConfig = (element) => {
        const Info = {
            eventName: '',
            changeField: '',
            FieldValue: null
        }
        if (element instanceof HTMLInputElement) {
            if (element.type === 'checkbox' || element.type === 'radio') {
                Info.eventName = 'change';
                Info.changeField = 'checked';
                Info.FieldValue = element.checked;
            } else {
                Info.eventName = 'input';
                Info.changeField = 'value';
                Info.FieldValue = element.value;
            }
        } else if (element instanceof HTMLSelectElement) {
            Info.eventName = 'change';
            Info.changeField = 'selectedIndex';
            Info.FieldValue = element.selectedIndex;
        } else if (element instanceof HTMLDetailsElement) {
            Info.eventName = 'toggle';
            Info.changeField = 'open';
            Info.FieldValue = element.open;
        } else if (element instanceof HTMLTextAreaElement) {
            Info.eventName = 'input';
            Info.changeField = 'value';
            Info.FieldValue = element.value;
        } else if (element instanceof HTMLOptionElement) {
            Info.eventName = 'change';
            Info.changeField = 'selected';
            Info.FieldValue = element.selected;
        } else if (element instanceof HTMLButtonElement) {
            Info.eventName = 'click';
            // Info.changeField = 'innerHTML';
            // Info.FieldValue = element.innerHTML;
        } else if (element instanceof HTMLAnchorElement) {
            Info.eventName = 'click';
            // Info.changeField = 'innerHTML';
            // Info.FieldValue = element.innerHTML;
        } else if (element instanceof HTMLFormElement) {
            Info.eventName = 'submit';
            // Info.changeField = 'innerHTML';
            // Info.FieldValue = element.innerHTML;
        } else {
            Info.eventName = 'input';
            // Info.changeField = 'innerHTML';
            // Info.FieldValue = element.innerHTML;
        } 
        return Info;
    }

    // Restore saved page state from localStorage
    restorePageInfo() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (!savedData) {
                this.execEvents('onMemoryIsEmpty');
                return false;
            };

            const parsedData = JSON.parse(savedData);

            // Only restore if we're on the same page
            if (parsedData.url === window.location.href) {
                this.restoreElements(parsedData.data);
                this.execEvents('onRestoreSucess', parsedData);
                return true;
            }
            this.execEvents('onRestoreError', parsedData);
            return false;
        } catch (error) {
            console.error('Error restoring page info:', error);
            return false;
        }
    }

    // Restore individual elements to their saved state
    restoreElements(savedElements) {
        savedElements.forEach(savedElement => {
            try {
                let element = document.querySelector(savedElement.identifier);
                if (!element || !element.hasAttribute('save')) return;
                if (element) {
                    let changed = false;
                    // Restore attributes
                    savedElement.attributes.forEach(attr => {
                        let currentValue = element.getAttribute(attr.name);
                        if (currentValue !== attr.value) {
                            changed = true;
                            element.setAttribute(attr.name, attr.value);
                        }
                    });

                    const Config = this.getElementChangeConfig(element)
                    if (Config.changeField && savedElement[Config.changeField] !== element[Config.changeField]) {
                        changed = true;
                        element[Config.changeField] = savedElement[Config.changeField];
                    }

                    this.invokeElementTrigger(element, Config.eventName);

                    if (element.hasAttribute('customTrigger')) {
                        const trigger = element.getAttribute('customTrigger');
                        if (window[trigger]) {
                            window[trigger](element);
                        }
                    }
                }
            } catch (error) {
                console.error('Error restoring element:', savedElement, error);
            }
        });
    }

    getElementIdentifier = JCGWeb.Functions.getUniqueSelector; // Get unique selector for the element

    findStoredElementInfo = (identifier) => {
        const savedElements = this.getPreviousPageInfo().SavedElements;
        if (!savedElements) return null;

        for (const elementInfo of savedElements) {
            if (elementInfo.identifier === identifier) {
                return elementInfo;
            }
        }
        return null;
    }

    addEventListener = (element, eventName, callback) => {
        if (element && element.addEventListener) {
            element.addEventListener(eventName, callback);
        }
    }

    addSaveTrigger = (element, eventName) => {
        if (element && element.setAttribute) {
            element.setAttribute('added-trigger', 'true');
            this.addEventListener(element, eventName, () => {
                this.savePageInfo();
            });
        }
    }

    removeSaveTrigger(element) {
        if (element && element.removeAttribute) {
            element.removeAttribute('added-trigger');
        }
    }

    // Get detailed information about an element
    getElementInfo = element => {
        const info = {
            tagName: element.tagName,
            id: element.id,
            classList: Array.from(element.classList),
            identifier: this.getElementIdentifier(element),
            attributes: Array.from(element.attributes).map(attr => ({
                name: attr.name,
                value: attr.value
            })).filter(attr => !this.shouldIgnoreAttribute(attr.name))
        };

        const Config = this.getElementChangeConfig(element);
        if (Config.changeField)
            info[Config.changeField] = Config.FieldValue;

        // let's see if the memory trigger has been set
        if (!element.getAttribute('added-trigger')) {
            this.addSaveTrigger(element, Config.eventName);
            info.observer = new Observer(element);
            info.observer.Listeners = this.Listeners;
            this.observers.push(info.observer);
            info.observer.AddCallBack(this.savePageInfo);
            info.observer.Start();
        }

        return info;
    };

    invokeElementTrigger = (element, eventName) => {
        if (element && element.dispatchEvent) {
            const event = new Event(eventName, { bubbles: true, cancelable: true });
            element.dispatchEvent(event);
        }
    }

    // Handle window events
    handleWindowEvent(event) {
        // Always save on beforeunload
        if (event.type === 'beforeunload') {
            this.savePageInfo(true);
        }
        // For other events, use debounced save
        else {
            this.savePageInfo();
        }
    }

    // Start auto-save interval
    startAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        this.autoSaveInterval = setInterval(() => {
            this.savePageInfo();
        }, this.autoSaveDelay);
    }

    // Stop auto-save interval
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    // Set auto-save delay (in milliseconds)
    setAutoSaveDelay(delay) {
        this.autoSaveDelay = delay;
        if (this.autoSaveInterval) {
            this.startAutoSave(); // Restart with new delay
        }
    }

    // Debounce helper function
    _debounce(func, wait, immediate) {
        let timeout;
        return function () {
            const context = this;
            const args = arguments;
            const callNow = immediate && !timeout;
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        }
    }

    async reset() {
        this.observers.forEach(observer => observer.Destroy());
        this.observers = [];
        this.cleanMemory();
    }

    // Clean up event listeners and intervals
    destroy() {
        this.reset().then(() => {
            Object.keys(this).forEach(key => {
                try {
                    this[key] = undefined
                } catch (error) {
                    console.error(error)
                }
                finally {
                    try {
                        delete this[key]
                    } catch (error) {
                        console.error(error)
                    }
                }
            })
            delete this
        })
    }
}

if (typeof JCGWEB != 'undefined') {
    JCGWeb.pageMemory = new pageMemory();
}
