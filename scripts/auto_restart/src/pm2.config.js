const path = require('path');

const makeApp = (nameSuffix, envSuffix) => ({
	name: "AzureAutoRestart" + nameSuffix,
	script: path.join(__dirname, "main", 'index.js'),
	watch: [path.join(__dirname, "main")],
	ignore_watch: [path.join(__dirname, 'node_modules')],
	watch_options: {
		persistent: true,
		ignoreInitial: true,
		usePolling: true,
		interval: 1000,
	},
	env: {
		ENV_SUFFIX: envSuffix || "",
	},
	instances: 1,
	exp_backoff_restart_delay: 100,
	error_file: path.join(__dirname, "error." + nameSuffix + ".log"),
	out_file: path.join(__dirname, "out." + nameSuffix + ".log"),
	log_file: path.join(__dirname, "combined." + nameSuffix + ".log"),
	log_date_format: "YYYY-MM-DD HH:mm:ss.SSS Z",
	merge_logs: true,
});

/**
 * Make two apps:
 * - One for monitoring the Stage controller.
 * - One for monitoring the Production controller.
 */
module.exports = {
	apps: [
		makeApp("Production", ".production"),
		makeApp("Stage", ".stage"),
	]
};