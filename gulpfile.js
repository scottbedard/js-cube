//
// Dependencies
//
var gulp = require('gulp');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');
var babel = require('babel/register');

//
// Watch files and execute tests
//
gulp.task('default', function() {
    gulp.watch(['./src/**/*', './tests/**/*'], ['test']);
});

gulp.task('test', function() {
    return gulp.src('./tests/**/*')
        .pipe(mocha({
            compilers: {
                js: babel,
            },
        }));
});
