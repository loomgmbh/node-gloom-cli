const Readline = require('readline');
const Chalk = require('chalk');

/**
 * @callback C_PromiseCallback
 * @param {T_Question} question
 * @param {Object<string, string>} bag
 * @returns {Promise}
 */

/**
 * @callback C_DefinitionCallback
 * @param {T_Question} question
 * @param {Object<string, string>} bag
 * @returns {string}
 */

/**
 * @callback C_QuestionCallback
 * @param {Object<string, string>} bag
 * @param {string} answer
 * @param {T_Question} question
 * @returns {string}
 */

/**
 * @callback C_ValidateCallback
 * @param {Object<string, string>} bag
 * @param {string} answer
 * @param {T_Question} question
 * @returns {(string|boolean)}
 */

/**
 * @typedef {Object} T_Question
 * @property {(string|C_DefinitionCallback)} message
 * @property {(string|C_QuestionCallback)} key
 * @property {(string|C_DefinitionCallback)} [prompt]
 * @property {(string|C_DefinitionCallback)} [description]
 * @property {(string|C_DefinitionCallback)} [intro]
 * @property {(C_QuestionCallback|C_QuestionCallback[])} [transform]
 * @property {(C_ValidateCallback|C_ValidateCallback[])} [validate]
 * @property {C_DefinitionCallback} [when]
 * @property {C_PromiseCallback} [definition]
 * @property {(string|C_DefinitionCallback)} [fallback]
 * @property {boolean} [multi]
 */

/**
 * @typedef {Object} T_QuestionOptions
 * @property {string} message
 * @property {string} prompt
 * @property {string} [intro]
 * @property {string} [description]
 * @property {string} [fallback]
 * @property {C_QuestionCallback[]} transform
 * @property {C_ValidateCallback[]} validate
 * @property {T_Question} question
 * @property {boolean} [multi]
 */

/**
 * @typedef {T_Question} T_QuestionChoice
 * @property {string[]} options
 */

