if (typeof module != 'undefined') {
  Observer = require("./observer");
  Controller = require("./controller");
}

/**
 * Helper class to manage IndexedDB operations for pageMemory
 */
class PageMemoryDB {
    constructor(dbName = 'pageMemoryDB', storeName = 'pageData', version = 1, onSucess = null, onError = null) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.version = version;
        this.db = null;
        this.onSucess = onSucess;
        this.onError = onError;
    }

    /**
     * Initialize the IndexedDB connection
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                if (this.onError) this.onError(request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                
                // Verify that the object store exists
                if (!this.db.objectStoreNames.contains(this.storeName)) {
                    console.warn(`Object store '${this.storeName}' not found. Recreating database...`);
                    this.db.close();
                    
                    // Delete and recreate the database
                    const deleteRequest = indexedDB.deleteDatabase(this.dbName);
                    deleteRequest.onsuccess = () => {
                        console.log('Database deleted, reopening...');
                        // Reopen with upgrade
                        this.init().then(resolve).catch(reject);
                    };
                    deleteRequest.onerror = () => {
                        console.error('Failed to delete database:', deleteRequest.error);
                        if (this.onError) this.onError(deleteRequest.error);
                        reject(deleteRequest.error);
                    };
                } else {
                    console.log('IndexedDB initialized successfully');
                    if (this.onSucess) this.onSucess(this.db);
                    resolve(this.db);
                }
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, { keyPath: 'url' });
                    objectStore.createIndex('url', 'url', { unique: true });
                    objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                    console.log(`Object store '${this.storeName}' created successfully`);
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

        // Reduced event list to avoid duplicates and improve performance
        // input covers most text changes, change covers selects/checkboxes
        // click covers buttons/links, submit covers forms
        this.Listeners = [
            'input',    // Covers text input, contenteditable changes
            'change',   // Covers select, checkbox, radio changes
            'click',    // Covers button clicks, link clicks
            'submit',   // Covers form submissions
            'toggle'    // Covers details element toggles
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

        // Initialize storage key and auto-save interval
        this.storageKey = 'pageMemoryData';
        this.autoSaveInterval = null;
        this.autoSaveDelay = 5000; // 5 seconds

        this.events = {
            onSaveMemory: [],
            onRestoreSucess: [],
            onRestoreError: [],
            onMemoryIsEmpty: [],
            onDBSuccess: [],
            onDBError: []
        };

        // Performance monitoring
        this.debug = false; // Set to true to see save/restore logs
        this.saveCount = 0;
        this.lastSaveTime = null;
        this.saveAttempts = 0; // Tracks attempted saves (including debounced/throttled)

        // Wrap methods with Controller for debouncing and preventing concurrent runs
        // Increased delays to prevent browser freezing
        this.savePageInfo = Controller.wrap(this._savePageInfo.bind(this), true, 100, 2000);
        this.restorePageInfo = Controller.wrap(this._restorePageInfo.bind(this), true, 100);

        this.addEvent = JCGWeb.Functions.addEvent;
        this.deleteEvent = JCGWeb.Functions.deleteEvent;
        this.clearEvents = JCGWeb.Functions.clearEvents;
        this.execEvents = JCGWeb.Functions.execEvents;

        this.observers = [];

        this.blobCache = new Map();          // blobUrl -> { base64, signature }
        this.blobSignatureCache = new Map(); // signature -> base64 (when blobUrl rotates)

        // Uses addEvent to add a onDBSuccess that sets the dbInitialized flag
        this.addEvent('onDBSuccess', () => { this.dbInitialized = true });
        this.addEvent('onDBSuccess', () => { this._init(); });


        this.addEvent('onDBError', (error) => {
            console.error('pageMemory IndexedDB initialization error:', error);
            this.dbInitialized = false;
        });

    }

    async init() {
        // Initialize IndexedDB, we will execute the success/error callbacks there using the execEvents method
        this.db = new PageMemoryDB('pageMemoryDB', 'pageData', 1, () => {
            this.execEvents('onDBSuccess');
        }, (error) => {
            this.execEvents('onDBError', error);
        });
        try {
            await this.db.init();
            this.dbInitialized = true;
        } catch (error) {
            console.error('Failed to initialize IndexedDB:', error);
            this.dbInitialized = false;
        }
    }
    

    async _init() {
        console.log('pageMemory initialized');
        
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

    /**
     * Convert Blob URL to actual Blob data for storage
     * @param {string} blobUrl - The blob: URL to convert
     * @returns {Promise<Blob|null>}
     */
    async blobUrlToBlob(blobUrl) {
        if (!blobUrl || !blobUrl.startsWith('blob:')) {
            return null;
        }
        
        try {
            const response = await fetch(blobUrl);
            if (!response.ok) return null;
            return await response.blob();
        } catch (error) {
            console.warn('Failed to convert Blob URL to Blob:', error);
            return null;
        }
    }

    /**
     * Convert Blob to Base64 for IndexedDB storage
     * @param {Blob} blob - The blob to convert
     * @returns {Promise<string>}
     */
    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Convert Base64 to Blob
     * @param {string} base64 - The base64 data URL
     * @returns {Blob}
     */
    base64ToBlob(base64) {
        const parts = base64.split(',');
        const contentType = parts[0].match(/:(.*?);/)[1];
        const raw = atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        
        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        
        return new Blob([uInt8Array], { type: contentType });
    }

    // Internal save method (wrapped by Controller)
    async _savePageInfo(signal) {
        this.saveAttempts++;
        
        // Check if operation was aborted
        if (signal?.aborted) {
            if (this.debug) console.log('[PageMemory] Save aborted by Controller');
            throw new DOMException('Save operation aborted', 'AbortError');
        }

        if (!this.dbInitialized) {
            console.warn('IndexedDB not initialized, cannot save');
            return false;
        }

        try {
            const startTime = performance.now();
            this.saveCount++;
            
            if (this.debug) {
                const timeSinceLastSave = this.lastSaveTime ? Date.now() - this.lastSaveTime : 'N/A';
                console.log(`[PageMemory] Save #${this.saveCount} starting (attempts: ${this.saveAttempts}, time since last: ${timeSinceLastSave}ms)`);
            }

            const title = document.title;
            const url = window.location.href;
            const dom = document.documentElement.outerHTML;
            const savedElements = this.getElementsToSave();



            // Process Blob URLs and convert to Base64 for persistence
            for (const elementInfo of savedElements) {
                if (elementInfo.hasBlobUrl && elementInfo.blobUrl) {
                    try {
                        // 1) Try exact blob URL hit
                        const cachedByUrl = this.blobCache.get(elementInfo.blobUrl);
                        if (cachedByUrl) {
                            elementInfo.blobData = cachedByUrl.base64;
                            elementInfo.blobSignature = cachedByUrl.signature;
                        } else {
                            const blob = await this.blobUrlToBlob(elementInfo.blobUrl);
                            if (blob) {
                                const signature = `${blob.type}-${blob.size}`;
                                // 2) If the URL changed but the payload (size/type) is the same, reuse the base64
                                const cachedBySig = this.blobSignatureCache.get(signature);
                                const base64 = cachedBySig || await this.blobToBase64(blob);

                                elementInfo.blobData = base64;
                                elementInfo.blobSignature = signature;

                                this.blobCache.set(elementInfo.blobUrl, { base64, signature });
                                this.blobSignatureCache.set(signature, base64);
                            }
                        }
                    } catch (error) {
                        console.warn('Failed to process Blob URL:', error);
                    }
                    // Keep temporary fields out of the stored payload
                    delete elementInfo.hasBlobUrl;
                    delete elementInfo.blobUrl;
                }
            }

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
            
            this.lastSaveTime = Date.now();
            const duration = performance.now() - startTime;
            
            if (this.debug) {
                console.log(`[PageMemory] Save completed in ${duration.toFixed(2)}ms (${savedElements.length} elements)`);
            }
            
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

                // Special handling for images with stored Blob data
                if (element instanceof HTMLImageElement && savedElement.blobData) {
                    try {
                        const blob = this.base64ToBlob(savedElement.blobData);
                        const newBlobUrl = URL.createObjectURL(blob);
                        element.src = newBlobUrl;
                        changed = true;
                        
                        if (this.debug) {
                            console.log(`[PageMemory] Restored Blob URL for image: ${savedElement.identifier}`);
                        }
                    } catch (error) {
                        console.warn('Failed to restore Blob URL:', error);
                    }
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

        // Special handling for images with Blob URLs
        // Mark them for async processing during save
        if (element instanceof HTMLImageElement && element.src && element.src.startsWith('blob:')) {
            info.hasBlobUrl = true;
            info.blobUrl = element.src;
        }

        // Set up observer for this element if not already done
        // NOTE: Observer is NOT saved to IndexedDB (causes DataCloneError)
        // Observers are recreated on page load
        if (!element.getAttribute('added-trigger')) {
            this.addSaveTrigger(element, Config.eventName);
            
            // Create observer but DON'T add it to info object
            const observer = new Observer(element);
            observer.Listeners = this.Listeners;
            this.observers.push(observer);
            observer.AddCallBack(this.savePageInfo);
            observer.Start();
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

    // Get performance statistics
    getStats() {
        const avgTimeBetweenSaves = this.saveCount > 1 && this.lastSaveTime ? 
            (Date.now() - (this.lastSaveTime - (this.saveCount - 1) * 2000)) / this.saveCount : 0;
        
        return {
            saveCount: this.saveCount,
            saveAttempts: this.saveAttempts,
            abortedSaves: this.saveAttempts - this.saveCount,
            lastSaveTime: this.lastSaveTime,
            observersCount: this.observers.length,
            autoSaveEnabled: !!this.autoSaveInterval,
            avgTimeBetweenSaves: avgTimeBetweenSaves.toFixed(0) + 'ms'
        };
    }

    // Enable/disable debug logging
    setDebug(enabled) {
        this.debug = enabled;
        if (enabled) {
            console.log('[PageMemory] Debug enabled. Current stats:', this.getStats());
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
        
        // Reset counters
        this.saveCount = 0;
        this.saveAttempts = 0;
        this.lastSaveTime = null;
        
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
        this.blobCache.clear()
        this.blobSignatureCache.clear();
    }
}

if (typeof JCGWeb != 'undefined') {
    JCGWeb.pageMemory = new pageMemory();
}