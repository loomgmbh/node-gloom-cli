const Path = require('path');

const Command = require('../Interface/Command');

module.exports = class Custom extends Command {

  describe() {
    this.logger.log('  gloom custom task <operation:string>');
    this.logger.log('    - operations:');
    this.logger.log('      - list:    list all custom tasks [gloom custom task list]');
    this.logger.log('      - create:  create a custom task [gloom custom task create <name:string>]');
    this.logger.log('      - delete:  delete a custom task [gloom custom task delete <name:string>]');
  }

  execute() {
    switch (this.args[1]) {
      case 'task': 
        this.task();
        return;
      default: 
      this.logger.error('Operation "' + this.args[1] + '" is unknown.\nMore info: gloom help.');
        return;
    }
  }

  task() {
    if (!this.fs.exists('package.json') || !this.fs.exists('gloom.json')) {
      this.logger.error('Please use this command from the directory where gloom.json is located.');
      return;
    }

    const VARS = {
      THEME: Path.basename(process.cwd()),
      THEME_: Path.basename(process.cwd()).replace(new RegExp('[-]', 'g'), '_'),
    };

    switch (this.args[2]) {
      case 'list':
        return this.list(VARS);
      case 'create':
        if (typeof this.args[3] === 'string') {
          VARS.TASK = this.args[3];
          VARS.TASK_UPPER = this.args[3].substring(0, 1).toUpperCase() + this.args[3].substring(1);
        } else {
          this.logger.abort('The parameter <name:string> is required.');
          return;
        }
        return this.create(VARS);
      case 'delete':
        if (typeof this.args[3] === 'string') {
          VARS.TASK = this.args[3];
          VARS.TASK_UPPER = this.args[3].substring(0, 1).toUpperCase() + this.args[3].substring(1);
        } else {
          this.logger.abort('The parameter <name:string> is required.');
          return;
        }
        return this.delete(VARS);
      default: 
        this.logger.error('Operation "' + this.args[2] + '" is unknown.\nMore info: gloom help.');
        return;
    }
  }

  list(VARS) {
    const path = this.gloom.getCustomTasksPath();
    if (path === null) {
      this.logger.abort('No custom tasks directory configuration.\n  Please insert key "<var>" in "gloom.json".', {
        '<var>': 'custom.tasks',
      });
      return;
    }

    this.logger.log('Custom tasks path: ' + this.fs.rel(path));
    this.logger.nl();
    this.logger.log('Tasks:');

    const tasks = this.gloom.getCustomTasks();
    for (const task in tasks) {
      this.logger.log('  - ' + task + ' (defined in: "' + this.fs.rel(tasks[task]) + '")');
    }
  }

  create(VARS) {
    const path = this.gloom.getCustomTasksPath();
    if (path === null) {
      this.logger.abort('No custom tasks directory configuration.\n  Please insert key "<var>" in "gloom.json".', {
        '<var>': 'custom.tasks',
      });
      return;
    }

    const defined = this.gloom.getCustomTasks();
    if (defined[VARS.TASK] !== undefined) {
      this.logger.abort('The task "' + VARS.TASK + '" exists already.');
      return;
    }

    const root = this.fs.root();
    this.fs.mkdirs(root, path.substring(root.length));

    this.fs.copyFull(Path.join(__dirname, '../../template/task'), path, VARS, false, (from, to, isDir) => {
      this.logger.log('Create "' + to.substring(root.length + 1) + '" ...');
    });

    this.logger.success('Created task is ready to use with "<command>".\n  To run the task always include "<name>" in "gloom.json" -> "<key>"', {
      '<command>': 'gulp ' + VARS.TASK,
      '<name>': VARS.TASK,
      '<key>': 'defaultTasks',
    });
  }

  delete(VARS) {
    const tasks = this.gloom.getCustomTasks();

    if (tasks === null) {
      this.logger.abort('No custom tasks directory configuration.\n  Please insert key "<var>" in "gloom.json".', {
        '<var>': 'custom.tasks',
      });
      return;
    }
  
    if (tasks[VARS.TASK] === undefined) {
      this.logger.abort('The custom task "<task>" is not defined in path "' + this.fs.rel(this.gloom.getCustomTasksPath()) + '".', {
        '<task>': VARS.TASK,
      });
      return;
    }

    this.fs.rm(tasks[VARS.TASK]);
  }

}