const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const SRC_PATH = path.resolve(__dirname, 'src/main');
const BUILD_PATH = path.resolve(__dirname, 'build');

module.exports = {
	entry: {
		pixicomponent: SRC_PATH + '/component/index.js',
		main: SRC_PATH + '/index.js'
	},
	plugins: [
		new CleanWebpackPlugin([BUILD_PATH]),
		new CopyWebpackPlugin([{
			from: SRC_PATH + '/images',
			to: BUILD_PATH + '/images'
		}]),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: SRC_PATH + '/index.html',
			chunks:['pixicomponent','main']
		})
	],
	module: {
		rules: [
		  {
			test: /\.js$/,
			exclude: /(node_modules|bower_components)/,
			use: {
				loader: 'babel-loader'
			}
		  },
		  {
			test: /\.css$/,
			use: [
				'style-loader',
				'css-loader'
			]
		  },
		  {
			test: /\.(png|svg|jpg|gif|json)$/,
			use: [
			  {
				loader: 'file-loader',
				options: {
					name: '[name].[ext]',
					outputPath: 'images/'
				}
			  }
			 ]
		  },
		  {
			test: /\.xml$/,
			use: [
				'xml-loader'
			]
		  }
		]
	},
	externals: {
		'pixi.js': 'pixi.js',
		'Moment': 'moment'
	}	
};

