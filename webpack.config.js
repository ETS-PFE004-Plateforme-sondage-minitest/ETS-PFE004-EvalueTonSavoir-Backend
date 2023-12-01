const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  // The environment in which the bundle should run
  // Changes chunk loading behavior and available modules
  target: "node",

  // The entry point of your application
  entry: "./app.js", // Update this to your main server file

  // Where to output the bundles and how to name them
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "server.bundle.js",
  },

  // Configure how modules are resolved
  resolve: {
    extensions: [".js"], // Add other extensions if needed
  },

  // Generate source maps for debugging (optional)
  devtool: "inline-source-map",

  // Externalize app dependencies. This makes the server build much faster
  // and generates a smaller bundle file
  externals: [nodeExternals()],

  // Configure how the different types of modules within a project will be treated
  module: {
    rules: [
      {
        // Use babel-loader for our JS files
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      // Add other rules for other file types if needed
    ],
  },
  mode: "development",
};
