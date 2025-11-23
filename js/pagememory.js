if (typeof module != 'undefined') {
  Observer = require("./observer");
  Controller = require("./controller");
}

/**
 * Helper class to manage IndexedDB operations for pageMemory
 */
class PageMemoryDB {
    constructor(dbName = 'pageMemoryDB', storeName = 'pageData', version = 1) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.version = version;
        this.db = null;
    }

    /**
     * Initialize the IndexedDB connection
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, { keyPath: 'url' });
                    objectStore.createIndex('url', 'url', { unique: true });
                    objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    /**
     * Save data to IndexedDB
     */
    async save(url, data) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            
            const record = {
                url: url,
                data: data,
                timestamp: Date.now()
            };

            const request = objectStore.put(record);

            request.onsuccess = () => resolve(true);
            request.onerror = () => {
                console.error('Error saving to IndexedDB:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get data from IndexedDB by URL
     */
    async get(url) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.get(url);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => {
                console.error('Error reading from IndexedDB:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Delete data from IndexedDB by URL
     */
    async delete(url) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.delete(url);

            request.onsuccess = () => resolve(true);
            request.onerror = () => {
                console.error('Error deleting from IndexedDB:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Clear all data from IndexedDB
     */
    async clear() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.clear();

            request.onsuccess = () => resolve(true);
            request.onerror = () => {
                console.error('Error clearing IndexedDB:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get all stored URLs
     */
    async getAllKeys() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.getAllKeys();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => {
                console.error('Error getting keys from IndexedDB:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Close the database connection
     */
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
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
            // 'unload', //Removed because of browser security errors
            'DOMContentLoaded',
            'readystatechange',
            'onresize',
            'oncopy',
            'oncut',
            'onpaste'
        ];

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

        // Initialize IndexedDB
        this.db = new PageMemoryDB('pageMemoryDB', 'pageData', 1);
        this.dbInitialized = false;

        // Initialize storage key and auto-save interval
        this.storageKey = 'pageMemoryData';
        this.autoSaveInterval = null;
        this.autoSaveDelay = 5000; // 5 seconds

        this.events = {
            onSaveMemory: [],
            onRestoreSucess: [],
            onRestoreError: [],
            onMemoryIsEmpty: [],
        };

        // Wrap methods with Controller for debouncing and preventing concurrent runs
        this.savePageInfo = Controller.wrap(this._savePageInfo.bind(this), {
            abortBeforeRun: true,
            delayMs: 300, // 300ms debounce for save operations
            intervalBetweenRunsMs: 100 // Minimum 100ms between saves
        });

        this.restorePageInfo = Controller.wrap(this._restorePageInfo.bind(this), {
            abortBeforeRun: true,
            delayMs: 100 // 100ms debounce for restore operations
        });

        this.addEvent = JCGWeb.Functions.addEvent;
        this.deleteEvent = JCGWeb.Functions.deleteEvent;
        this.clearEvents = JCGWeb.Functions.clearEvents;
        this.execEvents = JCGWeb.Functions.execEvents;

        this.observers = [];
    }

    async init() {
        console.log('pageMemory initialized');
        
        // Initialize IndexedDB
        try {
            await this.db.init();
            this.dbInitialized = true;
        } catch (error) {
            console.error('Failed to initialize IndexedDB:', error);
            this.dbInitialized = false;
        }
        
        this.setOriginalPageInfo();
        // this.startAutoSave();
        await this.restorePageInfo();
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

    async clearSavedMemory() {
        if (!this.dbInitialized) return;
        
        try {
            const currentUrl = window.location.href;
            await this.db.delete(currentUrl);
        } catch (error) {
            console.error('Error clearing saved memory:', error);
        }
    }

    async cleanMemory() {
        this.stopAutoSave();
        this.clearPreviousPageInfo();
        this.clearOriginalPageInfo();
        await this.clearSavedMemory();
    }

    // Get elements marked with 'save' attribute
    getElementsToSave() {
        return [...document.querySelectorAll('[save]'), ...document.querySelectorAll('[data-save]')].map(this.getElementInfo);
    }

    // Internal save method (wrapped by Controller)
    async _savePageInfo(signal) {
        // Check if operation was aborted
        if (signal?.aborted) {
            throw new DOMException('Save operation aborted', 'AbortError');
        }

        if (!this.dbInitialized) {
            console.warn('IndexedDB not initialized, cannot save');
            return false;
        }

        try {
            const title = document.title;
            const url = window.location.href;
            const dom = document.documentElement.outerHTML;
            const savedElements = this.getElementsToSave();

            this.setPreviousPageInfo(title, url, dom, savedElements);
            
            const data = {
                title,
                dom,
                savedElements
            };

            // Check abort signal before saving
            if (signal?.aborted) {
                throw new DOMException('Save operation aborted', 'AbortError');
            }

            await this.db.save(url, data);
            this.execEvents('onSaveMemory', { url, data });
            return true;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw error; // Re-throw abort errors
            }
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

    // Internal restore method (wrapped by Controller)
    async _restorePageInfo(signal) {
        // Check if operation was aborted
        if (signal?.aborted) {
            throw new DOMException('Restore operation aborted', 'AbortError');
        }

        if (!this.dbInitialized) {
            console.warn('IndexedDB not initialized, cannot restore');
            this.execEvents('onMemoryIsEmpty');
            return false;
        }

        try {
            const currentUrl = window.location.href;
            
            // Check abort signal before reading
            if (signal?.aborted) {
                throw new DOMException('Restore operation aborted', 'AbortError');
            }

            const savedRecord = await this.db.get(currentUrl);
            
            if (!savedRecord || !savedRecord.data) {
                this.execEvents('onMemoryIsEmpty');
                return false;
            }

            // Check abort signal before restoring
            if (signal?.aborted) {
                throw new DOMException('Restore operation aborted', 'AbortError');
            }

            // Restore the elements
            this.restoreElements(savedRecord.data.savedElements);
            this.execEvents('onRestoreSucess', savedRecord);
            return true;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw error; // Re-throw abort errors
            }
            console.error('Error restoring page info:', error);
            this.execEvents('onRestoreError', error);
            return false;
        }
    }

    // Restore individual elements to their saved state
    restoreElements(savedElements) {
        if (!savedElements || !Array.isArray(savedElements)) {
            console.warn('Invalid savedElements provided to restoreElements');
            return;
        }

        savedElements.forEach(savedElement => {
            try {
                const element = document.querySelector(savedElement.identifier);
                if (!element) return;
                
                // Check if element still has save attribute (or data-save)
                if (!element.hasAttribute('save') && !element.hasAttribute('data-save')) return;

                let changed = false;

                // Restore attributes
                if (savedElement.attributes && Array.isArray(savedElement.attributes)) {
                    savedElement.attributes.forEach(attr => {
                        const currentValue = element.getAttribute(attr.name);
                        if (currentValue !== attr.value) {
                            changed = true;
                            element.setAttribute(attr.name, attr.value);
                        }
                    });
                }

                // Restore element-specific properties (value, checked, selectedIndex, etc.)
                const Config = this.getElementChangeConfig(element);
                if (Config.changeField && savedElement[Config.changeField] !== undefined) {
                    if (element[Config.changeField] !== savedElement[Config.changeField]) {
                        changed = true;
                        element[Config.changeField] = savedElement[Config.changeField];
                    }
                }

                // Trigger events if element changed
                if (changed && Config.eventName) {
                    this.invokeElementTrigger(element, Config.eventName);
                }

                // Execute custom trigger if defined
                if (element.hasAttribute('customTrigger')) {
                    const trigger = element.getAttribute('customTrigger');
                    if (typeof window[trigger] === 'function') {
                        window[trigger](element);
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
        // Destroy all observers
        this.observers.forEach(observer => {
            if (observer && typeof observer.Destroy === 'function') {
                observer.Destroy();
            }
        });
        this.observers = [];
        
        // Clean memory
        await this.cleanMemory();
    }

    // Clean up event listeners and intervals
    async destroy() {
        await this.reset();
        
        // Abort any running Controller operations
        if (this.savePageInfo.Controller) {
            this.savePageInfo.Controller.abort();
        }
        if (this.restorePageInfo.Controller) {
            this.restorePageInfo.Controller.abort();
        }

        // Close IndexedDB connection
        if (this.db) {
            this.db.close();
        }

        // Clean up properties
        Object.keys(this).forEach(key => {
            try {
                this[key] = undefined;
            } catch (error) {
                console.error('Error clearing property:', key, error);
            } finally {
                try {
                    delete this[key];
                } catch (error) {
                    console.error('Error deleting property:', key, error);
                }
            }
        });
    }
}

if (typeof JCGWeb != 'undefined') {
    JCGWeb.pageMemory = new pageMemory();
}