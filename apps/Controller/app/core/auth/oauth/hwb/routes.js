module.exports = async (app) => {
	require("./login")(app);
	require("./logout")(app);
	require("./merge-account-complete")(app);
	require("./merge-account-init")(app);
	require("./merge-account-resend-token")(app);
	require("./promote-account")(app);
	require("./redirect/route")(app);
};
