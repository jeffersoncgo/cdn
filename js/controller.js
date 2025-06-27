class Controller {
  constructor(func, AbortBeforeRun = true, startDelayMs = 0) {
    this.func = func;
    this.events = {
      onDone: [],
      onAbort: [],
      onError: []
    };
    this.startDelayMs = startDelayMs;
    this.AbortBeforeRun = AbortBeforeRun;
    this.running = false;
    this.controller = null;
    this.timeout = null;

    this._resolve = null;
    this._reject = null;

    this.addEvent = JCGWeb.Functions.addEvent;
    this.deleteEvent = JCGWeb.Functions.deleteEvent;
    this.clearEvents = JCGWeb.Functions.clearEvents;
    this.execEvents = JCGWeb.Functions.execEvents;
  }

  exec(...params) {
    if (this.running && !this.AbortBeforeRun) return Promise.resolve();

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.abort(...params);
    }

    return new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;

      this.timeout = setTimeout(async () => {
        this.controller = new AbortController();
        const signal = this.controller.signal;
        this.running = true;

        try {
          const result = await this.func(...params, signal);
          this.execEvents('onDone', result, ...params);
          this._resolve?.(result);
        } catch (error) {
          if (error.name === 'AbortError') {} else {
            this.execEvents('onError', error);
            this._reject?.(error);
          }
        } finally {
          this.running = false;
          this.timeout = null;
          this.controller = null;
          this._resolve = null;
          this._reject = null;
        }
      }, this.startDelayMs);
    });
  }

  abort(...params) {
    if (this.controller && !this.controller.signal.aborted) {
      this.controller.abort();
    }

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    this.running = false;
    this.execEvents('onAbort', ...params);

    this._resolve = null;
    this._reject = null;
    this.controller = null;
  }
}

if (typeof module !== 'undefined') module.exports = Controller;

// Example of usage
// const searchItems = async (Name, library, query) => {
//   if (!query) {
//     query = {}
//     if (Name)
//       query.Name = Name.trim();
//     if (library)
//       query.Library = library.trim();
//   }

//   searchParams = { ...query };

//   if (!areLibrariesLoaded) {
//     const limit = 20;
//     for (let count = 0; count < limit; count++) {
//       await new Promise(resolve => setTimeout(resolve, 500));
//       if (areLibrariesLoaded)
//         break;
//     }
//   }

//   if (!areLibrariesLoaded) {
//     events.onSearchFinish([])
//     return [];
//   }

//   // Validate library exists
//   if (searchParams.Library && (!Libraries?.[searchParams.Library]?.Items)) {
//     events.onSearchFinish([])
//     return [];
//   }

//   let items = [];
//   if (searchParams.Library)
//     items = Libraries[searchParams.Library].Items
//   else
//     for (lName in Libraries)
//       items = items.concat(Libraries[lName].Items)
//   items = await searchInArray(items, searchParams.Name)

//   // Sort items
//   const sortKey = searchParams.sortBy;
//   if (sortKey === "Random") {
//     items = items.sort(() => 0.5 - Math.random());
//   } else {
//     items = items.sort((a, b) => {
//       if (searchParams.order === "desc") {
//         [a, b] = [b, a];
//       }
//       const valA = a?.[sortKey];
//       const valB = b?.[sortKey];

//       if (typeof valA === "string" && typeof valB === "string") {
//         return valA.localeCompare(valB);
//       }

//       if (typeof valA === "number" && typeof valB === "number") {
//         return valA - valB;
//       }

//       if (valA instanceof Date && valB instanceof Date) {
//         return valA.getTime() - valB.getTime();
//       }

//       return 0;
//     });
//   }

//   searchParams.hasPreviousPage = hasPreviousPage();
//   searchParams.hasNextPage = hasNextPage(items);

//   items = items.slice(searchParams.offset, searchParams.offset + searchParams.limit);

//   events.onSearchFinish(items)
//   return items;
// }
// const controller = new Controller(searchItems.bind(this));
// searchItems = controller;
// searchItems = searchItems.exec.bind(searchItems);
// searchItems.Controller = controller;
// searchItems('cat pictures')