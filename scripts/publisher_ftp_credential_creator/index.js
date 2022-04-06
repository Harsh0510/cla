const fs = require("fs/promises");
const childProcess = require("child_process");
const util = require('util');
const crypto = require('crypto');

const nodemailer = require("nodemailer");
const shellQuote = require("shell-quote").quote;

const genRandomBytes = util.promisify(crypto.randomBytes);

const generatePassword = async () => {
	return (await genRandomBytes(15)).toString("base64");
};

const doWaitChild = (child, resolve, reject) => {
	let stderr = "";
	child.stderr.on("data", (data) => {
		stderr += data.toString();
	});
	child.on('exit', code => {
		if (code === 0) {
			resolve();
		} else {
			reject({
				error: null,
				code: code,
				stderr: stderr,
			});
		}
	});
	child.on('error', err => {
		reject({
			error: err,
			code: -1,
			stderr: stderr,
		});
	});
};

const waitUntilChildFinishes = child => new Promise((resolve, reject) => doWaitChild(child, resolve, reject));

const fetchSettings = async () => {
	const ret = {
		SMTP_EMAIL_HOST: process.env.SMTP_EMAIL_HOST,
		SMTP_EMAIL_USERNAME: process.env.SMTP_EMAIL_USERNAME,
		SMTP_EMAIL_PASSWORD: process.env.SMTP_EMAIL_PASSWORD,
	};

	const load = async (fp) => {
		try {
			const env = JSON.parse((await fs.readFile(fp)).toString());
			Object.assign(ret, env);
		} catch (e) {

		}
	};

	await load("/etc/.publisher_ftp_credential_creator.json");
	await load("/root/.publisher_ftp_credential_creator.json");
	await load("/root/publisher_ftp_credential_creator/.config.json");

	return ret;
};

const ACCOUNT_CREATION_FILE_PATH = "/root/publisher_ftp_credential_creator/credentials.json";

const fetchAccountsToCreate = async () => {
	try {
		const ret = JSON.parse((await fs.readFile(ACCOUNT_CREATION_FILE_PATH)).toString());
		let index = 0;
		for (const item of ret) {
			if (!item.publisherUsername) {
				throw new Error(`[${index}] publisherUsername not provided`);
			}
			if (!item.publisherNiceName) {
				throw new Error(`[${index}] publisherNiceName not provided`);
			}
			if (!item.recipientName) {
				throw new Error(`[${index}] recipientName not provided`);
			}
			if (!item.recipientEmail) {
				throw new Error(`[${index}] recipientEmail not provided`);
			}
			index++;
		}
		return ret;
	} catch (e) {
	}
	return [];
};

const createAccount = async (publisherUsername, publisherNiceName, ftpBase) => {
	const ftpDir = "/mnt/azure_publisher_file_share/publisher_uploads/" + (ftpBase || publisherUsername);
	let ftpDirAlreadyExisted = false;
	try {
		await fs.mkdir(ftpDir);
	} catch (e) {
		if (e.code === "EEXIST") {
			ftpDirAlreadyExisted = true;
		} else {
			throw e;
		}
	}
	const password = await generatePassword();
	const child = childProcess.exec(
		"ftpasswd " + shellQuote([
			"--sha512",
			"--passwd",
			"--stdin",
			"--file", "/etc/proftpd/ftp.users",
			"--shell", "/bin/false",
			"--uid", "109",
			"--gid", "115",
			"--gecos", publisherNiceName,
			"--name", publisherUsername,
			"--home", ftpDir,
		])
	);
	child.stdin.write(password + "\n");
	child.stdin.end();
	await waitUntilChildFinishes(child);
	return { password, ftpDirAlreadyExisted };
};

const sendEmail = async (sendEmailCallback, ftpUsername, ftpPassword, recipientName, recipientEmail) => {
	return await sendEmailCallback({
		from: 'ftp@educationplatform.co.uk',
		to: recipientEmail,
		subject: 'Education Platform FTP Credentials',
		body: `
Dear ${recipientName},<br/>
<br/>
Here are your log in credentials for uploading content for the Education Platform via FTP.<br/>
<br/>
Username: ${ftpUsername}<br/>
Password: ${ftpPassword}<br/>
<br/>
Instructions on how to upload the content will be sent to you separately.<br/>
If you have any questions, please contact Lucy Hadfield (lucy.hadfield@cla.co.uk).<br/>
<br/>
Best wishes,<br/>
Lucy
		`.trim(),
		headers: {
			"X-SMTPAPI": JSON.stringify({
				category: ["ep_publisher_ftp_credentials"],
			}),
		},
	});
};

let SESSION_ID;

const log = (msg) => {
	const dt = (new Date()).toISOString();
	process.stdout.write(dt + " [" + SESSION_ID + "] " + msg + "\n");
};

const run = async () => {
	SESSION_ID = (await genRandomBytes(8)).toString("hex");

	log("starting...");

	const settings = await fetchSettings();

	if (!settings.SMTP_EMAIL_HOST) {
		throw new Error("SMTP_EMAIL_HOST not provided");
	}
	if (!settings.SMTP_EMAIL_USERNAME) {
		throw new Error("SMTP_EMAIL_USERNAME not provided");
	}
	if (!settings.SMTP_EMAIL_PASSWORD) {
		throw new Error("SMTP_EMAIL_PASSWORD not provided");
	}

	log("fetched settings");

	const accounts = await fetchAccountsToCreate();

	log("fetched " + accounts.length + " account(s) to create (" + accounts.map(acc => acc.publisherUsername).join("; ") + ")");

	if (accounts && accounts.length) {
		const emailClient = nodemailer.createTransport({
			host: settings.SMTP_EMAIL_HOST,
			secure: true,
			port: 465,
			auth: {
				user: settings.SMTP_EMAIL_USERNAME,
				pass: settings.SMTP_EMAIL_PASSWORD,
			},
		});

		log("created email transport");

		const remainingAccounts = [];

		const sendEmailCallback = (deets) => {
			const params = {
				from: deets.from,
				to: deets.to,
				subject: deets.subject,
				html: deets.body,
			};
			if (deets.headers) {
				params.headers = deets.headers;
			}
			return emailClient.sendMail(params);
		};

		for (const account of accounts) {
			try {
				log("creating account " + account.publisherUsername + " (ftp dir: " + (account.ftpDir || "") + ")");
				const { password, ftpDirAlreadyExisted } = await createAccount(account.publisherUsername, account.publisherNiceName, account.ftpDir);
				log(
					"account created for "
					+ account.publisherUsername
					+ " (ftp directory already existed? "
					+ (ftpDirAlreadyExisted ? "YES" : "NO")
					+ ")"
				);
				await sendEmail(sendEmailCallback, account.publisherUsername, password, account.recipientName, account.recipientEmail);
				log("email sent for " + account.publisherUsername);
			} catch (e) {
				log("ERRORED when creating account " + account.publisherUsername + " - skipping (error: " + e.message + " [" + e.stack + "])");
				remainingAccounts.push(account);
			}
		}

		if (!remainingAccounts.length) {
			log("removing account file...");
			await fs.unlink(ACCOUNT_CREATION_FILE_PATH);
		} else {
			log("updating account file...");
			await fs.writeFile(ACCOUNT_CREATION_FILE_PATH, JSON.stringify(remainingAccounts, null, "	"));
		}
	}
	log("all accounts processed, ending now");
};

(async () => {
	let errored = false;
	try {
		await run();
	} catch (e) {
		errored = true;
		log("ERROR: " + e.message + " // " + e.stack);
	}
	process.exit(errored ? 1 : 0);
})();
