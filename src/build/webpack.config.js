const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, '../index.js'),
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, '../../dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
        },
      },
    ],
  },
};
