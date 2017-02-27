const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, '../rnstl-cli.js'),
  output: {
    filename: 'rnstl-cli.js',
    path: path.resolve(__dirname, '../../dist'),
  },
  target: 'node',
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
