const Path = require('path');

const Command = require('../Interface/Command');

module.exports = class Comp extends Command {

  describe() {
    this.logger.log('  gloom comp <category:string> <component:string> [js:boolean]');
    this.logger.log('    - create a component in components directory');
  }

  execute() {
    if (this.required('category', 'component')) return;

    const VARS = {
      THEME: Path.basename(process.cwd()),
      CATEGORY: this.args[1],
      COMPONENT: this.args[2],
      THEME_: Path.basename(process.cwd()).replace(new RegExp('[-]', 'g'), '_'),
      CATEGORY_: this.args[1].replace(new RegExp('[-]', 'g'), '_'),
      COMPONENT_: this.args[2].replace(new RegExp('[-]', 'g'), '_'),
    };

    this.fs.mkdirs('src', 'components', VARS.CATEGORY, VARS.COMPONENT);
    this.fs.copy(Path.join(__dirname, '../../template/_component.twig'), Path.join(process.cwd(), 'src/components', VARS.CATEGORY, VARS.COMPONENT, VARS.COMPONENT + '.twig'), VARS);
    this.fs.copy(Path.join(__dirname, '../../template/_component.sass'), Path.join(process.cwd(), 'src/components', VARS.CATEGORY, VARS.COMPONENT, VARS.COMPONENT + '.sass'), VARS);
    if (this.args[2] !== undefined && this.args[2] !== '0') {
      this.fs.copy(Path.join(__dirname, '../../template/_component.js'), Path.join(process.cwd(), 'src/components', VARS.CATEGORY, VARS.COMPONENT, VARS.COMPONENT + '.js'), VARS);
      this.fs.copy(Path.join(__dirname, '../../template/_component.yml'), Path.join(process.cwd(), 'src/components', VARS.CATEGORY, VARS.COMPONENT, VARS.COMPONENT + '.yml'), VARS);
    }
    this.logger.success('Created component ' + VARS.COMPONENT);
  }

}