const Path = require('path');
const FS = require('fs');

const Command = require('../Interface/Command');

module.exports = class Drupal {

  /**
   * @param {Command} Command
   */
  constructor(command) {
    this._command = command;
    this._logger = this.command.logger;

    this._root = null;
  }

  /**
   * @returns {Command}
   */
  get command() {
    return this._command;
  }

  root() {
    if (this._root === null) {
      this._root = Path.dirname(this.command.fs.findRoot(process.cwd(), '.ddev'));
      if (!this._root || !FS.existsSync(Path.join(this._root, 'composer.json')) || !FS.existsSync(Path.join(this._root, 'config'))) {
        this._root = null;
      }
    }
    return this._root;
  }

  theme(theme = null) {
    const root = this.root();

    if (root && theme) {
      return Path.join(root, 'web/themes', theme);
    } else {
      return Path.join(root, 'web/themes');
    }
  }

  findActiveTheme() {
    const theme = this.theme();
  
    for (const file of FS.readdirSync(theme)) {
      const path = Path.join(theme, file);

      if (FS.statSync(path).isDirectory() && FS.existsSync(Path.join(path, 'gloom.json'))) {
        return path;
      }
    }
    return  null;
  }
  
}