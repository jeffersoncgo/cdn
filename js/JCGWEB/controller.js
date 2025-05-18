class Controller {
  constructor(func, ondone, onerror, onabort, AbortPreviousOnExecute = false) {
    this.func = func;
    this.ondone = ondone;
    this.onabort = onabort;
    this.onerror = onerror;
    this.running = false;
    this.controller = null;
    this.timeout = null;
    this.AbortPreviousOnExecute = AbortPreviousOnExecute;
  }

  static bind(func, ondone, onerror, onabort, AbortPreviousOnExecute = false) {
    func = func.bind(this);
    func = new Controller(func.bind(this), ondone, onerror, onabort, AbortPreviousOnExecute)
    func = func.exec.bind(func);
    return func;
  }

  async exec(...params) {
    if (this.running && !this.AbortPreviousOnExecute) return;
    if(this.running)
      this.abort(...params);
    this.controller = new AbortController();
    const signal = this.controller.signal;
    try {
      this.running = true;
      const result = await this.func(...params, signal);
      if (this.ondone) this.ondone(result, ...params)
      return result;
    } catch (error) {
      if (error.name !== 'AbortError') {
        if (this.onerror) this.onerror(error);
        throw error;
      }
    } finally { this.running = false }
  }

  abort(...params) {
    if (this.controller && !this.controller.signal.aborted) {
      this.controller.abort();
    }
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = null;
    this.controller = null;
    if (this.onabort) this.onabort(...params)
  }
}

if (typeof module != 'undefined') module.exports = Controller;