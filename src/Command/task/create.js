const Path = require('path');

const Command = require('../../Interface/Command');

module.exports = class TaskCreate extends Command {

  describe() {
    return [
      'task:create <name:string>',
      'create a custom task',
    ];
  }

  execute() {
    const VARS = {};
    VARS.TASK = this.args[1];
    VARS.TASK_UPPER = this.args[1].substring(0, 1).toUpperCase() + this.args[1].substring(1);

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

    const root = this.gloom.root();
    this.fs.mkdirs(root, path.substring(root.length));

    this.fs.copyFull(Path.join(__dirname, '../../../template/task'), path, VARS, false, (from, to, isDir) => {
      this.logger.log('Create "' + to.substring(root.length + 1) + '" ...');
    });

    this.logger.success('Created task is ready to use with "<command>".\n  To run the task always include "<name>" in "<file>" -> "<key>"', {
      '<command>': 'gulp ' + VARS.TASK,
      '<name>': VARS.TASK,
      '<key>': 'defaultTasks',
      '<file>': 'gloom.json',
    });
  }

}