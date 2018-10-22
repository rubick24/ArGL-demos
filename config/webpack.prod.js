const path = require('path')
const merge = require('webpack-merge')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const webpack = require('webpack')

const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'production',
  output: {
    filename: '[name]/bundle.js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/argl-demos/'
  },
  optimization: {
    minimizer: [new UglifyJSPlugin()]
  },
  plugins: [
    new webpack.DefinePlugin({
      PRODUCTION: true
    })
  ]
});
