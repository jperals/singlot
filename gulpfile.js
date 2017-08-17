const connect = require('gulp-connect');
const del = require('del');
const gulp = require('gulp');
const yaml = require('gulp-yaml');

const serverPort = 3333;
const buildDir = './build';

gulp.task('clean', function (callback) {
    del.sync(['build/**']);
    callback();
});

gulp.task('yaml', function () {
    gulp.src('./src/**/*.yaml')
        .pipe(yaml())
        .pipe(gulp.dest(buildDir));
});

gulp.task('bower', function () {
    gulp.src('./components/**')
        .pipe(gulp.dest(buildDir + '/components'));
});

gulp.task('src', function () {
    gulp.src('./src/**')
        .pipe(gulp.dest(buildDir));
});

gulp.task('reload', function () {
    gulp.src('./src/**/*')
        .pipe(connect.reload());
});

gulp.task('serve', function () {
    connect.server({
        livereload: true,
        port: serverPort,
        root: [ buildDir ]
    });
    gulp.watch('src/**/*', ['src', 'yaml', 'reload']);
});

gulp.task('build', ['clean', 'src', 'yaml', 'bower']);

gulp.task('default', ['build', 'serve']);
