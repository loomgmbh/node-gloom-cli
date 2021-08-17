const Task = require('gloom/Task');
const Gulp = require('gulp');

module.exports = class [[TASK_UPPER]]Task extends Task {

  key() {
    return '[[TASK]]';
  }

  tags() {
    return ['watcher'];
  }

  defaultConfig() {
    return {
      [[TASK]]: {
        files: [
          'src/comps/**/*.*',
          '!src/comps/**/_*.*',
        ],
        dest: './dist/[[TASK]]',
        watch: 'src/comps/**/*.*',
      },
    };
  }
  
  task(config) {
    Gulp.task('[[TASK]]', function [[TASK]]_compile() {
       return Gulp.src(config.[[TASK]].files)
        .pipe(Gulp.dest(config.[[TASK]].dest));
    });

    Gulp.task('[[TASK]]:watch', Gulp.series('[[TASK]]', function [[TASK]]_watch(cb) {
      Gulp.watch(config.[[TASK]].watch, Gulp.parallel('[[TASK]]'))
        .on('change', function(path) {
          console.log('[[TASK]] log change');
        });
    
      cb();
    }));
  }

}