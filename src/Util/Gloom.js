const Path = require('path');
const FS = require('fs');

module.exports = class Gloom {

  /**
   * @param {import('../Interface/Command')} command 
   */
  constructor(command) {
    this.command = command;
    this.logger = this.command.logger;

    this._config = null;
  }

  get config() {
    if (this._config === null) {
      this._config = require(Path.join(this.root(), '/gloom.json'));
    } 
    return this._config;
  }

  /**
   * @returns {(string|null)}
   */
  getCustomTasksPath() {
    if (this.config.custom && this.config.custom.tasks) {
      let path = this.config.custom.tasks;
      if (!Path.isAbsolute(path)) {
        path = Path.join(this.root(), path);
      }
      return path;
    }
    return null;
  }

  /**
   * @returns {(Object<string, string>|null)}
   */
  getCustomTasks() {
    const path = this.getCustomTasksPath();
    if (path === null) return null;
    
    if (!FS.existsSync(path)) return {};
    const tasks = {};
    for (const name of FS.readdirSync(path)) {
      const file = Path.join(path, name);

      tasks[Path.parse(file).name] = file;
    }
    return tasks;
  }

  /**
   * @param {string} cwd
   * @returns {(string|null)}
   */
  root(cwd = null) {
    if (cwd === null) cwd = process.cwd();
    const path = this.command.fs.findRoot(Path.join(cwd, 'gloom.json'), 'gloom.json');

    if (path === null) {
      if (this.command.options && this.command.options.theme) {
        const theme = this.command.drupal.theme(this.command.options.theme);

        if (theme === null) return null;

        if (FS.existsSync(Path.join(theme, 'gloom.json'))) {
          return theme;
        }
      }
      this.logger.abort('No gloom.json found, install gloom theme with "gloom init". Or use --theme "<theme>" in a drupal site.');
      return null;
    }
    return Path.dirname(path);
  }

  /**
   * @param  {...string} args 
   * @returns {(string|null)}
   */
  path(...args) {
    const root = this.root();
    if (root === null) return null;
    return Path.join(root, ...args);
  }

  /**
   * @param {string} path 
   * @returns {string}
   */
  rel(path) {
    if (Path.isAbsolute(path)) {
      const root = this.root();
      if (root === null) {
        return path;
      } else {
        return path.substring(root.length);
      }
    }
    return path;
  }
  
}