const path = require("path");

const envs = Object.create(null);
Object.assign(envs, {
	TZ: "UTC",
});

module.exports = {
	apps: [
		{
			name: "BornDigitalApiController",
			script: path.join(__dirname, "dist", "index.js"),
			watch: [path.join(__dirname, "dist")],
			watch_options: {
				persistent: true,
				ignoreInitial: true,
				usePolling: true,
				interval: 1000,
			},
			instances: "max",
			exec_mode: "cluster",
			env: envs,
			log_date_format: "YYYY-MM-DD HH:mm:ss.SSS Z",
			merge_logs: true,
		},
		{
			name: "AsyncTaskRunner",
			script: path.join(__dirname, "dist", "asyncRunnerBin.js"),
			watch: [path.join(__dirname, "dist")],
			ignore_watch: [path.join(__dirname, "src")],
			watch_options: {
				persistent: true,
				ignoreInitial: true,
				usePolling: true,
				interval: 1000,
			},
			instances: 1,
			env: envs,
			log_date_format: "YYYY-MM-DD HH:mm:ss.SSS Z",
			merge_logs: true,
			max_memory_restart: "300M",
		},
	],
};
