const Gloom = require('gloom');
const Gulp = require('gulp');

const manager = new Gloom('./tasks', require('./gloom.json'));
manager.init();

Gulp.task('default', Gulp.parallel(manager.config.defaultTasks));