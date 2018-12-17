const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
	output: {
		filename: '[name].bundle.js',
		path: BUILD_PATH
	},
	mode: 'production'
	//devtool: 'source-map'
});

