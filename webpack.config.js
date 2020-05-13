const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
      { test: /\.gif$|.png$/, loader: 'file-loader' },
      { test: /\.css$/i, use: ['style-loader', 'css-loader']}
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/assets/index.html',
      chunks: ['main'],
    }),
    new HtmlWebpackPlugin({
      template: 'src/assets/webrtc.html',
      filename: 'webrtc.html',
      chunks: ['webrtc'],
    }),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  }
}
