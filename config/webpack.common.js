const fs = require('fs')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const dirs = fs.readdirSync('./src/')
dirs.splice(dirs.indexOf('assets'), 1)
dirs.splice(dirs.indexOf('index.html'), 1)
dirs.splice(dirs.indexOf('index.js'), 1)
dirs.splice(dirs.indexOf('styles.js'), 1)

const entry = { main: './src/index.js' }
dirs.forEach(v => {
  entry[v] = './src/' + v + '/index.js'
})

const HTMLPlugins = dirs.map(v => {
  return new HtmlWebpackPlugin({
    chunks: [v],
    title: 'Argl demos ' + v,
    filename: v + '/index.html',
    template: 'src/index.html'
  })
})


module.exports = {
  entry: entry,
  output: {
    filename: '[name]/bundle.js',
    path: path.resolve(__dirname, '../dist')
  },
  resolve: {
    extensions: [".js", ".json"]
  },
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|gif|bin)$/,
        use: [{
          loader: 'file-loader',
          options: {
            outputPath: 'assets/'
          }
        }]
      },
      {
        test: /\.(glsl|vs|fs|obj|txt)$/,
        use: 'raw-loader'
      },
      {
        test: /\.(json|gltf)$/,
        loader: 'json-loader'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], {
      root: path.resolve(__dirname, '../'),
    }),
    new HtmlWebpackPlugin({
      chunks: ['main'],
      filename: 'index.html',
      template: 'src/index.html'
    }),
    ...HTMLPlugins
  ]
}
