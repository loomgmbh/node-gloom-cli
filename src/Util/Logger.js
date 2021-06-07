const Chalk = require('chalk');

module.exports = class Logger {

  constructor() {
    this._silent = false;
  }

  nl() {
    console.log();
  }

  /**
   * @param {boolean} silent 
   * @returns {(boolean|this)}
   */
  silent(silent = null) {
    if (typeof silent === 'boolean') {
      this._silent = silent;
      return this;
    } else {
      return this._silent;
    }
  }

  success(message, placeholders = {}) {
    if (this._silent) return;
    this.nl();
    console.log(Chalk.green('-'.repeat(process.stdout.columns)));
    console.log(Chalk.green('[SUCCESS]: ' + this.replaceObject(message, placeholders, Chalk.magenta)));
    console.log(Chalk.green('-'.repeat(process.stdout.columns)));
  }

  successLite(message, placeholders = {}) {
    if (this._silent) return;
    console.log(Chalk.green('[SUCCESS]: ' + this.replaceObject(message, placeholders, Chalk.magenta)));
  }

  abort(message, placeholders = {}) {
    if (this._silent) return;
    this.nl();
    console.log(Chalk.red('-'.repeat(process.stdout.columns)));
    console.log(Chalk.red('[ABORT]: ' + this.replaceObject(message, placeholders, Chalk.magenta)));
    console.log(Chalk.red('-'.repeat(process.stdout.columns)));
  }

  log(message, placeholders = {}) {
    if (this._silent) return;
    console.log(Chalk.green(this.replaceObject(message, placeholders, Chalk.magenta)));
  }

  notice(message, placeholders = {}) {
    if (this._silent) return;
    console.log(Chalk.blue('[NOTICE] ' + this.replaceObject(message, placeholders, Chalk.magenta)));
  }

  /**
   * @param {(string|Error)} error 
   */
  error(error) {
    if (this._silent) return;
    this.nl();
    console.log(Chalk.red('-'.repeat(process.stdout.columns)));
    if (typeof error === 'string') {
      console.log(Chalk.red('[ERROR]: ' + error));
    } else {
      console.log(Chalk.red('[ERROR]: The command has an unmanaged error. Please inform the developer about the error -> https://github.com/loomgmbh/node-gloom-cli/issues/new'));
      console.log(error);
    }
    console.log(Chalk.red('-'.repeat(process.stdout.columns)));
  }

  errorLite(message, placeholders = {}) {
    if (this._silent) return;
    console.log(Chalk.red('[ERROR]: ' + this.replaceObject(message, placeholders, Chalk.magenta)));
  }

  fatal(error) {
    this.nl();
    console.log(Chalk.red('-'.repeat(process.stdout.columns)));
    console.log(Chalk.red('[FATAL ERROR]: Please inform the developer about the error -> https://github.com/loomgmbh/node-gloom-cli/issues/new'));
    console.log(error);
    console.log(Chalk.red('-'.repeat(process.stdout.columns)));
  }

  /**
   * @param {string} message
   * @param {Object} placeholders
   * @param {string|import('../../defs').Inserter} inserter
   * @returns {string}
   */
  replaceObject(message, placeholders = {}, inserter = '"') {
    let doInserter = inserter;

    if (typeof doInserter !== 'function') {
      doInserter = (v) => {
        if (typeof inserter === 'string') {
          return inserter + v + inserter;
        }
        return v;
      };
    }

    for (const placeholder in placeholders) {
      message = message.replace(new RegExp(placeholder, 'g'), doInserter(placeholders[placeholder]));
    }
    return message;
  }
  
}