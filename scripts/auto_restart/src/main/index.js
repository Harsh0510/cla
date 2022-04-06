/**
 * Do not execute this directly (e.g. `node index.js`). Use pm2 instead!
 */

const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const pg = require("pg");
const axios = require("axios");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

const exec = require("./lib/exec");

/**
 * Fetch the options from an env file, starting at `startDir` and working upwards to the root.
 * @param {string} startDir Start directory
 * @param {string} fileName File name (e.g. '.env')
 */
const getEnvRecursive = (startDir, fileName) => {
	let curr = startDir;
	while (true) {
		try {
			return dotenv.parse(fs.readFileSync(path.join(curr, fileName)));
		} catch (e) { }
		const newCurr = path.dirname(curr);
		if (newCurr === curr) {
			break;
		}
		if (!newCurr) {
			break;
		}
		curr = newCurr;
	}
	return {};
};

const getEnv = (fp) => {
	try {
		return dotenv.parse(fs.readFileSync(fp));
	} catch (e) {
		return {};
	}
};

const getSettings = async () => {
	const argv = require("yargs")(process.argv).help(false).argv;
	if (argv.help) {
		const helpText = await getHelp();
		process.stdout.write(helpText);
		process.exit(0);
	}
	const envSuffix = process.env.ENV_SUFFIX ? process.env.ENV_SUFFIX.trim() : "";
	const allProps = Object.create(null);
	Object.assign(allProps, getEnv("/etc/.cla-ep-auto-restart.env"));
	Object.assign(allProps, getEnv("/etc/.cla-ep-auto-restart.env" + envSuffix));
	Object.assign(allProps, process.env);
	Object.assign(allProps, getEnv(path.join(os.homedir(), ".cla-ep-auto-restart.env")));
	Object.assign(allProps, getEnv(path.join(os.homedir(), ".cla-ep-auto-restart.env" + envSuffix)));
	Object.assign(allProps, getEnvRecursive(__dirname, ".env"));
	Object.assign(allProps, getEnvRecursive(__dirname, ".env" + envSuffix));
	if (argv.envFile) {
		Object.assign(allProps, getEnv(argv.envFile));
	}
	Object.assign(allProps, argv);
	return allProps;
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const ping = async (endpoint) => {
	let numTries = 0;
	let waitPeriod = 300;

	/**
	 * Try pinging for up to 5 minutes.
	 * Do not make this any shorter!
	 * Otherwise when you push updates to Stage/Production and the server goes
	 * down temporarily while it's updating, this script might think the server
	 * is 'down' and try restarting it.
	 */
	const end = Date.now() + 5 * 60 * 1000;
	while (Date.now() < end) {
		numTries++;
		try {
			const result = await axios.post(
				endpoint,
				{},
				{
					headers: {
						"X-CSRF": "y"
					},
					timeout: 15000,
				}
			);
			if (result.data.success) {
				return {
					success: true,
					num_tries: numTries,
				};
			}
		} catch (e) { }
		// Exponential backoff, with maximum delay of 10s.
		waitPeriod = Math.min(10 * 1000, waitPeriod * 1.5);
		const secondsLeft = Math.ceil((end - Date.now()) * 0.001);
		console.log("Ping attempt failed on try " + numTries + ", waiting for " + waitPeriod + "ms before trying again (" + secondsLeft + "s remaining)...");
		await wait(waitPeriod);
	}
	console.log("Ping attempts all failed after try " + numTries);
	return {
		success: false,
		num_tries: numTries,
	};
};

const restartAzureService = async (username, password, tenant, serviceName, resourceGroup) => {
	console.log("Logging in to restart service...");
	await exec("az", ["login", "--service-principal", "-u", username, "-p", password, "--tenant", tenant]);
	console.log("Login successful! Now issuing restart command...");
	await exec("az", ["webapp", "restart", "--name", serviceName, "--resource-group", resourceGroup]);
	console.log("Restart command issued successfully!");
};

class EmailClient {
	constructor(user, password, host, port) {
		this.server = nodemailer.createTransport({
			host: host,
			secure: true,
			port: port || 465,
			auth: {
				user: user,
				pass: password,
			},
		});
	}

	send(from, to, subject, htmlBody) {
		return this.server.sendMail({
			from: from,
			to: to,
			subject: subject,
			html: htmlBody,
			headers: {
				"X-SMTPAPI": JSON.stringify({
					category: ["azure-service-notification"],
				}),
			},
		});
	}
};

const sendEmails = (() => {
	let client = null;
	return async (smtpDetails, recipientEmails, azureServiceName, azureResourceGroup) => {
		if (client === null) {
			client = new EmailClient(
				smtpDetails.username,
				smtpDetails.password,
				smtpDetails.host,
				smtpDetails.port
			);
		}
		let index = 1;
		for (const email of recipientEmails) {
			console.log("Sending email to recipient #" + index);
			await client.send(
				"no-reply@educationplatform.co.uk",
				email,
				`Education Platform: Azure service '${azureServiceName}' (${azureResourceGroup}) just began restarting`,
				`Azure service '${azureServiceName}' (${azureResourceGroup}) just began restarting because it stopped responding.`
			);
			console.log("Sent email to recipient #" + index);
			index++;
		}
	};
})();

const insertPingResultIntoDatabase = (() => {
	let dbClient = null;
	return async (dbDeets, endpoint, timeTaken, didSucceed, numTries) => {
		if (!dbClient) {
			const opts = {};
			Object.assign(opts, dbDeets);
			Object.assign(opts, {
				statement_timeout: 30000,
				query_timeout: 30000,
				connectionTimeoutMillis: 30000,
				idle_in_transaction_session_timeout: 30000,
			});
			dbClient = new pg.Client(opts);
			await dbClient.connect();
		}
		await dbClient.query(
			`
				INSERT INTO
					uptime_log_item
					(
						endpoint,
						time_taken,
						success,
						num_tries
					)
				VALUES
					(
						$1,
						$2,
						$3,
						$4
					)
			`,
			[
				endpoint,
				timeTaken,
				didSucceed,
				numTries,
			]
		);
	};
})();

const fetchEmailRecipients = (str) => {
	if (typeof str !== "string") {
		return [];
	}
	return str.trim().replace(/[\r\n\s\t]+/g, "").split(";").filter(v => !!v).map(e => e.toLowerCase());
};

const validateSettings = (s) => {
	const die = msg => {
		console.error(msg);
		process.exit(1);
	};
	if (!s.CLA_PING_ENDPOINT) {
		die("CLA_PING_ENDPOINT not supplied.");
	}
	if (!s.CLA_PING_ENDPOINT.match(/\/public\/ping$/)) {
		die("CLA_PING_ENDPOINT must be to /public/ping");
	}
	if (!(
		s.AZURE_USERNAME
		&& s.AZURE_PASSWORD
		&& s.AZURE_TENANT
	)) {
		die("AZURE_USERNAME, AZURE_PASSWORD and AZURE_TENANT must all be provided.");
	}
	if (!(
		s.AZURE_SERVICE_NAME
		&& s.AZURE_SERVICE_RESOURCE_GROUP
	)) {
		die("AZURE_SERVICE_NAME and AZURE_SERVICE_RESOURCE_GROUP must be provided.");
	}
	if (!(
		s.SMTP_USERNAME
		&& s.SMTP_PASSWORD
		&& s.SMTP_HOST
		&& s.SMTP_PORT
	)) {
		die("SMTP details must all be provided.");
	}
	if (fetchEmailRecipients(s.CLA_RECIPIENT_EMAILS).length === 0) {
		die("At least one CLA_RECIPIENT_EMAILS must be provided.");
	}
	if (!(
		s.PGHOST
		&& s.PGUSER
		&& s.PGPORT
		&& s.PGPASSWORD
		&& s.PGDATABASE
		&& s.PGSSLMODE
	)) {
		die("PG database credentials must be provided.");
	}
};

(async () => {
	console.log("Script starting");
	const s = await getSettings();
	validateSettings(s);
	const dbDetails = {
		user: s.PGUSER,
		password: s.PGPASSWORD,
		database: s.PGDATABASE,
		host: s.PGHOST,
		port: parseInt(s.PGPORT, 10),
		ssl: s.PGSSLMODE !== "disable",
	};
	const smtpDetails = {
		username: s.SMTP_USERNAME,
		password: s.SMTP_PASSWORD,
		host: s.SMTP_HOST,
		port: parseInt(s.SMTP_PORT, 10),
	};
	const emailRecipients = fetchEmailRecipients(s.CLA_RECIPIENT_EMAILS);
	console.log("Fetched email recipients");
	while (true) {
		try {
			const start = Date.now();
			console.log("Starting run");
			const pingStart = start;
			console.log("Beginning pings...");
			let pingResult;
			try {
				pingResult = await ping(s.CLA_PING_ENDPOINT);
				console.log("Ping result:", pingResult);
			} catch (e) {
				console.log("Error performing ping: " + e.message, e.stack);
				throw e;
			}
			const pingEnd = Date.now();
			try {
				await insertPingResultIntoDatabase(
					dbDetails,
					s.CLA_PING_ENDPOINT,
					pingEnd - pingStart,
					pingResult.success,
					pingResult.num_tries
				);
				console.log("Inserted ping result into database");
			} catch (e) {
				console.log("Error inserting ping result into database: " + e.message);
			}
			if (!pingResult.success) {
				console.log("Ping failed - restarting!");
				try {
					await restartAzureService(
						s.AZURE_USERNAME,
						s.AZURE_PASSWORD,
						s.AZURE_TENANT,
						s.AZURE_SERVICE_NAME,
						s.AZURE_SERVICE_RESOURCE_GROUP
					);
					console.log("Azure service(s) restarted successfully");
				} catch (e) {
					console.log("Error restarting Azure Service: " + e.message);
					throw e;
				}
				try {
					await sendEmails(
						smtpDetails,
						emailRecipients,
						s.AZURE_SERVICE_NAME,
						s.AZURE_SERVICE_RESOURCE_GROUP
					);
					console.log("Notification emails sent");
				} catch (e) {
					console.log("Error sending notification emails: " + e.message);
				}

				// Wait 10 minutes after restart to ensure the Controller has fully rebooted.
				// Otherwise we may end up continually rebooting the server!
				const timeToWait = 10 * 60 * 1000;
				console.log("Waiting for " + timeToWait + "ms before restarting...");
				await wait(timeToWait);
				console.log("Waiting finished");
			} else {
				const timeTaken = Date.now() - start;
				const timeToWait = Math.max(1000, 60000 - timeTaken);
				console.log("Ping succeeded! Total time taken = " + timeTaken + "ms, waiting for " + timeToWait + "ms before starting again...");
				await wait(timeToWait);
				console.log("Waiting finished");
			}
		} catch (e) {
			console.log("An error has occurred. Waiting before retrying...");
			await wait(5 * 60 * 1000);
			console.log("Waiting finished");
		}
	}
})();