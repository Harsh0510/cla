module.exports = class {
	getDefaultSessionData() {
		return {
			user_id: 4,
			user_role: "cla-admin",
			school_id: 0,
			allowed_extract_ratio: 0.05,
			academic_year_end: [8, 15],
			user_email: "userloginemail@email.com",
		};
	}

	assert(expr, status, msg) {
		if (expr) {
			return;
		}
		this.responseStatus = status;
		throw new Error(`${status} ::: ${msg}`);
	}

	throw(status, msg) {
		this.responseStatus = status;
		throw new Error(`${status} ::: ${msg}`);
	}

	constructor(opts) {
		this.sessionData = this.getDefaultSessionData();
		(this._koaCtx = {
			request: {
				socket: {
					setTimeout: () => {},
				},
			},
			cookies: {
				set: () => {},
				get: () => {},
			},
		}),
			(this.responseStatus = 200);
		this.body = null;
	}

	doAppQuery() {}

	doSessionQuery() {}

	getSessionData() {
		return new Promise((resolve, reject) => {
			resolve(this.sessionData);
		});
	}

	getUserRole() {
		return new Promise((resolve, reject) => {
			resolve(this.sessionData ? this.sessionData.user_role : null);
		});
	}

	getClientIp() {
		return "127.0.0.1";
	}

	async isLoggedIn() {
		const sessionData = await this.getSessionData();
		return sessionData && sessionData.user_id > 0;
	}

	async ensureClaAdminRequest() {
		const userRole = this.sessionData ? this.sessionData.user_role : null;
		this.assert(userRole === "cla-admin", 401, "Unauthorized");
	}

	async ensureLoggedIn() {
		const isLoggedIn = await this.isLoggedIn();
		this.assert(isLoggedIn, 401, "Unauthorized");
	}

	getAppDbPool() {
		return {
			connect: () => {
				return new Promise((resolve, reject) => {
					resolve({
						query: this.appDbQuery.bind(this),
						release: () => {},
					});
				});
			},
		};
	}

	getSessionDbPool() {
		return {
			connect: () => {
				return new Promise((resolve, reject) => {
					resolve({
						query: this.sessionDbQuery.bind(this),
						release: () => {},
					});
				});
			},
		};
	}

	appDbQuery(query, values) {
		query = query.trim().replace(/\s+/g, " ");
		return new Promise((resolve, reject) => {
			if (query === "BEGIN" || query === "COMMIT" || query === "ROLLBACK") {
				resolve();
				return;
			}
			let result;
			try {
				result = this.doAppQuery(query, values);
			} catch (e) {
				reject(e);
				return;
			}
			if (Array.isArray(result)) {
				result = {
					rows: result,
					rowCount: result.length,
				};
			}
			resolve(result);
		});
	}

	sessionDbQuery(query, values) {
		query = query.trim().replace(/\s+/g, " ");
		return new Promise((resolve, reject) => {
			if (query === "BEGIN" || query === "COMMIT" || query === "ROLLBACK") {
				resolve();
				return;
			}
			let result;
			try {
				result = this.doSessionQuery(query, values);
			} catch (e) {
				reject(e);
				return;
			}
			if (Array.isArray(result)) {
				result = {
					rows: result,
					rowCount: result.length,
				};
			}
			resolve(result);
		});
	}
};
