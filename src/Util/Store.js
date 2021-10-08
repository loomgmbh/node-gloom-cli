const Path = require('path');
const FS = require('fs');
const Reflection = require('./Reflection');

module.exports = class Store {

  /**
   * @param {string} name 
   * @returns {Store}
   */
  static get(name) {
    this._store_register = this._store_register || {};
    if (this._store_register[name] === undefined) {
      this._store_register[name] = new Store(Path.join(__dirname, '../../store'), name);
    }
    return this._store_register[name];
  }

  constructor(dir, name) {
    this.dir = dir;
    this.name = name;
    this.path = Path.join(this.dir, this.name + '.json');
    this.data = null;
  }

  load() {
    if (this.data === null) {
      if (FS.existsSync(this.path)) {
        this.data = require(this.path);
      } else {
        this.data = {};
      }
    }
  }

  get(name, fallback = null) {
    this.load();
    return Reflection.getDeep(this.data, name, fallback);
  }

  set(name, value) {
    this.load();
    Reflection.setDeep(this.data, name, value);
    return this;
  }

}