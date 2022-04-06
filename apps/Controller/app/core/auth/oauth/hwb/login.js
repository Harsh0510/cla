const crypto = require("crypto");

const env = require("./common/env");
const hmac = require("./common/hmac");

const sha256 = (str) => {
	return crypto.createHash("sha256").update(str).digest();
};

const encode = (buf) => {
	return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

module.exports = (app) => {
	app.route(
		"/auth/oauth/hwb/login",
		async (params, ctx) => {
			const row = (
				await ctx.appDbQuery(`
					INSERT INTO
						oauth_challenge
					DEFAULT VALUES
					RETURNING
						oid,
						challenge
				`)
			).rows[0];
			const state = row.oid + "_" + hmac(row.oid);

			const u = new URL(env.authorizeEndpoint);
			u.searchParams.append("client_id", env.clientId);
			u.searchParams.append("response_type", "code");
			u.searchParams.append("redirect_uri", env.redirectUri);
			u.searchParams.append("scope", env.scope);
			u.searchParams.append("response_mode", "query");
			u.searchParams.append("state", state);
			u.searchParams.append("code_challenge", encode(sha256(row.challenge)));
			u.searchParams.append("code_challenge_method", "S256");
			ctx._koaCtx.redirect(u.toString());
			ctx._koaCtx.set("Content-Type", "text/html");
			return {};
		},
		{
			require_csrf_token: false,
			http_method: "get",
		}
	);
};
