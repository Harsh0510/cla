const { Pool } = require("./pg");
const os = require("os");

const Koa = require("koa");
const KoaRouter = require("koa-router");
const cors = require("@koa/cors");
const koaBody = require("koa-body");

const File = require("./File");
const RequestContext = require("./RequestContext");

module.exports = class {
	_checkCsrfToken(ctx) {
		if (ctx.method !== "options" && ctx.method !== "head") {
			const csrf = ctx.request.get("X-CSRF");
			ctx.assert(csrf === "y", 400, "CSRF token not supplied");
		}
	}

	constructor(settings) {
		const allowedCorsDomains = Object.create(null);
		let hasExplicitAllowedCorsDomains = false;
		if (settings && Array.isArray(settings.allowed_cors_domains)) {
			hasExplicitAllowedCorsDomains = settings.allowed_cors_domains.length > 0;
			for (const origin of settings.allowed_cors_domains) {
				allowedCorsDomains[origin] = true;
			}
		}
		const koa = new Koa();
		if (process.env.CLA_IS_PROXY) {
			koa.proxy = true;
		}

		this._koaRouter = new KoaRouter();

		// Enable CORS.
		koa.use(
			cors({
				origin: (ctx) => {
					if (allowedCorsDomains[ctx.request.header.origin]) {
						return ctx.request.header.origin;
					}
					return hasExplicitAllowedCorsDomains ? settings.allowed_cors_domains[0] : ctx.request.header.origin;
				},
				credentials: true,
			})
		);

		this.koa = koa;
		this._defaultResponseHeaders = Object.create(null);
		if (settings.default_response_headers) {
			Object.assign(this._defaultResponseHeaders, settings.default_response_headers);
		}
	}

	async init() {
		this._appDbPool = await new Pool({
			user: process.env.CLA_AM_DB_USER,
			host: process.env.CLA_AM_DB_HOST,
			database: process.env.CLA_AM_DB_DB,
			password: process.env.CLA_AM_DB_PASS,
			port: process.env.CLA_AM_DB_PORT,
			ssl: !!process.env.CLA_AM_DB_SSL,
		});
		this._sessionDbPool = await new Pool({
			user: process.env.CLA_SESSION_DB_USER,
			host: process.env.CLA_SESSION_DB_HOST,
			database: process.env.CLA_SESSION_DB_DB,
			password: process.env.CLA_SESSION_DB_PASS,
			port: process.env.CLA_SESSION_DB_PORT,
			ssl: !!process.env.CLA_SESSION_DB_SSL,
		});
	}

	getAppDbPool() {
		return this._appDbPool;
	}

	getSessionDbPool() {
		return this._sessionDbPool;
	}

	use(middleware) {
		return this.koa.use(middleware);
	}

	_logError(err) {
		const statusCode = (err.status || 0).toString();
		const msg = (err.message || "").toString();
		const stack = (err.stack || "").toString();
		console.log(`[${statusCode}] ${msg} ${stack}`);
	}

	_loadDefaultHeaders(reqContext) {
		for (const headerName in this._defaultResponseHeaders) {
			reqContext._koaCtx.response.set(headerName, this._defaultResponseHeaders[headerName]);
		}
	}

	route(endpoint, callback, options) {
		const settings = {
			require_csrf_token: true,
			include_unparsed: false,
			http_method: "post",
		};
		Object.assign(settings, options || {});
		let koaBodyOptions = undefined;
		if (settings.include_unparsed) {
			koaBodyOptions = koaBodyOptions || {};
			koaBodyOptions.includeUnparsed = true;
		}
		const executeMain = async (ctx) => {
			ctx.set("Content-Type", "application/json");
			const params = (settings.http_method === "post" ? ctx.request.body : ctx.request.query) || {};
			const reqContext = new RequestContext(ctx, this._appDbPool, this._sessionDbPool);
			let response;
			try {
				response = await callback(params, reqContext);
			} catch (e) {
				this._logError(e);
				throw e;
			}
			if (typeof response === "object") {
				response = JSON.stringify(response);
			}
			ctx.body = response;
			this._loadDefaultHeaders(reqContext);
		};
		let execute;
		if (settings.require_csrf_token) {
			execute = async (ctx) => {
				this._checkCsrfToken(ctx);
				await executeMain(ctx);
			};
		} else {
			execute = executeMain;
		}
		return this._koaRouter[settings.http_method](endpoint, koaBody(koaBodyOptions), execute);
	}

	binaryRoute(endpoint, callback, options) {
		const settings = {
			max_file_size: 4 * 1024 * 1024,
			upload_dir: os.tmpdir(),
			require_csrf_token: true,
			http_method: "post",
		};
		Object.assign(settings, options || {});
		const executeMain = async (ctx) => {
			ctx.set("Content-Type", "application/json");
			const paramsRaw = ctx.request.body;
			const files = ctx.request.files || {};
			const reqContext = new RequestContext(ctx, this._appDbPool, this._sessionDbPool);
			let params;
			if (paramsRaw && paramsRaw.__DATA__ && typeof paramsRaw.__DATA__ === "string") {
				params = JSON.parse(paramsRaw.__DATA__) || {};
			} else {
				params = {};
			}
			for (const k in files) {
				if (Object.prototype.hasOwnProperty.call(files, k)) {
					if (Array.isArray(files[k])) {
						params[k] = [];
						for (const f of files[k]) {
							params[k].push(new File(f));
						}
					} else {
						params[k] = new File(files[k]);
					}
				}
			}
			let response;
			try {
				response = await callback(params, reqContext);
			} catch (e) {
				this._logError(e);
				throw e;
			}
			if (typeof response === "object") {
				response = JSON.stringify(response);
			}
			ctx.body = response;
			this._loadDefaultHeaders(reqContext);
		};
		let execute;
		if (settings.require_csrf_token) {
			execute = async (ctx) => {
				this._checkCsrfToken(ctx);
				await executeMain(ctx);
			};
		} else {
			execute = executeMain;
		}
		return this._koaRouter[settings.http_method](
			endpoint,
			koaBody({
				multipart: true,
				formidable: {
					maxFileSize: settings.max_file_size,
					multiples: true,
					uploadDir: settings.upload_dir,
				},
			}),
			execute
		);
	}

	bind(port) {
		this.use(this._koaRouter.routes());
		return this.koa.listen(port);
	}
};

module.exports.RequestContext = RequestContext;
module.exports.File = File;
