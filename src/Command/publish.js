const Path = require('path');
const FS = require('fs');
const Chalk = require('chalk');

const Command = require('../Interface/Command');
const MoreInfoError = require('../Error/MoreInfoError');
const Input = require('../Util/Input');

/**
 * @typedef {Object} T_PublishInputs
 * @property {string} component
 * @property {string[]} tags
 * @property {string} name
 * @property {Object<string, string>} component_files
 * @property {Object<string, string>} files
 * @property {Object} info
 * @property {string} info.theme
 * @property {string[]} info.dependencies
 * @property {boolean} info.themeDependency
 * @property {Object} info.invalidDependencies
 * @property {string[]} info.invalidDependencies.comp
 * @property {string[]} info.invalidDependencies.absolute
 */

module.exports = class Publish extends Command {

  describe() {
    return [
      'publish',
      'Publish a component from this theme to the library "' + Chalk.green(this.request.getUrl('')) + '". (Upload)',
    ];
  }

  getOptions() {
    return [
      {
        name: 'comp',
        params: ['category', 'component'],
        transform: (definition, value) => {
          if (value.component === undefined) return value.category;
          return value.category + '/' + value.component;
        },
        usage: ['<category:string> [component:string]', 'Possible value formats are "form text" or "form/text"'],
      },
      {
        name: 'tags',
        params: true,
        fallback: 'default',
        usage: ['<tags:string>', 'For multi tags use a comma seperated list, (Do not use spaces in list)', 'Default: "default"', 'Examples: "default,plain", "plain", ...'],
        transform: this.optionToList,
      },
    ];
  }

  interact() {
    const root = this.gloom.root();
    if (root === null) throw new MoreInfoError('Please use this command in theme directory.');

    this.inputs.info = {
      theme: root,
    };
    this.inputs.component = this.options.comp;
    this.inputs.tags = this.options.tags || [];
    return [
      {
        message: 'Component',
        key: 'component',
        intro: 'Which component will be uploaded?',
        when: () => typeof this.inputs.component !== 'string' ? true : this.inputs.component,
        validate: (bag, answer, question) => {
          const files = this.validateComponent(answer);

          if (files === null) {
            return 'Please define the component with "<category>/<component>".';
          }
        },
      },
      {
        message: 'Tags',
        key: 'tags',
        when: () => this.inputs.tags.length ? this.inputs.tags.join(', ') : true,
        transform: Input.transformToList,
      },
      Input.getTextAreaField('description', 'Description', ''),
    ];
  }

  execute() {
    console.log('get user');
    return this.user().then((user) => {
      console.log(user.get('name'));
      console.log(user.get('mail'));
    });
    this.inputs.component_files = this.validateComponent(this.inputs.component);

    if (this.inputs.component_files === null) {
      this.logger.error('The component is not valid.');
      return;
    }

    this.inputs.files = {};
    for (const index in this.inputs.component_files) {
      const file = this.inputs.component_files[index];

      this.inputs.files[file] = FS.readFileSync(file).toString();
    }

    this.sanitizeComponent(this.inputs);
    // console.log(this.inputs, this.options);
    this.input.execute([
      Input.getBooleanField('check_problems', (question, inputs) => {
        return 'There are problems with the twig file, continue?';
      }, false, {
        when: () => {return this.inputs.info.invalidDependencies.absolute.length !== 0 || this.inputs.info.invalidDependencies.comp.length !== 0;},
      }),
      Input.getBooleanField('check', (question, inputs) => {
        console.log({
          name: inputs.name,
          files: this.map(inputs.component_files, (v) => this.gloom.rel(v)),
          dependencies: inputs.info.dependencies,
          description: inputs.description,
        });
        return 'Is this ok?';
      }, false, {
        when: () => {return this.inputs.check_problems === true},
      }),
    ], this.inputs).then(() => {

    });
    return;
    
    return this.request.POST_JSON(this.request.getUrl('api/publish'), this.inputs).then(response => {
      console.log(response);
    });
  }

  /**
   * @param {string} component 
   * @returns {Object<string, string>}
   */
  validateComponent(component) {
    const files = {};
    const dir = Path.join(this.gloom.root(), 'src/comps', component);

    if (!FS.existsSync(dir)) return null;
    for (const file of FS.readdirSync(dir)) {
      const _file = Path.join(dir, file);
      if (!FS.statSync(_file).isFile()) return null;
      files[Path.parse(_file).ext.substring(1)] = _file;
    }
    return files;
  }

  /**
   * @param {T_PublishInputs} inputs 
   */
  sanitizeComponent(inputs) {
    inputs.info = inputs.info || {};
    inputs.name = inputs.component.split('/').pop();
    const twig = inputs.files[inputs.component_files.twig];

    inputs.info.themeDependency = true;
    if (!this.logger.logging('Sanitize check theme dependency ...', {}, () => {
      return twig.search('\\{\\{ attach_library\\(theme ~ \'/' + inputs.name + '\'\\) \\}\\}') !== -1;
    })) {
      this.logger.errorLite('Please ensure that the component load the library\n{{ attach_library(theme ~ \'/' + inputs.name + '\') }}');
      inputs.info.themeDependency = false;
    }

    inputs.info.dependencies = [];
    inputs.info.invalidDependencies = {
      comp: [],
      absolute: [],
    };
    if (!this.logger.logging('Sanitize check component dependency ...', {}, () => {
      for (const found of twig.matchAll(new RegExp('\{% (?:include|embed) comps ~ \'(.*)\'', 'gm'))) {
        inputs.info.dependencies.push(found[1]);
      }
      inputs.info.dependencies = inputs.info.dependencies.map(v => v.split('/')[1] + '/' + v.split('/')[2]);  

      for (const found of twig.matchAll(new RegExp('\{% (?:include|embed) (comp ~ \'.*)\'', 'gm'))) {
        inputs.info.invalidDependencies.comp.push(found[1]);
      }

      for (const found of twig.matchAll(new RegExp('\{% (?:include|embed)\\s*\'(.*)\'', 'gm'))) {
        inputs.info.invalidDependencies.absolute.push(found[1]);
      }

      return inputs.info.invalidDependencies.absolute.length === 0 && inputs.info.invalidDependencies.comp.length === 0;
    })) {
      if (inputs.info.invalidDependencies.comp.length) {
        this.logger.errorLite('Please use "comps ~ \'" as relative key by: \n    - ' + inputs.info.invalidDependencies.comp.join('\n    - '));
      }
      if (inputs.info.invalidDependencies.absolute.length) {
        this.logger.errorLite('Please use only relative path for components "comps ~ \'":\n    - ' + inputs.info.invalidDependencies.absolute.join('\n    - '));
      }
    }
  }

}