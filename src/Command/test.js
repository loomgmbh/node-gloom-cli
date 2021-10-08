const Path = require('path');
const FS = require('fs');

const Command = require('../Interface/Command');
const Input = require('../Util/Input');

module.exports = class Test extends Command {

  describe() {
    
  }
  /*
  interact() {
    return [
      {
        message: 'Input',
        key: 'inp',
        description: 'Hallo hier ist text',
      },
      {
        intro: 'Hallo hier ist text',
        message: 'Input 2',
        key: (question, answer, bag) => {
          return answer + '_' + answer;
        },
        fallback: (question, bag) => {
          return bag.inp;
        },
        when: (question, bag) => {
          if (bag.inp === 'hallo') return false;
        },
      },
      Input.getBooleanField('check', 'Check'),
      Input.getSelectField('select', 'Select', {one: 'Eins', two: '2', three: '3'}, {fallback: null}),
    ];
  }
  //*/

  execute() {
    
  }

  hookInputValidate(bag, answer, question) {
    if (bag.inp === answer) return 'Do not use the same object.';
  }

}