const path = require("path");
const childProcess = require("child_process");

const shellQuote = require("shell-quote").quote;

const ensureNodeVersion = require("../../../lib/misc/ensureNodeVersion");

const exec = (cmd, args, options) =>
	new Promise((resolve, reject) => {
		const child = childProcess.spawn(cmd, args, options);
		child.on("exit", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject({
					error: null,
					code: code,
				});
			}
		});
		child.on("error", (err) => {
			reject({
				error: err,
				code: -1,
			});
		});
	});

const getExtraEnv = (config, name) => {
	const ret = {};
	if (name === "dev-azure") {
		const url = config.EP_BLOG_URL.dev || config.EP_BLOG_URL.stage;
		if (url) {
			ret.EP_BLOG_URL = url;
		}
		const origin = config.ASSET_ORIGIN.dev || config.ASSET_ORIGIN.stage;
		if (origin) {
			ret.ASSET_ORIGIN = origin;
		}
		return ret;
	}
	if (name === "dev-watch") {
		ret.EP_BLOG_URL = "https://dummyimage.com";
		ret.WEBPACK_ARGS = ["--watch"];
		const origin = config.ASSET_ORIGIN.dev || config.ASSET_ORIGIN.stage;
		if (origin) {
			ret.ASSET_ORIGIN = origin;
		}
		return ret;
	}
	if (name === "live-azure") {
		ret.NODE_ENV = "production";
		if (config.EP_BLOG_URL.production) {
			ret.EP_BLOG_URL = config.EP_BLOG_URL.production;
		}
		if (config.ASSET_ORIGIN.production) {
			ret.ASSET_ORIGIN = config.ASSET_ORIGIN.production;
		}
		return ret;
	}
	if (name === "live-local") {
		ret.NODE_ENV = "production";
		if (config.EP_BLOG_URL.stage) {
			ret.EP_BLOG_URL = config.EP_BLOG_URL.stage;
		}
		if (config.ASSET_ORIGIN.stage) {
			ret.ASSET_ORIGIN = config.ASSET_ORIGIN.stage;
		}
		return ret;
	}
	if (name === "stage-azure") {
		// Currently used when pushing to Stage Azure (see '/scripts/push_to_azure')
		if (config.EP_BLOG_URL.stage) {
			ret.EP_BLOG_URL = config.EP_BLOG_URL.stage;
		}
		if (config.ASSET_ORIGIN.stage) {
			ret.ASSET_ORIGIN = config.ASSET_ORIGIN.stage;
		}
		return ret;
	}
	if (name === "stage-watch") {
		ret.WEBPACK_ARGS = ["--watch"];
		if (config.EP_BLOG_URL.stage) {
			ret.EP_BLOG_URL = config.EP_BLOG_URL.stage;
		}
		if (config.ASSET_ORIGIN.stage) {
			ret.ASSET_ORIGIN = config.ASSET_ORIGIN.stage;
		}
		return ret;
	}
	throw new Error("Unknown config name '" + name + "'");
};

ensureNodeVersion.node(16);
ensureNodeVersion.npm(8);

const env = {};
Object.assign(env, process.env);
const extraEnv = getExtraEnv(require(path.join(__dirname, "configs", process.argv[2])), process.argv[3]);
Object.assign(env, extraEnv);
const extraArgs = env.WEBPACK_ARGS;
delete extraEnv.WEBPACK_ARGS;
delete env.WEBPACK_ARGS;
(async () => {
	const args = ["webpack"];
	if (env.NODE_ENV === "production") {
		args.push("--mode", "production");
	} else {
		args.push("--mode", "development");
	}
	args.push("--progress");
	if (Array.isArray(extraArgs)) {
		for (const arg of extraArgs) {
			args.push(arg);
		}
	}
	for (let i = 4, len = process.argv.length; i < len; ++i) {
		args.push(process.argv[i]);
	}
	console.log(
		Object.keys(extraEnv)
			.map((key) => key + "=" + shellQuote([extraEnv[key]]))
			.join(" ") +
			" npx " +
			args.join(" ")
	);
	await exec("npx", args, {
		cwd: __dirname,
		stdio: "inherit",
		env: env,
	});
})();
