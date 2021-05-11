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
      this.logger.abort('No gloom.json found, install gloom theme with "gloom init".');
      return;
    }

    this.logger.log('Check if "gloom" is locally installed ...');
    const loader = this.loader([path]);
    try {
      loader.load('gloom');
    } catch (e) {
      this.logger.abort('Package "gloom" is not install or has an error.');
      return;
    }

    this.logger.log('Check schema of "' + path + '" ...');
    const gloom = require(path);
    if (!this.fs.checkSchema(gloom, 'gloom')) {
      this.logger.abort('gloom.json config is not valid.');
      return;
    }

    let error = false;
    if (gloom.loadModules && Array.isArray(gloom.loadModules)) {
      for (const mod of gloom.loadModules) {
        const info = loader.load(mod);
        const root = loader.root(mod);
        if (info.schema) {
          this.logger.log('Check schema from "' + mod + '/' + info.schema + '" ...');
          for (const file of this.fs.files(Path.join(root, info.schema))) {
            this.logger.log('Check schema "' + file + '" ...');
            const value = file.substring(0, file.length - 12);
            const schema = loader.load(Path.join(root, info.schema, file));
            
            this.fs.checkSchema(gloom[value], schema, (result) => {
              error = true;
              for (const error of result.errors) {
                this.logger.errorLite('"' + value + '.' + error.path.join('.') + '" ' + error.message);
              }
            });
          }
        }
      }
    }

    if (error) {
      this.logger.errorLite('gloom.json config is not valid.');
    } else {
      this.logger.successLite('gloom.json config is valid.');
    }
  }

}