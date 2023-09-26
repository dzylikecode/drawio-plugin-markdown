const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "markdown-plugin.webpack.js",
    path: path.resolve(__dirname, "dist"),
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /^raw-loader!/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
