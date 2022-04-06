module.exports = (app) => {
	app.route(
		"/federated-auth/hwb/logout",
		async (params, ctx) => {
			ctx.clearSessId();
			ctx._koaCtx.redirect(process.env.CLA_BASE_URL);
			ctx._koaCtx.set("Content-Type", "text/html");
			return {};
		},
		{
			require_csrf_token: false,
			http_method: "get",
		}
	);
};
