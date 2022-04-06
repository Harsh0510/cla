const fs = require("fs-extra");
const path = require("path");
const childProcess = require("child_process");
const os = require("os");

const download = require("download");
const glob = require("glob");
const azureStorage = require("@azure/storage-blob");
const moment = require("moment");
const dotenv = require("dotenv");

const azCopyPath = path.join(__dirname, "azcopy");

const globp = (...args) => new Promise((resolve, reject) => glob(...args, (err, result) => {
	if (err) {
		reject(err);
	} else {
		resolve(result);
	}
}));

class AzureStorageHelper {
	constructor(str) {
		this._client = azureStorage.BlobServiceClient.fromConnectionString(str);
	}
	async fetchAllContainers() {
		const iter = this._client.listContainers();
		const allContainers = [];
		let containerItem = await iter.next();
		while (!containerItem.done) {
			allContainers.push(containerItem.value);
			containerItem = await iter.next();
		}
		return allContainers;
	}
	async deleteOldContainers(maxAgeDays = 30) {
		const containers = await this.fetchAllContainers();
		const now = Date.now();
		const thirtyDays = maxAgeDays * 24 * 60 * 60 * 1000;
		for (const container of containers) {
			const match = container.name.match(/^backup-(20[0-9]{6})-/);
			if (!match) {
				continue;
			}
			const dt = moment(match[1], "YYYYMMDD").valueOf();
			if (dt + thirtyDays > now) {
				continue;
			}
			const cc = this._client.getContainerClient(container.name);
			await cc.delete();
		}
	}
	async createContainer(name) {
		await this._client.getContainerClient(name).create();
	}
	async createCurrentBackupContainer(srcAccountName) {
		const mom = moment().utc();
		const dt = mom.format(`YYYYMMDD`);
		const time = mom.format(`HHmm`);
		const srcName = srcAccountName ? ('-' + srcAccountName) : '';
		const name = `backup-` + dt + '-' + time + srcName;
		this.createContainer(name);
		return name;
	}
	async getMostRecentBackup(srcAccountName) {
		const containers = await this.fetchAllContainers();
		const re = new RegExp('^backup-(20[0-9]{6}-[0-9]{4})-' + srcAccountName);
		let latestFoundTime = 0;
		let latestFound = null;
		for (const container of containers) {
			const match = container.name.match(re);
			if (!match) {
				continue;
			}
			const dt = moment(match[1], "YYYYMMDD-HHmm").valueOf();
			if (dt > latestFoundTime) {
				latestFoundTime = dt;
				latestFound = container;
			}
		}
		return {
			time: latestFoundTime,
			container: latestFound,
		};
	}
};

const fetchAzCopy = async () => {
	const tmpPath = azCopyPath + "_tmp";
	await fs.remove(azCopyPath);
	try {
		await download(
			`https://aka.ms/downloadazcopy-v10-linux`,
			tmpPath,
			{
				extract: true,
			}
		);
		const pt = await globp(tmpPath + '/**/azcopy');
		if (pt.length !== 1) {
			throw new Error("Could not find azcopy");
		}
		await fs.move(pt[0], azCopyPath);
		await fs.remove(tmpPath);
	} finally {
		await fs.remove(tmpPath);
	}
};

const fetchAzCopyIfNecessary = async () => {
	let exists = false;
	try {
		await fs.access(azCopyPath, fs.constants.X_OK);
		exists = true;
	} catch (e) {
		exists = false;
	}
	if (!exists) {
		await fetchAzCopy();
	}
};

const execFile = (fp, args) => new Promise((resolve, reject) => {
	childProcess.execFile(fp, args, err => {
		if (err) {
			reject(err);
		} else {
			resolve();
		}
	});
});

