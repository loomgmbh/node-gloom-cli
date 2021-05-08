const Path = require('path');

const Command = require('../Interface/Command');

module.exports = class Task extends Command {

  describe() {
    this.logger.log('  gloom task <category:string> <component:string>');
    this.logger.log('    - create a component in components directory');
  }

  execute() {
    if (this.required('category', 'component')) return;

    const VARS = {
      THEME: Path.basename(process.cwd()),
      CATEGORY: this.args[1],
      COMPONENT: this.args[2],
    };

    this.fs.mkdirs('src', 'components', VARS.CATEGORY, VARS.COMPONENT);
    this.fs.copy(Path.join(__dirname, '../../template/_component.twig'), Path.join(process.cwd(), 'src/components', VARS.CATEGORY, VARS.COMPONENT, VARS.COMPONENT + '.twig'), VARS);
    this.fs.copy(Path.join(__dirname, '../../template/_component.sass'), Path.join(process.cwd(), 'src/components', VARS.CATEGORY, VARS.COMPONENT, VARS.COMPONENT + '.sass'), VARS);
  }

}