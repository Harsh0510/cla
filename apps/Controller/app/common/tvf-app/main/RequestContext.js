const getCookieOpts = (opts) => {
	const cookieOpts = {
		overwrite: true,
		httpOnly: true,
	};
	if (process.env.CLA_COOKIE_SAME_SITE) {
		cookieOpts.sameSite = process.env.CLA_COOKIE_SAME_SITE;
	}
	if (process.env.CLA_COOKIE_SECURE) {
		cookieOpts.secure = true;
	}
	return Object.assign(cookieOpts, opts || {});
};

const updateSessionQuery = `
	UPDATE
		cla_session
	SET
		expiry_date = NOW() + interval '30 minutes'
	WHERE
		token = $1
		AND expiry_date > NOW()
	RETURNING
		data
`;

const selectSessionQuery = `
	SELECT
		data
	FROM
		cla_session
	WHERE
		token = $1
		AND expiry_date > NOW()
`;

module.exports = class {
	constructor(koaCtx, appDbPool, sessionDbPool) {
		this._koaCtx = koaCtx;
		this._appDbPool = appDbPool;
		this._sessionDbPool = sessionDbPool;
	}

	setCookie(name, value, opts) {
		this._koaCtx.cookies.set(name, value, getCookieOpts(opts));
	}

	assert(expr, statusCode, msg) {
		return this._koaCtx.assert(expr, statusCode, msg);
	}

	throw(statusCode, msg) {
		return this._koaCtx.throw(statusCode, msg);
	}

	getAppDbPool() {
		return this._appDbPool;
	}

	appDbQuery(a, b) {
		return this._appDbPool.query(a, b);
	}

	getSessionDbPool() {
		return this._sessionDbPool;
	}

	sessionDbQuery(a, b) {
		return this._sessionDbPool.query(a, b);
	}

	async addSessIdToResponse(sessionToken) {
		let sessId = sessionToken;
		if (!sessId) {
			sessId = await this.getSessionId();
		}
		if (!sessId) {
			sessId = null;
		}
		this.setCookie("XSESSID", sessId, {
			maxAge: 24 * 60 * 60 * 1000,
		});
	}

	clearSessId() {
		this.setCookie("XSESSID", null);
	}

	overrideSessionId(token) {
		this._overridenSessionToken = token;
	}

	async getSessionDataAndId(cached = true) {
		if (cached && typeof this._cachedSessionDataAndId !== "undefined") {
			return this._cachedSessionDataAndId;
		}
		this._cachedSessionDataAndId = null;
		const sessId = this._overridenSessionToken || this._koaCtx.cookies.get("XSESSID");
		if (!sessId) {
			return (this._cachedSessionDataAndId = null);
		}
		if (sessId.length !== 48) {
			return (this._cachedSessionDataAndId = null);
		}
		let result;
		try {
			/**
			 * Get session data by token
			 */
			result = await this.sessionDbQuery(this.doNotUpdateSessionExpiry ? selectSessionQuery : updateSessionQuery, [sessId]);
		} catch (e) {
			return (this._cachedSessionDataAndId = null);
		}
		if (!Array.isArray(result.rows)) {
			return (this._cachedSessionDataAndId = null);
		}
		if (result.rows.length !== 1) {
			return (this._cachedSessionDataAndId = null);
		}
		this._cachedSessionDataAndId = {
			id: sessId,
			data: result.rows[0].data,
		};
		return this._cachedSessionDataAndId;
	}

	async getSessionData(cached = true) {
		const data = await this.getSessionDataAndId(cached);
		if (!data) {
			return null;
		}
		return data.data;
	}

	async getSessionId(cached = true) {
		const data = await this.getSessionDataAndId(cached);
		if (!data) {
			return null;
		}
		return data.id;
	}

	async isLoggedIn() {
		const sessionData = await this.getSessionData();
		return sessionData && sessionData.user_id > 0;
	}

	async ensureLoggedIn() {
		const isLoggedIn = await this.isLoggedIn();
		this.assert(isLoggedIn, 401, "Unauthorized");
	}

	async getUserRole() {
		const sessionData = await this.getSessionData();
		if (!sessionData) {
			return null;
		}
		return sessionData.user_role;
	}

	getClientIp() {
		if (process.env.IS_AZURE === "1" && this._koaCtx.request.headers["x-client-ip"]) {
			return this._koaCtx.request.headers["x-client-ip"];
		}
		return this._koaCtx.request.ip;
	}

	async ensureClaAdminRequest() {
		if (process.env.IS_AZURE) {
			const userRole = await this.getUserRole();
			this.assert(userRole === "cla-admin", 401, "Unauthorized");
		}
	}
};
