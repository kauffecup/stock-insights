const path         = require('path');
const webpack      = require('webpack');
const autoprefixer = require('autoprefixer');

module.exports = {
  entry: [
    path.join(__dirname, '../client/index')
  ],
  output: {
    path: path.join(__dirname, '../public/'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    loaders: [
      { test: /\.svg$/, loaders: ['raw-loader']},
      // take all less files, compile them, and bundle them in with our js bundle
      { test: /\.less$/, loader: 'style!css!postcss!less' },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react'],
          plugins: [['react-transform', {
            transforms: [{
              transform: 'react-transform-hmr',
              imports: ['react'],
              // this is important for Webpack HMR:
              locals: ['module']
            }, {
              transform: 'react-transform-catch-errors',
              imports: ['react', 'redbox-react']
            }]
          }]]
        }
      }
    ]
  },
  postcss: () => [autoprefixer({ browsers: ['last 2 versions'] })],
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
};
