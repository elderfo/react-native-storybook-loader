const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, '../rnstl-cli.js'),
  output: {
    filename: 'rnstl-cli.js',
    path: path.resolve(__dirname, '../../dist'),
  },
  target: 'node',
  node: {
    __dirname: true,
    __filename: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: ['shebang-loader', 'babel-loader?presets=es2015'],
      },
    ],
  },
};
