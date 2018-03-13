var gulp = require('gulp');

gulp.task('hello', function() {
  console.log('Hello Webclient...');
});

gulp.task('test1', function () {
  return gulp.src('source-files') // Get source files with gulp.src
    .pipe(aGulpPlugin()) // Sends it through a gulp plugin
    .pipe(gulp.dest('destination')) // Outputs the file in the destination folder
})