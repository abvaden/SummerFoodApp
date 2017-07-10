var path = require("path");
var fs = require("fs");

module.exports = {
  entry: './lib/bot-fulfillment/fulfillment.js',
  output: {
    path: path.join(__dirname, "dist"),
    library: "[name]",
    libraryTarget: "commonjs2",
    filename: "[name].js"
  },
  target: "node",
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: JSON.parse(
          fs.readFileSync(path.join(__dirname, ".babelrc"), {encoding: "utf8"})
        )
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  }
};