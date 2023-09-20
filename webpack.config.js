const path = require("path");

module.exports = {
  entry: "./src/markdown-plugin.js",
  output: {
    filename: "markdown-plugin.webpack.js",
    path: path.resolve(__dirname, "dist"),
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.js$/,
        include: /node_modules\/prismjs/,
        sideEffects: false,
      },
    ],
  },
};
