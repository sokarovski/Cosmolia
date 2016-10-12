var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var less = require("gulp-less");
var minify = require("gulp-clean-css");
var esdoc = require("gulp-esdoc");

gulp.task('default', ['concat']);
gulp.task('build', ['concat', 'minify']);

gulp.task('concat', ['concat.js', 'concat.css']);

gulp.task('concat.js',  function () {
    return gulp.src('src/js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('cosmolia.js'))
        .pipe(gulp.dest('dist'));
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
    return gulp.src('src/js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('cosmolia.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist'));
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

gulp.task('doc', function() {
    return gulp.src("./src2")
      .pipe(esdoc({
  "source": "./src2",
  "destination": "./doc",
  "plugins": [
    {"name": "esdoc-es7-plugin"}
  ]
}));
});