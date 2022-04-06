const path = require("path");
const fs = require("fs-extra");
const moment = require("moment");
const nodemailer = require("nodemailer");
const toml = require("toml");

const exec = require("./lib/exec");

const EXPIRY_HOURS = 24;

const homedir = require('os').homedir();

const getEnv = fp => {
	try {
		const contents = fs.readFileSync(fp).toString();
		return toml.parse(contents);
	} catch (e) {
		return {};
	}
};

const loadEnv = (extraPath) => {
	const allProps = Object.create(null);
	Object.assign(allProps, getEnv("/etc/cla-sas-token-generator.toml"));
	Object.assign(allProps, getEnv(path.join(homedir, "cla-sas-token-generator.toml")));
	if (extraPath) {
		Object.assign(allProps, getEnv(extraPath));
	}
	Object.assign(allProps, getEnv(path.join(__dirname, "config.toml")));
	return allProps;
};

class Azure {
	async login(username, password, tenant) {
		const res = await exec(
			"az",
			[
				"login",
				"--service-principal",
				"--username", username,
				"--password", password,
				"--tenant", tenant,
			]
		);
		return JSON.parse(res.stdout);
	}

	async generateSas(accountName, containerName, permissionString, expiryDelayHours, ipAddressOrRangeString) {
		const now = new Date();
		now.setHours(now.getHours() + expiryDelayHours);
		const expiryMoment = moment(now).utc();
		const expiryDate = expiryMoment.format("YYYY-MM-DDTHH:mm") + "Z";
		const args = [
			"storage",
			"container",
			"generate-sas",
			"--https-only",
			"--account-name", accountName,
			"--name", containerName,
			"--permissions", permissionString,
			"--expiry", expiryDate,
		];
		if (ipAddressOrRangeString) {
			args.push("--ip", ipAddressOrRangeString);
		}
		args.push(
			"--auth-mode", "login",
			"--as-user",
		);
		const res = await exec("az", args);
		const token = JSON.parse(res.stdout);
		return {
			expiry: expiryMoment,
			token: token,
		};
	}

};

const go = async (extraConfigPath) => {
	const env = loadEnv(extraConfigPath);
	if (!(
		env.SMTP_USERNAME
		&& env.SMTP_PASSWORD
		&& env.SMTP_HOST
		&& env.SMTP_PORT
		&& env.EMAIL_FROM
		&& env.EMAIL_SUBJECT
		&& env.AZURE_USERNAME
		&& env.AZURE_TENANT
		&& env.AZURE_PASSWORD
		&& env.AZURE_STORAGE_ACCOUNT_NAME
		&& env.AZURE_STORAGE_ACCOUNT_CONTAINER
		&& env.target
		&& Array.isArray(env.target)
	)) {
		throw new Error("params not provided");
	}
	for (const target of env.target) {
		if (!target.email) {
			throw new Error("email not provided");
		}
		if (!target.permissions) {
			throw new Error("permissions not provided");
		}
	}
	const server = nodemailer.createTransport({
		host: env.SMTP_HOST,
		secure: true,
		port: parseInt(env.SMTP_PORT, 10),
		auth: {
			user: env.SMTP_USERNAME,
			pass: env.SMTP_PASSWORD,
		}
	});
	const az = new Azure();
	await az.login(env.AZURE_USERNAME, env.AZURE_PASSWORD, env.AZURE_TENANT);
	for (const target of env.target) {
		const sas = await az.generateSas(
			env.AZURE_STORAGE_ACCOUNT_NAME,
			env.AZURE_STORAGE_ACCOUNT_CONTAINER,
			target.permissions,
			EXPIRY_HOURS + 2,
			target.ip
		);
		const baseUrl = `https://${env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${env.AZURE_STORAGE_ACCOUNT_CONTAINER}`;
		const sasUri = baseUrl + '?' + sas.token;
		await server.sendMail({
			from: env.EMAIL_FROM,
			to: target.email,
			subject: env.EMAIL_SUBJECT,
			text: `
Your new Azure SAS credentials are below.

Account name: ${env.AZURE_STORAGE_ACCOUNT_NAME}
Container name: ${env.AZURE_STORAGE_ACCOUNT_CONTAINER}
Base URL: ${baseUrl}
Token: ${sas.token}
SAS URI: ${sasUri}
Expiry (UTC): ${sas.expiry.format("LLLL")}

Use with Azure Storage Explorer:

1. Download the Azure Storage Explorer for your platform: https://azure.microsoft.com/en-gb/features/storage-explorer/
2. Review the 'quick start' tutorial for Azure Storage Explorer: https://azure.microsoft.com/en-gb/resources/videos/introduction-to-microsoft-azure-storage-explorer/
3. Add an account using a shared acces signature (SAS) URI.
4. When prompted for a URI, paste the 'SAS URI' above. Pasting the SAS URI will automatically fill out the 'Blob endpoint' field.
5. Optionally enter a display name. It is not necessary to fill out the 'file endpoint', 'queue endpoint' or 'table endpoint' fields.
6. Follow the remaining prompts to complete the addition of the account.

Use via the command line:

1. Install the Azure Command Line tools (https://docs.microsoft.com/en-us/cli/azure/install-azure-cli).
2. Execute one of the 'az storage' commands (https://docs.microsoft.com/en-us/cli/azure/storage/blob?view=azure-cli-latest).

For example, to download the blob 'foo.zip', execute the following:

az storage blob download --account-name '${env.AZURE_STORAGE_ACCOUNT_NAME}' --container-name '${env.AZURE_STORAGE_ACCOUNT_CONTAINER}' -n 'foo.zip' --sas-token '${sas.token}' --file 'foo.zip'

`.trim(),
			headers: {
				"X-SMTPAPI": JSON.stringify({
					category: ["freelance_sas_token"],
					filters: {
						clicktrack: {
							settings: {
								// tell sendgrid not to rewrite links in the email body
								enable: 0,
								enable_text: false,
							}
						}
					}
				})
			}
		});
	}
};

(async () => {
	await go(process.argv[2]);
})();