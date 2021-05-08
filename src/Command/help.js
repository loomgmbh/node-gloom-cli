const Command = require('../Interface/Command');

module.exports = class Help extends Command {

  describe() {
    this.logger.log('  gloom help');
    this.logger.log('    - show this help text');
  }

  execute() {
    this.logger.log('Commands:');
    this.logger.nl();
    for (const file of this.fs.files(__dirname)) {
      try {
        (new (require('./' + file))).describe();
        this.logger.nl();
      } catch (e) {
        this.logger.error('Error by describing "' + file + '"');
      }
    }
  }

}