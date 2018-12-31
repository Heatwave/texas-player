var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var mocha = require('gulp-mocha');

gulp.task('run-tests', function () {
    return gulp.src('test/ut/*.test.ts')
        .pipe(mocha({
            require: ['ts-node/register']
        }));
});

gulp.task('copy-data', function () {
    gulp.src('./data/*')
        .pipe(gulp.dest('dist/data/'));
})

gulp.task("default", ['copy-data', 'run-tests'], function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"));
});