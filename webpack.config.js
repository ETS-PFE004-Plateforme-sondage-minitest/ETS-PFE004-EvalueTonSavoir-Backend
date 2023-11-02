// webpack.config.js
const path = require('path');

module.exports = {
  target: 'node',
  entry: './app.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
