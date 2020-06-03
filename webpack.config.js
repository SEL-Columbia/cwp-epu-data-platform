/* eslint-disable import/no-commonjs*/
/* eslint-disable import/no-nodejs-modules*/
/* eslint-disable import/unambiguous*/

const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = function ({ env } = {}) {
	const output = {
		context: __dirname,
		entry: './src/index.jsx',
		output: {
			path: `${__dirname}/dist`,
			filename: '[name].js',
		},
		mode: env === 'development' ? 'development' : 'production',
		optimization: {
			minimizer: [
				new TerserPlugin({
					parallel: 2,
					terserOptions: {
						keep_classnames: true,
						keep_fnames: true,
					},
				}),
			],
			splitChunks: {},
		},
		plugins: [],
		module: {
			rules: [
				{
					test: /\.jsx?$/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								cacheDirectory: env === 'development',
								sourceType: 'unambiguous',
								presets: [
									[require.resolve('@babel/preset-react'), { useSpread: true }],
									[
										require.resolve('@babel/preset-env'),
										{
											targets: ['safari 13.1', 'firefox 68', 'chrome 80'],
											modules: false,
											bugfixes: true, // Note: will be default in Babel 8
											useBuiltIns: 'usage',
											corejs: { version: 3, proposals: true },
										},
									],
								],
								plugins: [
									require.resolve('@babel/plugin-proposal-class-properties'),
									require.resolve('@babel/plugin-proposal-export-namespace-from'),
									require.resolve('@babel/plugin-proposal-export-default-from'),
								],
							},
						},
					],
				},
				{
					test: /\.css$/,
					exclude: /node_modules/,
					use: [
						{ loader: 'style-loader' },
						{
							loader: 'css-loader',
							options: {
								modules: {
									localIdentName: '[name]_[local]-[hash:base64:3]',
								},
								// url: false,
								importLoaders: 1,
							},
						},
						'postcss-loader',
					],
				},
				{
					test: /\.css$/,
					include: /node_modules/,
					sideEffects: true,
					loader: 'style-loader!css-loader',
				},
			],
		},
		resolve: {
			modules: [`${__dirname}/src`, `node_modules`, __dirname],
			extensions: ['*', '.js', '.jsx'],
		},
	};

	if (env === 'development') {
		output.devtool = 'cheap-module-eval-source-map';
	}

	return output;
};
