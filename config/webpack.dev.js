const merge = require('webpack-merge');
const common = require('./webpack.common.js');
module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    contentBase: '../dist',
    //open: flase,
    port: 8000,
    overlay: true
  }
});