const copyAllContainers = async (srcDeets, dstDeets, name) => {
	await execFile(azCopyPath, [
		`copy`,
		`--log-level`,
		`ERROR`,
		`--recursive`,
		`${srcDeets.BlobEndpoint}?${srcDeets.SharedAccessSignature}`,
		`${dstDeets.BlobEndpoint}${name}?${dstDeets.SharedAccessSignature}`,
	]);
};

const parseConnectionString = str => {
	const ret = {};
	const parts = str.split(';');
	for (const part of parts) {
		if (!part) {
			continue;
		}
		const match = part.match(/^(.+?)=(.+)$/);
		ret[match[1]] = match[2];
	}
	if (ret.BlobEndpoint) {
		const match = ret.BlobEndpoint.match(/^https?:\/\/(.+?)\.blob\.core\.windows\.net/);
		if (match) {
			ret.accountName = match[1];
		}
	}
	return ret;
};

const log = msg => {
	const mom = moment().utc().toISOString();
	console.log(mom + ': ' + msg);
};

const loadEnvironment = () => {
	const pathsToTry = [];
	pathsToTry.push(
		__dirname + '/.env',
		'/root/.env',
	);
	if (process.env.ENV_FILE) {
		pathsToTry.push(process.env.ENV_FILE);
	}
	if (process.argv[2]) {
		pathsToTry.push(process.argv[2]);
	}
	for (const ptt of pathsToTry) {
		log("Trying to load environment variables from path '" + ptt + "'...");
		let result;
		try {
			result = dotenv.config({
				path: ptt,
			});
		} catch (e) {
			
		}
		if (result && result.parsed) {
			Object.assign(process.env, result.parsed);
			log("Found environment variable file at path '" + ptt + "'");
		} else {
			log("No environment variables found at path '" + ptt + "'");
		}
	}
};

const removeAzCopyLogDirectory = async () => {
	await fs.remove(path.join(os.homedir(), ".azcopy"));
};

const run = async () => {
	log("BEGIN");
	loadEnvironment();
	log("Loaded environment variables from .env file(s).");
	if (!process.env.CLA_SRC_CONNECTION_STRING) {
		log("ERROR: No SRC connection string found.");
		return;
	}
	if (!process.env.CLA_DEST_CONNECTION_STRING) {
		log("ERROR: No DST connection string found.");
		return;
	}
	const srcDeets = parseConnectionString(process.env.CLA_SRC_CONNECTION_STRING);
	if (!srcDeets.accountName) {
		log("ERROR: Could not parse SRC account name.");
		return;
	}
	if (!srcDeets.SharedAccessSignature || !srcDeets.BlobEndpoint) {
		log("ERROR: Could not parse SRC SAS or Blob endpoint.");
		return;
	}
	const dstDeets = parseConnectionString(process.env.CLA_DEST_CONNECTION_STRING);
	if (!dstDeets.SharedAccessSignature || !dstDeets.BlobEndpoint) {
		log("ERROR: Could not parse DST SAS or Blob endpoint.");
		return;
	}
	log("Successfully parsed Azure Blob Storage src and dest connection strings.");
	const dst = new AzureStorageHelper(process.env.CLA_DEST_CONNECTION_STRING);
	await dst.deleteOldContainers();
	log("Deleted old backup containers.");
	const mostRecentBackup = await dst.getMostRecentBackup(srcDeets.accountName);
	if (mostRecentBackup.time + 6.9 * 24 * 60 * 60 * 1000 > Date.now()) {
		log(`A recent backup for '${srcDeets.accountName}' already exists - not backing up.`);
		log("END");
		return;
	}
	await fetchAzCopyIfNecessary();
	log("Finished (possibly) fetching azcopy binary.");
	const name = await dst.createCurrentBackupContainer(srcDeets.accountName);
	log("Created empty destination backup container with name '" + name + "'.");
	await copyAllContainers(srcDeets, dstDeets, name);
	log("Successfully copied all containers to '" + name + "'.");
	await removeAzCopyLogDirectory();
	log("Successfully removed azcopy log directory.");
	log("END");
};

(async () => {
	await run();
})();