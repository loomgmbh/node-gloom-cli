const Path = require('path');

const Command = require('../Interface/Command');

module.exports = class Init extends Command {

  describe() {
    return [
      'init [force:boolean]',
      '- create package.json',
      '- install gloom-tasks',
      '- create default file tree for theme',
    ];
  }

  execute() {
    const VARS = {
      THEME: Path.basename(process.cwd()),
      THEME_: Path.basename(process.cwd()).replace(new RegExp('[-]', 'g'), '_'),
      FORCED: this.args[1] !== undefined,
    };

    if (!this.fs.exists('package.json')) {
      this.fs.shell('npm', 'init');
    } else {
      this.logger.notice('Already installed npm package');
    }

    const pack = require(Path.join(process.cwd(), 'package.json'));
    if (!pack.dependencies || !pack.dependencies['gloom-tasks']) {
      if (!pack.dependencies || !pack.dependencies['gloom-tasks']) {
        this.fs.shell('npm', 'install', 'https://github.com/loomgmbh/node-gloom-tasks.git');
      } else {
        this.logger.notice('Already installed gloom-tasks locally');
      }
    } else {
      this.logger.notice('Already installed gloom packages');
    }

    if (!this.fs.exists(Path.join(process.cwd(), 'node_modules'))) {
      this.fs.shell('npm', 'install');
    }

    this.logger.log('Create directory tree' + (VARS.FORCED ? ' [FORCED]' : '') + ' ...')
    this.fs.copyFull(Path.join(__dirname, '../../template/init'), process.cwd(), VARS, VARS.FORCED, (from, to, isDir) => {
      this.logger.log('Create "' + to.substring(process.cwd().length + 1) + '" ...');
    });

    this.logger.success('Finished');
  }

}