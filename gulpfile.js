var browserify = require('browserify');
var babel = require('gulp-babel');
var gulp = require('gulp');
var less = require('gulp-less');
var browserSync = require('browser-sync').create();
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');
var cacheBuster = require('gulp-cache-bust');
var gulpUtil = require('gulp-util');
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var sourcemaps = require("gulp-sourcemaps");

// Compile LESS files from /less into /css
gulp.task('less', function() {
    return gulp.src('less/sb-admin-2.less')
        .pipe(less())
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify compiled CSS
gulp.task('minify-css', ['less'], function() {
    return gulp.src('dist/css/sb-admin-2.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Copy JS to dist
gulp.task('js', function() {
    return gulp.src(['js/**/*.js'])
        .pipe(babel())
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.reload({
            stream: true
        }))
})

// Minify JS
gulp.task('minify-js', ['js'], function() {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './js/main.js',
    debug: true
  });

  return b.bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(babel())
    .pipe(uglify())
      .on('error', gulpUtil.log)
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./dist/js/'));
});

// CACHE BUSTER
// cacheBuster looks at the css and js files and appends a hash to the
// request to cause the file to get reloaded when the file changes.
gulp.task('cache-bust', ['minify-css', 'minify-js'], function () {

    gulp.src(['deck/index.html'])
        .pipe(cacheBuster())
          .on('error', gulpUtil.log)
        .pipe(gulp.dest('deck/'));

    gulp.src(['game/index.html'])
        .pipe(cacheBuster())
          .on('error', gulpUtil.log)
        .pipe(gulp.dest('game/'));

    gulp.src(['login/index.html'])
        .pipe(cacheBuster())
          .on('error', gulpUtil.log)
        .pipe(gulp.dest('login/'));

    gulp.src(['index.html'])
        .pipe(cacheBuster())
          .on('error', gulpUtil.log)
        .pipe(gulp.dest('./'));
});

// Copy vendor libraries from /bower_components into /vendor
gulp.task('copy', function() {
    gulp.src(['bower_components/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
        .pipe(gulp.dest('vendor/bootstrap'))

    gulp.src(['bower_components/bootstrap-social/*.css', 'bower_components/bootstrap-social/*.less', 'bower_components/bootstrap-social/*.scss'])
        .pipe(gulp.dest('vendor/bootstrap-social'))

    gulp.src(['bower_components/datatables/media/**/*'])
        .pipe(gulp.dest('vendor/datatables'))

    gulp.src(['bower_components/datatables-plugins/integration/bootstrap/3/*'])
        .pipe(gulp.dest('vendor/datatables-plugins'))

    gulp.src(['bower_components/datatables-responsive/css/*', 'bower_components/datatables-responsive/js/*'])
        .pipe(gulp.dest('vendor/datatables-responsive'))

    gulp.src(['bower_components/flot/*.js'])
        .pipe(gulp.dest('vendor/flot'))

    gulp.src(['bower_components/flot.tooltip/js/*.js'])
        .pipe(gulp.dest('vendor/flot-tooltip'))

    gulp.src(['bower_components/font-awesome/**/*', '!bower_components/font-awesome/*.json', '!bower_components/font-awesome/.*'])
        .pipe(gulp.dest('vendor/font-awesome'))

    gulp.src(['bower_components/jquery/dist/jquery.js', 'bower_components/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest('vendor/jquery'))

    gulp.src(['bower_components/metisMenu/dist/*'])
        .pipe(gulp.dest('vendor/metisMenu'))

    gulp.src(['bower_components/morrisjs/*.js', 'bower_components/morrisjs/*.css', '!bower_components/morrisjs/Gruntfile.js'])
        .pipe(gulp.dest('vendor/morrisjs'))

    gulp.src(['bower_components/raphael/raphael.js', 'bower_components/raphael/raphael.min.js'])
        .pipe(gulp.dest('vendor/raphael'))

})

// Run everything
gulp.task('default', ['minify-css', 'minify-js', 'copy', 'cache-bust']);

// Configure the browserSync task
gulp.task('browserSync', function() {
    browserSync.init({
        server: ".",
    })
})

// Dev task with browserSync
gulp.task('dev', ['less', 'minify-css', 'js', 'minify-js', 'cache-bust', 'browserSync'], function() {
    gulp.watch('less/*.less', ['less']);
    gulp.watch('dist/css/*.css', ['minify-css']);
    gulp.watch('js/**/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or JS files change
//    gulp.watch('pages/*.html', browserSync.reload);
    gulp.watch('dist/js/bundle.min.js', browserSync.reload);
});
