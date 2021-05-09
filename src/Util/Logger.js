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

  success(message) {
    if (this._silent) return;
    this.nl();
    console.log(Chalk.green('-'.repeat(process.stdout.columns)));
    console.log(Chalk.green('[SUCCESS]: ' + message));
    console.log(Chalk.green('-'.repeat(process.stdout.columns)));
  }

  successLite(message) {
    if (this._silent) return;
    console.log(Chalk.green('[SUCCESS]: ' + message));
  }

  abort(message) {
    if (this._silent) return;
    this.nl();
    console.log(Chalk.red('-'.repeat(process.stdout.columns)));
    console.log(Chalk.red('[ABORT]: ' + message));
    console.log(Chalk.red('-'.repeat(process.stdout.columns)));
  }

  log(...messages) {
    if (this._silent) return;
    console.log(Chalk.green(messages.join(' ')));
  }

  notice(message) {
    if (this._silent) return;
    console.log(Chalk.blue('[NOTICE] ' + message));
  }

  error(error) {
    if (this._silent) return;
    console.log(Chalk.red('-'.repeat(process.stdout.columns)));
    console.log(Chalk.red('[ERROR]: The command has an unmanaged error. Please inform the developer about the error -> https://github.com/loomgmbh/node-gloom-cli/issues/new'));
    console.log(error);
    console.log(Chalk.red('-'.repeat(process.stdout.columns)));
  }

  errorLite(message) {
    if (this._silent) return;
    console.log(Chalk.red('[ERROR]: ' + message));
  }

  fatal(error) {
    console.log(Chalk.red('-'.repeat(process.stdout.columns)));
    console.log(Chalk.red('[FATAL ERROR]: Please inform the developer about the error -> https://github.com/loomgmbh/node-gloom-cli/issues/new'));
    console.log(error);
    console.log(Chalk.red('-'.repeat(process.stdout.columns)));
  }
  
}