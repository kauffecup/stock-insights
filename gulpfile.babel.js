import gulp         from 'gulp';
import gutil        from 'gulp-util';
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

var babelrcObject = {
  stage: 0,
  optional: 'runtime',
  loose: 'all',
  plugins: [
    'react-transform'
  ],
  extra: {
    'react-transform': {
      transforms: [{
        transform: 'react-transform-catch-errors',
        imports: ['react', 'redbox-react']
      }, {
        transform: 'react-transform-hmr',
        imports: ['react'],
        locals: ['module']
      }]
    }
  }
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
 * Use webpack to add sourcemaps and for hotloading our client-side code
 */
gulp.task('webpack-dev', (callback) => {
  webpack(_getWebpackConfig(false), (e, stats) => {
    if (e) throw new gutil.PluginError('webpack', e);
    gutil.log('[webpack]', stats.toString({ /* output options */ }));
    callback();
  })
});

/**
 * Use webpack to create our minified production bundle
 */
gulp.task('webpack-production', (callback) => {
  webpack(_getWebpackConfig(true), (e, stats) => {
    if (e) throw new gutil.PluginError('webpack', e);
    gutil.log('[webpack]', stats.toString({ /* output options */ }));
    callback();
  });
})

/**
 * Helper function that returns the webpack config object for both
 * production and dev environments. Maintains similarites and differences
 * between them.
 */
function _getWebpackConfig(production) {
  var config = {
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
        { test: /\.js$/, exclude: /node_modules/, loaders: [production ? 'babel' : 'babel?' + JSON.stringify(babelrcObject)]},
        { test: /\.svg$/, loaders: ['raw-loader']}
      ]
    },
    progress: true
  }
  config.devtool = production ? '' : 'inline-source-map';
  config.plugins = production ? [
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
  ] : [
    // hot reload
    new webpack.HotModuleReplacementPlugin(),
    new webpack.IgnorePlugin(/webpack-stats\.json$/),
    new webpack.DefinePlugin({
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: true,
      __DEVTOOLS__: true  // <-------- DISABLE redux-devtools HERE
    })
  ];
  return config;
}
