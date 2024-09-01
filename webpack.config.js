const slsw = require("serverless-webpack");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: slsw.lib.entries,
  target: "node",
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({ terserOptions: { keep_classnames: true } })],
    splitChunks: {
      chunks: "all",
      minSize: 10000,
      maxSize: 250000,
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        include: path.resolve(__dirname, "src"),
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        include: __dirname,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.mjs$/,
        resolve: { mainFields: ["default"] },
      },
    ],
  },
  resolve: {
    mainFields: ["main", "browser"],
    symlinks: false,
    extensions: [".ts", ".js", ".json"],
    alias: {
      "bignumber.js$": "bignumber.js/bignumber.js",
      "node-fetch$": "node-fetch/lib/index.js",
    },
  },
};
