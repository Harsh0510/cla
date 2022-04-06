const crypto = require("crypto");
const fs = require("fs-extra");
const path = require("path");
const childProcess = require("child_process");
const { quote } = require("shell-quote");
const sha256File = require("sha256-file");
const zlib = require("zlib");
const tarStream = require("tar-stream");

const pushTask = require("./pushTask");

const MAXMIND_DB_PATH = path.normalize(path.join(__dirname, "..", "..", "GeoLite2-Country.mmdb"));

const extractFileByRegex = (filePath, regex, targFilePath) =>
	new Promise((resolve, reject) => {
		const extract = tarStream.extract();

		fs.open(targFilePath, "w", (err, fd) => {
			if (err) {
				reject(err);
				return;
			}

			extract.on("entry", (header, stream, cb) => {
				stream.on("data", (chunk) => {
					if (header.name.match(regex)) {
						fs.writeSync(fd, chunk);
					}
				});

				stream.on("end", () => {
					cb();
				});

				stream.resume();
			});

			extract.on("finish", () => {
				fs.fsyncSync(fd);
				fs.closeSync(fd);
				resolve();
			});
			extract.on("error", reject);

			fs.createReadStream(filePath).pipe(zlib.createGunzip()).pipe(extract);
		});
	});

const sha = (filePath) => {
	return new Promise((resolve, reject) => {
		sha256File(filePath, (err, sum) => {
			if (err) {
				reject(err);
			} else {
				resolve(sum);
			}
		});
	});
};

const exec = (cmd) =>
	new Promise((resolve, reject) => {
		childProcess.exec(cmd, (error, stdout) => {
			if (error) {
				reject(error);
			} else {
				resolve(stdout);
			}
		});
	});

const doUpdate = async (licenseKey) => {
	const outputPathHash = crypto.createHash("md5").update(MAXMIND_DB_PATH).digest("hex");

	const dbTmpPathTarGz = "/tmp/" + outputPathHash + "maxmind.bin.tar.gz";
	const sha256Path = "/tmp/" + outputPathHash + "maxmind.sha256";

	await exec(
		`curl ${quote([
			`https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-Country&license_key=${licenseKey}&suffix=tar.gz`,
			"-q",
			"-o",
			dbTmpPathTarGz,
		])}`
	);

	await exec(
		`curl ${quote([
			`https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-Country&license_key=${licenseKey}&suffix=tar.gz.sha256`,
			"-q",
			"-o",
			sha256Path,
		])}`
	);

	const sum = await sha(dbTmpPathTarGz);

	const expectedShaContents = (await fs.readFile(sha256Path)).toString().split(/\s+/)[0];

	if (sum !== expectedShaContents) {
		throw new Error("Checksum doesn't match");
	}

	const dbTmpPath = MAXMIND_DB_PATH + ".TMP";

	await extractFileByRegex(dbTmpPathTarGz, /\.mmdb$/, dbTmpPath);
	await fs.rename(dbTmpPath, MAXMIND_DB_PATH);
	await fs.unlink(dbTmpPathTarGz);
	await fs.unlink(sha256Path);
};

module.exports = async function (taskDetails) {
	try {
		if (!process.env.CLA_MAXMIND_LICENSE_KEY) {
			return;
		}
		await doUpdate(process.env.CLA_MAXMIND_LICENSE_KEY);
	} finally {
		//delete task from asynctask
		await taskDetails.deleteSelf();
		// Push this task back into the queue so it runs itself in about 5 minutes.
		await pushTask(taskDetails);
	}
};
