const path = require("path");
const dotenv = require("dotenv");
const crypto = require("crypto");

const loadEnv = (name) => {
	const result = dotenv.config({
		path: path.join(__dirname, "..", name),
	});

	if (result && result.parsed) {
		Object.assign(process.env, result.parsed);
	}
};

loadEnv(".env");
loadEnv("env.conf");

const App = require("#tvf-app");
const AsyncTaskRunner = require("../common/asyncTaskRunner/AsyncTaskRunner");
const main = require("./index");

(async () => {
	let allowedCorsDomains;
	if (!process.env.IS_AZURE || !process.env.CLA_BASE_URL) {
		allowedCorsDomains = null;
	} else {
		const u = new URL(process.env.CLA_BASE_URL);
		allowedCorsDomains = [u.origin];
		if (process.env.CLA_ALLOWED_CORS_ORIGINS) {
			const extraOrigins = process.env.CLA_ALLOWED_CORS_ORIGINS.trim().split(/\s*;\s*/);
			for (const origin of extraOrigins) {
				allowedCorsDomains.push(origin);
			}
		}
	}
	const defaultResponseHeaders = {
		"X-Content-Type-Options": "nosniff",
	};
	if (process.env.IS_AZURE && process.env.CLA_CANONICAL_DOMAIN) {
		defaultResponseHeaders["Strict-Transport-Security"] = "max-age=31536000";
	}
	if (process.env.CLA_EXTRA_RESPONSE_HEADERS) {
		let extraResponseHeaders;
		try {
			extraResponseHeaders = JSON.parse(process.env.CLA_EXTRA_RESPONSE_HEADERS);
		} catch (e) {}
		if (extraResponseHeaders) {
			Object.assign(defaultResponseHeaders, extraResponseHeaders);
		}
	}
	const app = new App({
		allowed_cors_domains: allowedCorsDomains,
		default_response_headers: defaultResponseHeaders,
	});
	app.koa.use(async (ctx, next) => {
		const requestId = crypto.randomBytes(15).toString("base64");
		const sqlDate = (dt) => {
			const y = dt.getFullYear().toString();
			const m = (dt.getMonth() + 1).toString().padStart(2, "0");
			const d = dt.getDate().toString().padStart(2, "0");
			const h = dt.getHours().toString().padStart(2, "0");
			const min = dt.getMinutes().toString().padStart(2, "0");
			const s = dt.getSeconds().toString().padStart(2, "0");
			const mm = dt.getMilliseconds().toString().padStart(3, "0");
			return y + "-" + m + "-" + d + " " + h + ":" + min + ":" + s + "." + mm;
		};
		const start = new Date();
		const url = (ctx.originalUrl || "").slice(0, 256);
		const ip = (() => {
			if (process.env.IS_AZURE === "1" && ctx.request.headers["x-client-ip"]) {
				return ctx.request.headers["x-client-ip"];
			}
			return ctx.request.ip;
		})();
		const userAgent = (ctx.headers["user-agent"] || "").slice(0, 256);
		const logEnd = (err) => {
			const status = err ? 500 : ctx.status;
			const timeTaken = Date.now() - start.getTime();
			console.log(requestId + " : END : " + sqlDate(new Date()) + " : " + url + " : " + status + " : " + timeTaken + "ms");
		};
		console.log(requestId + " : START : " + sqlDate(start) + " : " + url + " : " + ip + " : " + userAgent);
		try {
			await next();
		} catch (e) {
			logEnd(e);
			throw e;
		}
		const done = () => {
			ctx.res.removeListener("finish", done);
			ctx.res.removeListener("close", done);
			logEnd();
		};
		ctx.res.once("finish", done);
		ctx.res.once("close", done);
	});
	await app.init();
	const asyncRunner = new AsyncTaskRunner(app.getAppDbPool());
	await main(app, asyncRunner);
	if (process.env.NODE_APP_INSTANCE === "0") {
		asyncRunner.execute();
	}
	app.bind(80);
})();
