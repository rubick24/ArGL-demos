const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const webpack = require('webpack')

module.exports = merge(common, {
  mode: 'development',
  output: {
    publicPath: '/'
  },
  devtool: 'source-map',
  devServer: {
    contentBase: '../dist',
    //open: flase,
    port: 8000,
    overlay: true
  },
  plugins: [
    new webpack.DefinePlugin({
      PRODUCTION: false
    })
  ]
});
