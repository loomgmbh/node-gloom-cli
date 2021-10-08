const Path = require('path');
const FS = require('fs');

module.exports = class Drupal {

  /**
   * @param {import('../Interface/Command')} Command
   */
  constructor(command) {
    this.command = command;
    this.logger = this.command.logger;
  }

  theme(theme = null) {
    const root = this.root();

    if (root === null) return null;
    if (theme) {
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

  /**
   * @param {string} cwd
   * @returns {(string|null)}
   */
  root(cwd = null) {
    if (cwd === null) cwd = process.cwd();
    let root = this.command.fs.findRoot(cwd, '.ddev');
    if (root !== null) {
      root = Path.dirname(root);
      if (FS.existsSync(Path.join(root, 'composer.json')) && FS.existsSync(Path.join(root, 'config'))) {
        return root;
      }
    }
    this.logger.abort('No drupal root found, please use this only in drupal site.');
    return null;
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