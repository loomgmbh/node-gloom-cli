const Path = require('path');

const FileSystem = require('./FileSystem');

module.exports = class Loader {

  constructor(paths) {
    this._paths = paths;
  }

  path(path) {
    return require.resolve(path, {
      paths: this._paths,
    });
  }

  load(path) {
    return require(this.path(path));
  }

  root(module) {
    return FileSystem.findFileRoot(this.path(module), module);
  }

}