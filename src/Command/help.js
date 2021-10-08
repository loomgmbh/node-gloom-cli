const Chalk = require('chalk');
const Command = require('../Interface/Command');

module.exports = class Help extends Command {

  describe() {
    return [
      'help',
      'show this help text',
    ];
  }

  execute() {
    this.logger.log('Commands:');
    this.logger.nl();
    for (const file of this.fs.filesRecursive(__dirname)) {
      try {
        /** @type {import('../Interface/Command')} */
        const command = (new (require('./' + file)));

        const description = command.describe();

        if (description) {
          let first = true;
          for (let line of description) {
            if (first) {
              line = 'gloom ' + Chalk.cyan(line);
              first = false;
            } else {
              line = '  ' + Chalk.magenta(line);
            }
            this.logger.log('  ' + line);
          }
        }

        const options = command.getOptions();
        if (options) {
          for (const option of options) {
            if (!option.usage) continue;
            this.logger.nl();
            let first = true;
            for (let line of option.usage) {
              if (first) {
                line = '--' + option.name + ' ' + Chalk.cyan(line);
                first = false;
              } else {
                line = '    ' + Chalk.magenta(line);
              }
              this.logger.log('    ' + line);
            }
          }
        }

        this.logger.nl();
      } catch (e) {
        console.log(e);
        this.logger.error('Error by describing "' + file + '"');
      }
    }
  }

}