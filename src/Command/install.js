const Command = require('../Interface/Command');
const MoreInfoError = require('../Error/MoreInfoError');
const Input = require('../Util/Input');
const Chalk = require('chalk');

module.exports = class Publish extends Command {

  describe() {
    return [
      'install',
      'Install a component from the library "' + Chalk.green(this.request.getUrl('')) + '". (Download)',
    ];
  }

  getOptions() {
    return [
      {
        name: 'comp',
        params: ['category', 'component'],
        transform: (definition, value) => {
          return value.category + '/' + value.component;
        },
        usage: ['<category:string> [component:string]', 'Possible value formats are "form text" or "form/text"'],
      },
    ];
  }

  interact() {
    const root = this.gloom.root();
    if (root === null) throw new MoreInfoError('Please use this command in theme directory.');

    this.inputs.component = this.options.comp;
    this.inputs.tags = this.options.tags;
    return [
      {
        message: 'Component',
        key: 'component',
        intro: 'The component name to install?',
        when: () => typeof this.inputs.component !== 'string' ? true : this.inputs.component,
      },
      Input.getChoiceField('version', 'Choose version', [], {
        definition: (question, inputs) => {
          return new Promise((res) => {
            this.request.POST_JSON(this.request.getUrl('api/get/component'), this.inputs).then(response => {
              const options = [];
              for (const index in response.options) {
                options.push(response.options[index]);
              }
              question.options = options;
              res();
            });
          });
        },
      }),
      Input.getBooleanField('check', (question, inputs) => {
        console.log(inputs);
        return 'Is this ok?';
      }, false),
    ];
  }

  execute() {
    console.log(this.inputs);
    return;
    return this.request.POST_JSON(this.request.getUrl('api/get/component'), this.inputs).then(response => {
      const options = {};
      for (const index in response.options) {
        options[parseInt(index) + 1] = response.options[index];
      }
      return this.input.execute([Input.getSelectField('option', 'Select version', options)], this.inputs).then(data => {
        this.request.POST_JSON(this.request.getUrl('api/get/component'), this.inputs).then(response => {
          console.log(response);
        });
      });
    });
  }

}