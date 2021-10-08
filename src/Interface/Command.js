const Logger = require('../Util/Logger');
const FileSystem = require('../Util/FileSystem');
const Loader = require('../Util/Loader');
const Drupal = require('../Util/Drupal');
const Gloom = require('../Util/Gloom');
const Input = require('../Util/Input');
const Request = require('../Util/Request');
const MoreInfoError = require('../Error/MoreInfoError');
const Store = require('../Util/Store');

/**
 * @callback C_OptionTransform
 * @param {T_OptionDefinition} definition
 * @param {*} value
 * @returns {*}
 */

/**
 * @typedef {Object} T_OptionDefinition
 * @property {string} name
 * @property {string[]} [usage]
 * @property {string} [fallback]
 * @property {(string[]|boolean)} [params]
 * @property {C_OptionTransform} [transform]
 */

module.exports = class Command {

  constructor(args) {
    this._args = args;
    this._user = null;
    this.args = args;
    this.logger = new Logger();
    this.fs = new FileSystem(this.logger);
    this.drupal = new Drupal(this);
    this.gloom = new Gloom(this);
    this.input = new Input(this);
    this.request = new Request(this);

    this.inputs = {};
    this.options = {};
  }

  loader(paths) {
    return new Loader(paths);
  }

  required(...params) {
    if (this.args.length - 1 < params.length) {
      this.logger.abort('Please ensure the required parameter "' + params[this.args.length - 1] + '"');
      return true;
    }
    return false;
  }

  /**
   * @param {T_OptionDefinition[]} definitions 
   */
  defineOptions(definitions) {
    const filtered = [];
    const args = this._args.slice();

    this.options = {};
    for (let index = 0; index < args.length; index++) {
      if (args[index].startsWith('--')) {
        const definition = definitions.find(definition => definition.name === args[index].substring(2));
        if (!definition) continue;
        if (definition.params === true) {
          if (typeof args[++index] !== 'string' || args[index].startsWith('--')) {
            index--;
            this.options[definition.name] = definition.fallback !== undefined ? definition.fallback : true;
          } else {
            this.options[definition.name] = args[index];
          }
        } else if (Array.isArray(definition.params)) {
          this.options[definition.name] = {};
          for (const param of definition.params) {
            const value = args[++index];
            if (value.startsWith('--')) {
              index--;
              break;
            }
            this.options[definition.name][param] = value;
          }
        } else {
          this.options[definition.name] = true;
        }
        if (definition.transform) {
          this.options[definition.name] = definition.transform(definition, this.options[definition.name]);
        }
      } else {
        filtered.push(args[index]);
      }
    }
    this.args = filtered;
  }

  /**
   * @param {T_OptionDefinition} definition
   * @param {string} value
   * @returns {string[]}
   */
  optionToList(definition, value) {
    return value.split(new RegExp('[, ]')).map(v => v.trim()).reduce((map, value) => {
      if (value.length) {
        map.push(value);
      }
      return map;
    }, []);
  }

  error(error) {
    if (error instanceof MoreInfoError) {
      this.logger.notice('MORE INFO: ' + error.message);
    } else {
      this.logger.error(error);
    }
  }

  hook(func, return_value, ...args) {
    let name = func.split('.').reduce((name, value) => {
      return name + value.substring(0, 1).toUpperCase() + value.substring(1);
    }, 'hook');

    if (name !== 'hookHook') {
      const info = {func, name, return_value, args};

      this.hook('hook', null, info);
      name = info.name;
      return_value = info.return_value;
      args = info.args;
    }

    if (typeof this[name] === 'function') {
      return this[name](...args);
    } else {
      return return_value;
    }
  }

  doExecute() {
    return new Promise((res, rej) => {
      try {
        let options = this.getOptions() || [];

        options.push({
          name: 'theme',
          params: true,
        });
        options.push({
          name: 'silent',
        });
        
        this.defineOptions(options);

        if (this.options.silent) {
          this.logger.silent(true);
        }

        const interact = this.interact();

        if (interact) {
          if (!Array.isArray(interact)) interact = [interact];
          this.input.execute(interact, this.inputs).then((inputs) => {
            this.inputs = inputs;
            res();
          });
        } else {
          res();
        }
      } catch (error) {
        rej(error);
      }
    }).then(() => this.execute());
  }

  describe() {}

  /**
   * @returns {import('../Util/Input').T_Question[]}
   */
  interact() {}

  /**
   * @returns {T_OptionDefinition[]}
   */
  getOptions() {}

  execute() {}

  destroy() {}

  map(value, callback) {
    if (Array.isArray(value)) {
      const newValue = [];
      for (const index in value) {
        newValue.push(callback(value[index], index, value));
      }
      return newValue;
    } else {
      const newValue = {};
      for (const index in value) {
        newValue[index] = callback(value[index], index, value);
      }
      return newValue;
    }
  }

  /**
   * @returns {Promise<Store>}
   */
  user() {
    if (this._user) return Promise.resolve(this._user);
    this._user = Store.get('user');
    const inputs = {};
    console.log('Please enter user data.');
    return this.input.execute([
      {
        key: 'name',
        message: 'Name',
      },
      {
        key: 'mail',
        message: 'E-Mail',
      }
    ], inputs).then((inputs) => {
      this._user.set('name', inputs.name);
      this._user.set('mail', inputs.mail);
      return this._user;
    });
  }

}