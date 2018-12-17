const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const BUILD_PATH = path.resolve(__dirname, 'build');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    filename: '[name].bundle.js',
    path: BUILD_PATH
  },
  watchOptions:{
    poll:5000,//监测修改的时间(ms)
    aggregateTimeout:500, //防止重复按键，500毫米内算按键一次
    ignored:/node_modules/,//不监测
  },
  devServer: {
    port: 3000,
    contentBase: BUILD_PATH,
    //host: "192.168.11.170",
    hot: true
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ]
});

