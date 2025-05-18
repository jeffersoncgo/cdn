

class utils {
  constructor() {}
  // SCRIPT NEED COMMONS
  static get CurrentScriptUrl() {return document.currentScript.src}
  static get CurrentScriptName() {return this.CurrentScriptUrl.split('/').pop()}
  static CurrentUrlToFile(FileName) {return this.CurrentScriptUrl.replace(this.CurrentScriptName, FileName)}
  // URL 
  static get CurrentUrl() {return window.location.href}
  static get CurrentUrlPath() {return window.location.pathname}
  static get CurrentUrlParams() {return window.location.search}
  static get CurrentUrlHash() {return window.location.hash}
  static get CurrentUrlHost() {return window.location.host}
  static get CurrentUrlHostname() {return window.location.hostname}
  static get CurrentUrlPort() {return window.location.port}
  static get CurrentUrlProtocol() {return window.location.protocol}
  static get CurrentUrlOrigin() {return window.location.origin}
  // ADD FUNCTIONS AND OTHERS THINGS
  static AddScript(Url) {
    const script = document.createElement('script');
    script.src = Url;
    document.head.appendChild(script);
  }
  static AddStyle(Url) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = Url;
    document.head.appendChild(link);
  }
  static AddMeta(Name, Content) {
    const meta = document.createElement('meta');
    meta.name = Name;
    meta.content = Content;
    document.head.appendChild(meta);
  }
  static isClass = input => typeof input === 'function' && /^class\s/.test(Function.prototype.toString.call(input));
  static makeObjbyPath = (obj, path = '', value) => { //gonna use the . as a separator in the path
    obj ??= {};
    const keys = path.split('.');
    let current = obj;
    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        current[key] = value;
      } else {
        current = current[key] ??= {};
      }
    });
  }
  static safeWindowsFileName(filename) {
    if (typeof filename !== 'string') throw new TypeError('Input must be a string');

    // List of illegal characters in Windows filenames
    const illegalChars = /[<>:"/\\|?*\x00-\x1F]/g;

    // Reserved filenames in Windows (case-insensitive)
    const reservedNames = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;

    // Replace illegal characters with underscore
    let safeName = filename.replace(illegalChars, '_');

    // Trim trailing dots and spaces (not allowed in Windows)
    safeName = safeName.trim().replace(/[. ]+$/, '');

    // Replace reserved names with prefixed underscore
    if (reservedNames.test(safeName)) {
      safeName = '_' + safeName;
    }

    // Optionally normalize Unicode (NFKD for compatibility)
    safeName = safeName.normalize('NFKD');

    return safeName;
  }

}

if (typeof module != 'undefined') module.exports = utils
