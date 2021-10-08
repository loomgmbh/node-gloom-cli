const Path = require('path');

const Command = require('../../Interface/Command');

module.exports = class TaskList extends Command {

  describe() {
    return [
      'task:list',
      'list all custom tasks',
    ];
  }

  execute() {
    const path = this.gloom.getCustomTasksPath();
    if (path === null) {
      this.logger.abort('No custom tasks directory configuration.\n  Please insert key "<var>" in "gloom.json".', {
        '<var>': 'custom.tasks',
      });
      return;
    }

    this.logger.log('Custom tasks path: ' + this.gloom.rel(path));
    this.logger.nl();
    this.logger.log('Tasks:');

    const tasks = this.gloom.getCustomTasks();
    for (const task in tasks) {
      this.logger.log('  - ' + task + ' (defined in: "' + this.gloom.rel(tasks[task]) + '")');
    }
  }

}