var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var less = require("gulp-less");
var minify = require("gulp-clean-css");
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var babelify = require("babelify");
var plato = require('gulp-plato');

gulp.task('default', ['concat']);
gulp.task('build', ['plato', 'concat', 'minify']);

gulp.task('plato', function () {
    return gulp.src('./src/**/*.js')
        .pipe(plato('report', {
            jshint: {
                options: {
                    strict: true
                }
            },
            complexity: {
                trycatch: true
            }
        }));
});


gulp.task('concat', ['concat.js', 'concat.css']);

gulp.task('concat.js',  function () {
    var b = browserify('./src/js/Cosmolia.js', {debug: true}).transform(babelify);
    return b.bundle()
        .pipe(source('./cosmolia.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('concat.css',  function () {
    return gulp.src('src/less/**/*.less')
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(concat('cosmolia.css'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist'));
});

gulp.task('minify', ['minify.js', 'minify.css']);

gulp.task('minify.js', function() {
    var b = browserify('./src/js/Cosmolia.js', {debug: true}).transform(babelify);
    return b.bundle()
        .pipe(source('./cosmolia.min.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('minify.css', function() {
    return gulp.src('src/less/**/*.less')
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(concat('cosmolia.min.css', {newLine: '\r\n\r\n'}))
        .pipe(minify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist'));
});