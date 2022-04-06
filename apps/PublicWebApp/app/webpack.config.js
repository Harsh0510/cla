const fs = require("fs-extra");
const path = require("path");
const glob = require("glob");

const webpack = require("webpack");

const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const EventHooksPlugin = require("event-hooks-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const PreloadWebpackPlugin = require("preload-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const NODE_ENV = process.env.NODE_ENV || "development";
const OUTPUT_DIR = path.join(__dirname, "public");
const IS_DEV_MODE = NODE_ENV === "development";

if (!process.env.ASSET_ORIGIN) {
	throw new Error("You must define the endpoints as environment variables.");
}

const GOOGLE_ANALYTICS_ID = IS_DEV_MODE ? "UA-6576605-27" : "UA-6576605-28";
const GOOGLE_TAG_MANAGER_ID = IS_DEV_MODE ? "GTM-5TGVVQ7" : "GTM-K8X4ZFG";

const plugins = [
	new NodePolyfillPlugin(),
	new webpack.DefinePlugin({
		"process.env": {
			NODE_ENV: JSON.stringify(NODE_ENV),
			CLA_ENDPOINT_CONTROLLER: JSON.stringify(process.env.CLA_ENDPOINT_CONTROLLER || ""),
			ASSET_ORIGIN: JSON.stringify(process.env.ASSET_ORIGIN),
			GOOGLE_ANALYTICS_ID: JSON.stringify(GOOGLE_ANALYTICS_ID),
			GOOGLE_TAG_MANAGER_ID: JSON.stringify(GOOGLE_TAG_MANAGER_ID),
			EP_BLOG_URL: JSON.stringify(process.env.EP_BLOG_URL || ""),
		},
	}),
	new CopyPlugin({
		patterns: [
			{
				from: path.join(__dirname, "src", "copied-assets"),
				to: path.join(__dirname, "public"),
				transformPath(targetPath) {
					return targetPath;
				},
			},
		],
	}),
	new HtmlWebpackPlugin({
		template: path.join(__dirname, "src", "index.ejs"),
	}),
	new PreloadWebpackPlugin({
		rel: "preload",
		include: "allAssets",
		fileWhitelist: [/^(vendors~)?Page__(Home|Search)Page/],
	}),
	new MiniCssExtractPlugin({
		filename: "[name].[contenthash].css",
		chunkFilename: "[id].[contenthash].css",
	}),
	new EventHooksPlugin({
		run: () => {
			const pubDir = path.join(__dirname, "public");

			const files = glob.sync(path.join(__dirname, "public/**"));

			files.forEach((fp) => {
				if (fp != pubDir) {
					fs.removeSync(fp);
				}
			});
		},
		done: () => {
			/**
			 * Executes when webpack is done compiling.
			 *
			 * Necessary hack to ensure the website works with CSP because some
			 * libraries don't properly support CSP.
			 *
			 * Basically finds every instance where a script attempts to inject
			 * a style or script tag into the page, and makes sure the 'nonce'
			 * property is set to the right value.
			 *
			 * So this:
			 *
			 * foo = document.createElement("script")
			 *
			 * Will be replaced with this:
			 *
			 * foo=(function(){var x=document.createElement('script');x.setAttribute("nonce",window.__CLA_APP_NONCE__);return x;})()
			 */
			const jsFiles = glob.sync(path.join(__dirname, "public/**/*.js"));
			for (const file of jsFiles) {
				// Must search for '*.createElement' and NOT 'document.createElement' because
				// minifiers may minify 'document' to some shorter name - e.g. 'd.createElement'.
				const contents = fs
					.readFileSync(file)
					.toString()
					.replace(/\b(\w+?)\s*=\s*(\w+)\.createElement\(['"](style|script)['"]\)/g, (match, varName, docName, tagName) => {
						return `${varName}=(function(){var x=${docName}.createElement('${tagName}');x.setAttribute("nonce",window.__CLA_APP_NONCE__);return x;})()`;
					});
				// @todo Should probably make this async.
				fs.writeFileSync(file, contents);
			}
		},
	}),
];

module.exports = {
	entry: ["@babel/polyfill", path.join(__dirname, "src", "entry.js")],
	output: {
		path: OUTPUT_DIR,
		filename: "[name].bundle.[chunkhash].js",
		chunkFilename: "[name].[chunkhash].js",
		pathinfo: IS_DEV_MODE,
	},
	devtool: IS_DEV_MODE ? "inline-source-map" : "source-map",
	module: {
		rules: [
			{
				enforce: "pre", // force linting to come first
				test: /\.(js|jsx|mjs)$/,
				exclude: /node_modules/,
				use: ["eslint-loader"],
			},
			{
				test: /\.(png|jpg|jpeg|png|gif|svg|bmp|woff2?|ttf|eot|otf|mp4|ogg|webm|mp3)$/i,
				use: {
					loader: "url-loader?limit=256&esModule=false",
				},
				type: "javascript/auto",
			},
			{
				test: /\.jsx?$/,
				exclude: /node_modules\/(?!(query-string|split-on-first|strict-uri-encode)).*/,
				use: {
					loader: "babel-loader",
					options: {
						presets: [["@babel/preset-env", { useBuiltIns: "usage", corejs: "3.6.5" }], "@babel/preset-react"],
						plugins: [
							"@babel/plugin-transform-runtime",
							"@babel/plugin-syntax-dynamic-import",
							"@babel/plugin-transform-arrow-functions",
							"@babel/plugin-proposal-class-properties",
							"@babel/plugin-transform-modules-commonjs",
						],
					},
				},
			},
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: "css-loader",
						options: {
							sourceMap: true,
						},
					},
				],
			},
		],
	},
	plugins: plugins,
};
