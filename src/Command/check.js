const Command = require('../Interface/Command');

module.exports = class Check extends Command {

  describe() {
    this.logger.log('  gloom check');
    this.logger.log('    - validate gloom.json');
  }

  execute() {
    const VARS = {
      THEME: Path.basename(process.cwd()),
    };
    
  }

}