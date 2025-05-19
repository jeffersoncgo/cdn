class PID {
  constructor(id) {
    this._id = id || 0;
  }
  get id() {
    return this._id++;
  }

  set id(value) {
    this._id = value;
  }
}

if (typeof JCGWeb != 'undefined')
  JCGWeb.PID = new PID();