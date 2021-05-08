const GloomPlugin = require('gloom-plugin');
const Gulp = require('gulp');

const manager = new GloomPlugin('./tasks', require('./gloom.json'));
manager.init();

Gulp.task('default', Gulp.parallel(manager.config.defaultTasks));