const Logger = require('../Util/Logger');
const FileSystem = require('../Util/FileSystem');
const Loader = require('../Util/Loader');
const Drupal = require('../Util/Drupal');
const Gloom = require('../Util/Gloom');

module.exports = class Command {

  constructor(args) {
    this.args = args;
    this.logger = new Logger();
    this.fs = new FileSystem(this.logger);
    this.drupal = new Drupal(this);
    this.gloom = new Gloom(this);
  }

  loader(paths) {
    return new Loader(paths);
  }

  required(...params) {
    if (this.args.length - 1 < params.length) {
      this.logger.abort('Please ensure the required parameter "' + params[this.args.length - 1] + '"');
      return true;
    }
    return false;
  }

  error(error) {
    this.logger.error(error);
  }

  describe() {}

  execute() {}

}