const Logger = require('../Util/Logger');
const FileSystem = require('../Util/FileSystem');

module.exports = class Command {

  constructor(args) {
    this.args = args;
    this.logger = new Logger();
    this.fs = new FileSystem(this.logger);
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