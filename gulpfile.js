var gulp = require('gulp');
var sass = require('gulp-sass');
var minifyCss = require("gulp-minify-css");
var uglify = require("gulp-uglify");



gulp.task('hello', function() {
  console.log('Hello Webclient...');
});

gulp.task('sass', function(){
  return gulp.src('source-files')
    .pipe(sass()) // Using gulp-sass
    .pipe(gulp.dest('destination'))
});

// task
gulp.task('minify-css', function () {
    gulp.src('./public/styles/default/Chart.css') // path to your file
    .pipe(minifyCss())
    .pipe(gulp.dest('./dest/styles/*.css'));
});

// task
gulp.task('minify-js', function () {
    gulp.src('./init.js') // path to your files
    .pipe(uglify())
    .pipe(gulp.dest('./min'));
});