import gulp         from 'gulp';
import gutil        from 'gulp-util';
import source       from 'vinyl-source-stream';
import buffer       from 'vinyl-buffer';
import less         from 'gulp-less';
import postcss      from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csswring     from 'csswring';
import concatCss    from 'gulp-concat-css';
import babel        from 'gulp-babel';
import webpack      from 'webpack';

var path = {
  OUT: 'bundle.js',
  DEST: './public',
  ENTRY_POINT: './client/index.js'
}

/**
 * To build, create bundle.js and style.css
 */
gulp.task('build', ['webpack-production', 'less', 'build-server']);

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
 * Use webpack to create our minified production bundle
 */
gulp.task('webpack-production', (callback) => {
  webpack({
    entry: {
      main: [
        path.ENTRY_POINT
      ]
    },
    output: {
      path: path.DEST,
      filename: path.OUT
    },
    module: {
      loaders: [
        { test: /\.js$/, exclude: /node_modules/, loaders: ['babel']},
        { test: /\.svg$/, loaders: ['raw-loader']}
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          // Useful to reduce the size of client-side libraries, e.g. react
          NODE_ENV: JSON.stringify('production')
        }
      }),

      // optimizations
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  }, (e, stats) => {
    if (e) throw new gutil.PluginError('webpack', e);
    gutil.log('[webpack]', stats.toString({ /* output options */ }));
    callback();
  });
})
