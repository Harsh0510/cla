const path = require("path");

module.exports = {
	apps: [
		{
			name: "Controller",
			script: path.join(__dirname, "core", "bin.js"),
			watch: [__dirname],
			ignore_watch: [
				path.join(__dirname, "core", "admin", "azure"),
				path.join(__dirname, "node_modules"),
				path.join(__dirname, "emails.txt"),
				path.join(__dirname, "core", "auth", "GeoLite2-Country.mmdb"),
				path.join(__dirname, "core", "auth", "GeoLite2-Country.mmdb.TMP"),
				path.join(__dirname, "core", "auth", "GeoLite2-Country.tmpl.mmdb"),
			],
			watch_options: {
				persistent: true,
				ignoreInitial: true,
				usePolling: true,
				interval: 1000,
			},
			instances: "max",
			exec_mode: "cluster",
			env: {
				CLA_FALLBACK_BLOB_STORAGE_ACCOUNT: "https://occclastagestorage.blob.core.windows.net",
			},
			error_file: "/home/node/logs/Controller-err.log",
			out_file: "/home/node/logs/Controller-out.log",
			log_file: "/home/node/logs/Controller-combined.log",
			log_date_format: "YYYY-MM-DD HH:mm:ss.SSS Z",
			merge_logs: true,
		},
	],
};
