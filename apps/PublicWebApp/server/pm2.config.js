const path = require('path');

module.exports = {
	apps : [
		{
			name: "PublicWebAppServer",
			script: path.join(__dirname, 'index.js'),
			watch: [__dirname],
			ignore_watch: [path.join(__dirname, 'node_modules')],
			watch_options: {
				persistent: true,
				ignoreInitial: true,
				usePolling: true,
				interval: 1000,
			},
			instances: 'max',
			exec_mode: 'cluster',
			log_date_format: "YYYY-MM-DD HH:mm:ss.SSS Z",
		},
	]
};