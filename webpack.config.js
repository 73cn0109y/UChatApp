var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var helpers = require('./helpers');

var isProduction = (process.env.NODE_ENV !== 'development');

var plugins = [
	new webpack.optimize.CommonsChunkPlugin({
		name: ['app', 'vendor', 'polyfills']
	}),
	new webpack.ProvidePlugin({
		jQuery: 'jquery',
		$: 'jquery',
		jquery: 'jquery',
		'window.Tether': 'tether'
	}),
	new webpack.DefinePlugin({
		PRODUCTION: JSON.stringify(isProduction)
	})
];

if(isProduction)
	plugins.push(new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } }));

module.exports = {
	entry: {
		'polyfills': './src/polyfills.ts',
		'vendor': './src/vendor.ts',
		'app': './src/main.ts'
	},
	output: {
		filename: 'public/js/[name].js'
	},
	resolve: {
		extensions: ['', '.ts', '.js']
	},
	module: {
		loaders: [
			{
				test: /\.ts$/,
				loaders: ['ts-loader', 'angular2-template-loader']
			},
			{
				test: /\.html$/,
				loader: 'raw-loader'
			},
			{
				test: /\.scss$/,
				exclude: /node_modules/,
				loaders: ['raw-loader', 'sass-loader'] // sass-loader not scss-loader
			}
		]
	},
	plugins: plugins
};