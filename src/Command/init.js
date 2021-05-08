const Path = require('path');

const Command = require('../Interface/Command');

module.exports = class Init extends Command {

  describe() {
    this.logger.log('  gloom init');
    this.logger.log('    - create package.json');
    this.logger.log('    - install gloom-plugin, gloom-tasks');
    this.logger.log('    - create default file tree for theme');
  }

  execute() {
    const VARS = {
      THEME: Path.basename(process.cwd()),
    };

    this.fs.copy(Path.join(__dirname, '../../template/gulpfile.js'), 'gulpfile.js');
    this.fs.copy(Path.join(__dirname, '../../template/gloom.json'), 'gloom.json');

    if (!this.fs.exists('package.json')) {
      this.fs.shell('npm', 'init');
    } else {
      this.logger.notice('Already installed npm');
    }

    const pack = require(Path.join(process.cwd(), 'package.json'));
    if (!pack.dependencies || !pack.dependencies['gloom-plugin'] || !pack.dependencies['gloom-tasks']) {
      if (!pack.dependencies || !pack.dependencies['gloom-plugin']) {
        this.fs.shell('npm', 'install', 'https://github.com/loomgmbh/node-gloom-plugin.git');
      } else {
        this.logger.notice('Already installed gloom-plugin');
      }
      if (!pack.dependencies || !pack.dependencies['gloom-tasks']) {
        this.fs.shell('npm', 'install', 'https://github.com/loomgmbh/node-gloom-tasks.git');
      } else {
        this.logger.notice('Already installed gloom-tasks');
      }
    } else {
      this.logger.notice('Already installed gloom packages');
    }

    this.fs.mkdirs(process.cwd(), 'src', 'assets');
    this.fs.mkdirs(process.cwd(), 'src', 'base');
    this.fs.mkdirs(process.cwd(), 'src', 'components', 'layout', 'sheet');
    this.fs.mkdirs(process.cwd(), 'src', 'variables');
    this.fs.mkdirs(process.cwd(), 'src', 'vendor');

    this.fs.copy(Path.join(__dirname, '../../template/sheet.twig'), 'src/components/layout/sheet/sheet.twig', VARS);
    this.fs.copy(Path.join(__dirname, '../../template/sheet.sass'), 'src/components/layout/sheet/sheet.sass', VARS);
    this.fs.copy(Path.join(__dirname, '../../template/vendor.yml'), 'src/vendor/vendor.yml', VARS);

    this.logger.success('Finished');
  }

}