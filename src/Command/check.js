const Path = require('path');

const Command = require('../Interface/Command');

module.exports = class Check extends Command {

  describe() {
    this.logger.log('  gloom check');
    this.logger.log('    - validate gloom.json');
  }

  execute() {
    this.logger.log('Check install gloom theme ...');
    const path = this.fs.findRoot(Path.join(process.cwd(), 'gloom.json'), 'gloom.json');

    if (path === null) {
      this.logger.abort('No gloom.json found, install gloom theme with <command>.', {'<command>': 'gloom init'});
      return;
    }

    this.logger.log('Check if <gloom> is locally installed ...', {'<gloom>': 'gloom'});
    const loader = this.loader([path]);
    try {
      loader.load('gloom');
    } catch (e) {
      this.logger.abort('Package <gloom> is not install or has an error.', {'<gloom>': 'gloom'});
      return;
    }

    this.logger.log('Check schema of <path> ...', {'<path>': path});
    const gloom = require(path);
    if (!this.fs.checkSchema(gloom, 'gloom')) {
      this.logger.abort('gloom.json config is not valid.');
      return;
    }

    let error = false;
    const schemas = {};
    if (Array.isArray(gloom.loadModules)) {
      for (const mod of gloom.loadModules) {
        const info = loader.load(mod);
        if (info.schema) {
          const root = loader.root(mod);
          this.logger.log('Check schema from <from> ...', {'<from>': mod + '/' + info.schema});
          for (const file of this.fs.files(Path.join(root, info.schema))) {
            const value = file.substring(0, file.length - 12);

            if (schemas[value] !== undefined) {
              this.logger.log('Override schema <value> from <mod> package...', {'<value>': value, '<mod>': schemas[value].mod});
            }
            schemas[value] = {
              value,
              root, 
              file, 
              info,
              mod,
            };
          }
        }
      }
    }
    
    for (const index in schemas) {
      const entry = schemas[index];
      this.logger.log('Check schema <index> defined in <file> from <mod> ...', {'<index>': index, '<file>': entry.file, '<mod>': entry.mod});
      const schema = loader.load(Path.join(entry.root, entry.info.schema, entry.file));
      
      this.fs.checkSchema(gloom[index], schema, (result) => {
        error = true;
        for (const error of result.errors) {
          this.logger.errorLite('<point> ' + error.message, {'<point>': index + '.' + error.path.join('.')});
        }
      });
    }

    if (error) {
      this.logger.error('gloom.json config is not valid.');
    } else {
      this.logger.success('gloom.json config is valid.');
    }
  }

}