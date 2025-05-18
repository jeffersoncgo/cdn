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
  }

  addEvent(event = "onDone", callback) {
    this.events[event].push(callback);
  }

  deleteEvent(event = "onDone", callback) {
    const index = this.events[event].indexOf(callback);
    if (index !== -1) {
      this.events[event].splice(index, 1);
    }
  }

  clearEvents(event = "onDone") {
    this.events[event] = [];
  }

  execEvents(event, ...params) {
    this.events[event].forEach(callback => {
      try {
        callback(...params);
      } catch (error) {
        console.error(error);
      }
    });
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
