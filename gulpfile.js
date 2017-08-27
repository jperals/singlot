const connect = require('gulp-connect');
const del = require('del');
const ghpages = require('gh-pages');
const gulp = require('gulp');
const runSequence = require('run-sequence');
const yaml = require('gulp-yaml');

const serverPort = 3333;
const buildDir = './build';

gulp.task('clean', function (callback) {
    del.sync([buildDir + '/**']);
    if(typeof callback === 'function') callback();
});

gulp.task('yaml', function () {
    return gulp.src('./src/**/*.yaml')
        .pipe(yaml())
        .pipe(gulp.dest(buildDir));
});

gulp.task('bower', function () {
    return gulp.src('./components/**')
        .pipe(gulp.dest(buildDir + '/components'));
});

gulp.task('src', function () {
    return gulp.src('./src/**')
        .pipe(gulp.dest(buildDir));
});

gulp.task('reload', function () {
    return gulp.src('./src/**/*')
        .pipe(connect.reload());
});

gulp.task('serve', function () {
    connect.server({
        livereload: true,
        port: serverPort,
        root: [ buildDir ]
    });
    return gulp.watch('./src/**/*', ['src', 'yaml', 'reload']);
});

gulp.task('gh-pages', function (callback) {
    return ghpages.publish(buildDir, function(err) {
        console.error(err);
        if(typeof callback === 'function') {
            callback();
        }
    });
});

gulp.task('build', function(callback) {
    runSequence('clean', ['src', 'yaml', 'bower'], callback);
});

gulp.task('default', ['build', 'serve']);

gulp.task('publish', function(callback) {
    runSequence('build', 'gh-pages', callback);
});
