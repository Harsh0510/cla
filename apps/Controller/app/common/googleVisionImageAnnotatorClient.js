const vision = require("@google-cloud/vision");

class Client extends vision.ImageAnnotatorClient {
	/**
	 * @param {object} [opts] Optional parameters.
	 * @param {{client_email: string, private_key: string}} [opts.creds] Optional credentials.
	 * Falls back to checking the `CLA_GOOGLE_CLOUD_CREDS` environment variable if not provided.
	 * @param {string} [opts.project_id] Optional project ID within the Google console.
	 * Falls back to checking `CLA_GOOGLE_CLOUD_PROJECT_ID` if opts.project_id is not provided.
	 * Otherwise uses the default project ID.
	 */
	constructor(opts) {
		const creds = {
			client_email: null,
			private_key: null,
		};
		if (opts && opts.creds) {
			creds.client_email = opts.creds.client_email;
			creds.private_key = opts.creds.private_key;
		} else if (process.env.CLA_GOOGLE_CLOUD_CREDS) {
			const parsed = JSON.parse(process.env.CLA_GOOGLE_CLOUD_CREDS);
			creds.client_email = parsed.client_email;
			creds.private_key = parsed.private_key;
		}
		const clientOpts = {
			credentials: {
				client_email: creds.client_email,
				private_key: creds.private_key,
			},
		};
		if (opts && opts.project_id) {
			clientOpts.projectId = opts.project_id;
		} else if (process.env.CLA_GOOGLE_CLOUD_PROJECT_ID && process.env.CLA_GOOGLE_CLOUD_PROJECT_ID.trim()) {
			clientOpts.projectId = process.env.CLA_GOOGLE_CLOUD_PROJECT_ID.trim();
		}
		super(clientOpts);
	}
}

module.exports = new Client();
