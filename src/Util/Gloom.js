const Path = require('path');
const FS = require('fs');

module.exports = class Gloom {

  /**
   * @param {import('../Interface/Command')} command 
   */
  constructor(command) {
    this.command = command;
    this._logger = this.command.logger;

    this._config = null;
  }

  get config() {
    if (this._config === null) {
      this._config = require(Path.join(process.cwd(), '/gloom.json'));
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
        path = this.command.fs.path(path);
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
  
}