module.exports = class Input {

  /**
   * @param {T_Question} question 
   * @param {string} prop 
   * @param {*} value 
   * @returns {T_Question}
   */
  static addArrayProperty(question, prop, value) {
    if (question[prop] === undefined) {
      question[prop] = [value];
    } else {
      if (!Array.isArray(question[prop])) {
        question[prop] = [question[prop]];
      }
      question[prop].push(value);
    }
    return question;
  }

  /**
   * @param {Object<string, string>} bag
   * @param {string} answer
   * @param {T_Question} question
   * @returns {string[]}
   */
  static transformToList(bag, answer, question) {
    return answer.split(new RegExp('[, ]')).map(v => v.trim()).reduce((map, value) => {
      if (value.length) {
        map.push(value);
      }
      return map;
    }, []);
  }

  /**
   * @param {(string|C_QuestionCallback)} key
   * @param {(string|C_DefinitionCallback)} message 
   * @param {boolean} fallback 
   * @param {T_Question} question 
   * @returns {T_Question}
   */
  static getBooleanField(key, message, fallback = false, question = {}) {
    question.key = key;
    question.message = message;
    question.fallback = fallback;
    question.prompt = ' [y/n]: ';

    this.addArrayProperty(question, 'transform', (bag, answer, question) => {
      if (answer === 'y') return true;
      if (answer === 'n') return false;
      return answer;
    });

    this.addArrayProperty(question, 'validate', (bag, answer, question) => {
      if (typeof answer === 'string') return 'Please use only "y" for true or "n" for false.';
    });

    return question;
  }

  /**
   * @param {(string|C_QuestionCallback)} key
   * @param {(string|C_DefinitionCallback)} message
   * @param {(Object<string, string>|string[])} options 
   * @param {T_Question} question 
   * @returns {T_Question}
   */
  static getSelectField(key, message, options, question = {}) {
    question.key = key;
    question.message = message;

    this.addArrayProperty(question, 'transform', (bag, answer, question) => {
      if (Array.isArray(options)) return answer;
      for (const index in options) {
        if (options[index] === answer) return index;
      }
    });

    this.addArrayProperty(question, 'validate', (bag, answer, question) => {
      if (Array.isArray(options)) {
        if (options.includes(answer)) return true;
        return 'Please use one of thies options [' + options.join(', ') + '] ...';
      }
      if (typeof options[answer] === 'string') return true;
      const data = [];
      for (const index in options) {
        data.push(options[index]);
      }
      return 'Please use one of thies options [' + data.join(', ') + ']';
    });

    return question;
  }

  /**
   * @param {(string|C_QuestionCallback)} key 
   * @param {(string|C_DefinitionCallback)} message 
   * @param {string[]} options 
   * @param {T_QuestionChoice} question 
   * @returns {T_QuestionChoice}
   */
  static getChoiceField(key, message, options, question = {}) {
    question.key = key;
    question.message = message;
    question.options = options;
    question.description = (question, bag) => {
      return 'Choose an option:\n' + question.options.map((option, index) => {
        return '  [' + (parseInt(index) + 1) + '] ' + option;
      }).join('\n');
    };

    this.addArrayProperty(question, 'transform', (bag, answer, question) => {
      return question.options[parseInt(answer) - 1];
    });

    this.addArrayProperty(question, 'validate', (bag, answer, question) => {
      return typeof answer === 'string' ?? 'Please choose one of the options.';
    });

    return question;
  }

  /**
   * @param {(string|C_QuestionCallback)} key 
   * @param {(string|C_DefinitionCallback)} message
   * @param {string} intro
   * @param {T_Question} question 
   * @returns {T_Question}
   */
  static getTextAreaField(key, message, intro = '', question = {}) {
    question.key = key;
    question.intro = intro + (intro.length ? '\n' : '') + '(Press [enter] on empty line to end input)';
    question.message = message;
    question.multi = true;

    return question;
  }

  /**
   * @param {import('../Interface/Command')} command 
   */
  constructor(command) {
    this.command = command;
    this._logger = this.command.logger;
  }

  /**
   * @param {T_QuestionOptions} options
   * @param {Object<string, string>} bag
   * @param {*} callback
   * @returns {Readline}
   */
  question({message, prompt, fallback, validate, transform, question, description, intro, multi}, bag, callback) {
    const readline = Readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (intro !== undefined) {
      console.log(Chalk.cyan(intro()));
    }
    if (description !== undefined) {
      console.log(Chalk.cyan(description()));
    }
    if (!multi) {
      readline.question(Chalk.underline.blueBright(message()) + Chalk.blueBright((fallback === undefined ? '' : ' (' + fallback() + ')') + (prompt() === undefined ? ': ' : prompt())), (answer) => {
        readline.close();
        if (fallback !== undefined && answer === '') {
          callback(fallback());
        } else {
          for (const transformer of transform()) {
            answer = transformer(bag, answer, question);
          }
          answer = this.command.hook('input.transform', answer, bag, answer, question);
  
          try {
            for (const validator of validate()) {
              const valid = validator(bag, answer, question);
              if (typeof valid === 'string') {
                throw new Error(valid);
              } else if (valid === false) {
                throw new Error('Input is not accepted.');
              }
            }
  
            const valid = this.command.hook('input.validate', true, bag, answer, question);
            if (typeof valid === 'string') {
              throw new Error(valid);
            } else if (valid === false) {
              throw new Error('Input is not accepted.');
            }
  
            callback(answer);
          } catch (e) {
            console.log(Chalk.red(' ✘ ' + e.message));
            this.question({message, prompt, fallback, validate, transform, question, description}, bag, callback);
          }
        }
      });
    } else {
      let lines = [];
      readline.setPrompt(Chalk.underline.blueBright(message()) + Chalk.blueBright((prompt() === undefined ? ': ' : prompt())));
      readline.prompt(true);
      readline.on('line', (line) => {
        if (line.length === 0) {
          readline.close();
        } else {
          lines.push(line);
          process.stdout.write(Chalk.underline.blueBright(message()) + Chalk.blueBright((prompt() === undefined ? ': ' : prompt())));
        }
      });
      readline.on('SIGTSTP', () => {
        process.exit(0);
      });
      readline.on('close', () => {
        for (const transformer of transform()) {
          lines = transformer(bag, lines, question);
        }
        lines = this.command.hook('input.transform', lines, bag, lines, question);

        try {
          for (const validator of validate()) {
            const valid = validator(bag, lines, question);
            if (typeof valid === 'string') {
              throw new Error(valid);
            } else if (valid === false) {
              throw new Error('Input is not accepted.');
            }
          }

          const valid = this.command.hook('input.validate', true, bag, lines, question);
          if (typeof valid === 'string') {
            throw new Error(valid);
          } else if (valid === false) {
            throw new Error('Input is not accepted.');
          }

          callback(lines);
        } catch (e) {
          console.log(Chalk.red(' ✘ ' + e.message));
          this.question({message, prompt, fallback, validate, transform, question, description, multi}, bag, callback);
        }
      });
    }

    return readline;
  }

  /**
   * @param {T_Question[]} questions
   * @param {Object<string, string>} bag
   * @returns {Promise<Object<string, string>>}
   */
  execute(questions, bag = {}) {
    return questions.reduce((line, question) => {
      return line.then(() => this.doExecute(question, bag));
    }, Promise.resolve());
  }

  /**
   * @param {T_Question} question
   */
  doExecute(question, bag = {}) {
    return new Promise((res, rej) => {
      /** @type {T_QuestionOptions} */
      const options = {};
      let promise = Promise.resolve();

      if (typeof question.definition === 'function') {
        const definition = question.definition(question, bag);
        if (definition instanceof Promise) {
          promise = definition;
        }
      }
      promise.then(() => {
        options.question = question;
        options.message = this.createCallback(() => typeof question.message === 'string' ? question.message : question.message(question, bag));
        options.prompt = this.createCallback(() => question.prompt === undefined ? ': ' : typeof question.prompt === 'string' ? question.prompt : question.prompt(question, bag));
        options.validate = this.createCallback(() => Array.isArray(question.validate) ? question.validate : (typeof question.validate !== 'function' ? [] : [question.validate]));
        options.transform = this.createCallback(() => Array.isArray(question.transform) ? question.transform : (typeof question.transform !== 'function' ? [] : [question.transform]));
        options.multi = question.multi;
        if (question.description !== undefined) {
          options.description = this.createCallback(() => typeof question.description === 'function' ? question.description(question, bag) : question.description);
        }
        if (question.intro !== undefined) {
          options.intro = this.createCallback(() => typeof question.intro === 'function' ? question.intro(question, bag) : question.intro);
        }
        if (question.fallback !== undefined) {
          options.fallback = this.createCallback(() => typeof question.fallback === 'function' ? question.fallback(question, bag) : question.fallback);
        }

        if (typeof question.when === 'function') {
          const result = question.when(question, bag);
          if (result === false) {
            res(bag);
            return;
          } else if (typeof result === 'string') {
            console.log(Chalk.blueBright(options.message() + (options.fallback === undefined ? '' : ' (' + options.fallback() + ')') + (options.prompt === undefined ? ': ' : options.prompt())) + Chalk.cyan(result));
            res(bag);
            return;
          }
        }
        this.question(options, bag, (answer) => {
          if (typeof question.key === 'string') {
            bag[question.key] = answer;
          } else {
            bag[question.key(bag, answer, question)] = answer;
          }
          res(bag);
        });
      });
    });
  }

  createCallback(callback) {
    let value = undefined;
    let empty = true;
    return () => {
      if (empty) {
        value = callback();
        empty = false;
      }
      return value;
    };
  }

}