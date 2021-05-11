const Gloom = require('gloom');
const Gulp = require('gulp');

const manager = new Gloom(require('./gloom.json'));
manager.init();

Gulp.task('default', Gulp.parallel(manager.config.defaultTasks));