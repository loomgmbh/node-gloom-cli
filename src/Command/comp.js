const Path = require('path');

const Command = require('../Interface/Command');

module.exports = class Comp extends Command {

  describe() {
    this.logger.log('  gloom comp <category:string> <component:string> [js:boolean] [force:boolean]');
    this.logger.log('    - create a component in components directory');
  }

  execute() {
    if (this.required('category', 'component')) return;

    const root = this.fs.root();
    if (root === null) return;

    const VARS = {
      THEME: Path.basename(root),
      CATEGORY: this.args[1],
      COMPONENT: this.args[2],
      THEME_: Path.basename(root).replace(new RegExp('[-]', 'g'), '_'),
      CATEGORY_: this.args[1].replace(new RegExp('[-]', 'g'), '_'),
      COMPONENT_: this.args[2].replace(new RegExp('[-]', 'g'), '_'),
    };

    this.fs.copyFull(Path.join(__dirname, '../../template/comp' + (this.args[3] ? '_js' : '')), root, VARS, true, (from, to, isDir) => {
      this.logger.log('Create "' + to.substring(root.length + 1) + '" ...');
    });

    this.logger.success('Created component ' + VARS.COMPONENT);
  }

}