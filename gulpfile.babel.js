import gulp         from 'gulp';
import gutil        from 'gulp-util';
import browserify   from 'browserify';
import watchify     from 'watchify';
import source       from 'vinyl-source-stream';
import babelify     from 'babelify';
import buffer       from 'vinyl-buffer';
import uglify       from 'gulp-uglify';
import envify       from 'envify/custom';
import less         from 'gulp-less';
import postcss      from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csswring     from 'csswring';
import concatCss    from 'gulp-concat-css';
import browserSync  from 'browser-sync';
import babel        from 'gulp-babel';
import nodeDev      from 'node-dev';

var path = {
  OUT: 'bundle.js',
  DEST: './public',
  ENTRY_POINT: './client/main.js'
}

/**
 * To build, create bundle.js and style.css
 */
gulp.task('build', ['browserify', 'less', 'build-server']);

/**
 * Create and minify bundle.js
 */
gulp.task('browserify', () => {
  process.env['NODE_ENV'] = 'production';
  return browserify(path.ENTRY_POINT)
    .transform(babelify.configure())
    .transform('brfs')
    .transform(envify({ NODE_ENV: 'production' }))
    .bundle()
    .pipe(source(path.OUT))  // gives streaming vinyl file object
    .pipe(buffer())          // convert from streaming to buffered vinyl file object
    .pipe(uglify())          // minify dat code
    .pipe(gulp.dest(path.DEST));
});

/**
 * Convert all less into minified autoprefixed css
 */
gulp.task('less', () =>
  gulp.src('./client/**/*.less')
    .pipe(less())
    .pipe(concatCss('style.css'))
    .pipe(postcss([
      autoprefixer(),
      csswring.postcss
    ]))
    .pipe(gulp.dest(path.DEST))
    .pipe(browserSync.stream())
);

/**
 * Transpile the server code from es6 -> es5 and move it
 * from src folder to lib folder
 */
gulp.task('build-server', () => {
  gulp.src('./server/src/**/*.json')
    .pipe(gulp.dest('./server/lib'))
  return gulp.src('./server/src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('./server/lib'))
});

/**
 * Kick off a node-dev "watch" for automatic server restarts
 * when server files change
 */
gulp.task('node-dev', ['build-server'], () => {
  nodeDev('server/lib/app.js', ['--all-deps'], []);
  gulp.watch(['./server/src/**/*.js', './server/src/**/*.json'], ['build-server']);
});

/**
 * In dev mode, watch for changes in client code and Less and
 * rebuild bundle.js or style.css when these happen. Connect browserSync
 * to the node server.
 */
gulp.task('dev', ['less', 'node-dev'], () => {
  gulp.watch(['./client/**/**.less'], ['less']);
  gulp.watch('./public/index.html').on('change', browserSync.reload);

  var watcher  = watchify(browserify({
    entries: [path.ENTRY_POINT],
    transform: [babelify, 'brfs'],
    debug: true,
    cache: {},
    packageCache: {},
    fullPaths: true
  }));

  var port = process.env.PORT || 3000;
  browserSync({
    proxy: 'localhost:' + port,
    port: port + 1
  });

  return watcher.on('update', () => {
    watcher.bundle()
      .on('error', function (err) {
        gutil.log(err.message);
        this.emit('end');
      })
      .pipe(source(path.OUT))
      .pipe(gulp.dest(path.DEST))
      .pipe(browserSync.stream());
  }).bundle()
    .on('error', function (err) {
      gutil.log(err.message);
      this.emit('end');
    })
    .pipe(source(path.OUT))
    .pipe(gulp.dest(path.DEST))
    .pipe(browserSync.stream());
});
