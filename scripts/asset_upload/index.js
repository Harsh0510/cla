const path = require("path");

const fs = require("fs-extra");
const dotenv = require("dotenv");
const { Pool } = require("pg");

const fetchAzCopy = require("./lib/fetchAzCopy");

const extractConnectionStringParts = require("./lib/extractConnectionStringParts");
const { doMetadataPhaseOne, doMetadataPhaseTwo } = require("./lib/uploadMetadataToDatabase");
const exec = require("./lib/exec");
const execFile = require("./lib/execFile");
const genTmpPath = require("./lib/genTmpPath");
const removeDir = require("./lib/removeDir");
const AZCOPY_PATH = require("./lib/AZCOPY_PATH");

const doCoverImages = require("./commands/doCoverImages");
const doPdfs = require("./commands/doPdfs");
const ErrorLogWriter = require("./lib/ErrorLogWriter");
const createSasToken = require("./lib/createSasToken");

const homedir = require('os').homedir();

const getEnv = fp => {
	try {
		return dotenv.parse(fs.readFileSync(fp));
	} catch (e) {
		return {};
	}
};

const allOptions = [
	`STAGE_API_BASE`,
	`LIVE_API_BASE`,
	`BATCH_ACCOUNT_NAME`,
	`BATCH_ACCOUNT_URL`,
	`BATCH_ACCOUNT_KEY`,
	`STAGE_STORAGE_ACCOUNT_CONNECTION_STRING`,
	`LIVE_STORAGE_ACCOUNT_CONNECTION_STRING`,
	`PUBLISHER_STORAGE_ACCOUNT_CONNECTION_STRING`,
	`WORKBENCH_COVER_IMAGE_DIR`,
	`WORKBENCH_PDF_DIR`,
	`AZURE_BATCH_READONLY_DB_CONNECTION_STRING`,
	`STAGE_ADMIN_EMAIL`,
	`STAGE_ADMIN_PASSWORD`,
	`LIVE_ADMIN_EMAIL`,
	`LIVE_ADMIN_PASSWORD`,
	`DO_COVER_IMAGES`,
	`DO_PDFS`,
	`DO_TRANSFER_TO_LIVE`,
	`DO_METADATA_PHASE_ONE`,
	`DO_METADATA_PHASE_TWO`,
	`ONIX_METADATA_GIT_URI`,
	`ONIX_METADATA_GIT_BRANCH_NAME`,
	`ONIX_INCLUDE_REGEX`,
	`ERROR_LOG_URI`,
	`STAGE_DB_CONNECTION_STRING`,
	`METADATA_PATH`,
];

const getHelp = async () => {
	const mainHelp = await fs.readFile(path.join(__dirname, "README.md"));
	const envHelp = await fs.readFile(path.join(__dirname, "env.example"));
	return mainHelp.toString() + '\n## Environment Settings\n\n' + envHelp.toString() + '\n';
}

const getSettings = async () => {
	const argv = require("yargs")(process.argv).help(false).argv;
	if (argv.help) {
		const helpText = await getHelp();
		process.stdout.write(helpText);
		process.exit(0);
	}
	const allProps = Object.create(null);
	Object.assign(allProps, getEnv("/etc/.cla-ep-asset-upload.env"));
	Object.assign(allProps, process.env);
	Object.assign(allProps, getEnv(path.join(homedir, ".cla-ep-asset-upload.env")));
	Object.assign(allProps, getEnv(path.join(__dirname, ".env")));
	if (argv.envFile) {
		Object.assign(allProps, getEnv(argv.envFile));
	}
	Object.assign(allProps, argv);
	const ret = Object.create(null);
	for (const opt of allOptions) {
		if (Object.prototype.hasOwnProperty.call(allProps, opt)) {
			ret[opt] = allProps[opt];
		}
	}
	return ret;
};

const keyRequired = (settings, key) => {
	if (!settings[key]) {
		console.log(`key '${key}' required but not provided`);
		process.exit(1);
	}
};

const getSubStage = (opts) => {
	const num = (
		(!!opts.DO_COVER_IMAGES)
		+ (!!opts.DO_PDFS)
		+ (!!opts.DO_TRANSFER_TO_LIVE)
		+ (!!opts.DO_METADATA_PHASE_ONE)
		+ (!!opts.DO_METADATA_PHASE_TWO)
	);
	if (num !== 1) {
		return null;
	}
	if (opts.DO_COVER_IMAGES) {
		return "cover-images";
	}
	if (opts.DO_PDFS) {
		return "asset-processing";
	}
	if (opts.DO_TRANSFER_TO_LIVE) {
		return "transfer-live";
	}
	if (opts.DO_METADATA_PHASE_ONE) {
		return "upload-metadata-phase-one";
	}
	if (opts.DO_METADATA_PHASE_TWO) {
		return "upload-metadata-phase-two";
	}
	return null;
};

const cloneClaGithubRepo = async (uri, branch) => {
	const dir = genTmpPath();
	await fs.ensureDir(dir);
	await exec(
		`git`,
		[
			`clone`,
			`--depth`, `1`,
			`-b`, branch,
			uri,
			`.`
		],
		dir
	);
	return dir;
};

const syncStageToProductionStorageAccount = async (logWriter, stageStorageSettings, liveStorageSettings) => {
	const copy = async dir => {
		await logWriter.write({
			sub_stage: "sync-stage-to-production",
			content: "begin syncing: " + dir,
		});
		const tokSrc = createSasToken(stageStorageSettings, null, 8 * 60 * 60); // 8 hours
		const tokDest = createSasToken(liveStorageSettings, null, 8 * 60 * 60);
		await execFile(
			AZCOPY_PATH,
			['copy', `${stageStorageSettings.BlobAccountUrl}/${dir}?${tokSrc}`, `${liveStorageSettings.BlobAccountUrl}/${dir}?${tokDest}`, '--recursive', '--overwrite', 'ifSourceNewer']
		);
		await logWriter.write({
			sub_stage: "sync-stage-to-production",
			content: "end syncing: " + dir,
		});
	};
	await copy('coverpages');
	await copy('highqualitypages');
	await copy('pagecounts');
	await copy('pagepreviews');
	await copy('rawcoverpages');
	await copy('rawuploads');
};

const maybeGetStorageAccountSettings = (settings, prefix) => {
	const key = prefix + `_STORAGE_ACCOUNT_CONNECTION_STRING`;
	if (!settings[key]) {
		return null;
	}
	return extractConnectionStringParts(settings[key]);
};

const ensureUri = (settings, key) => {
	if (!settings[key]) {
		console.error(`Key '${key}' not provided`);
		process.exit(1);
	}
	let url;
	try {
		url = new URL(settings[key]);
	} catch (e) {

	}
	if (!url) {
		console.error(`Key '${key}' must be a URL`);
		process.exit(1);
	}
};

(async () => {
	const settings = await getSettings();
	if (
		!settings.DO_COVER_IMAGES
		&& !settings.DO_METADATA_PHASE_ONE
		&& !settings.DO_METADATA_PHASE_TWO
		&& !settings.DO_PDFS
		&& !settings.DO_TRANSFER_TO_LIVE
	) {
		console.log(`No command provided.`);
		return;
	}
	settings.dbPool = new Pool({
		connectionString: settings.STAGE_DB_CONNECTION_STRING,
	});
	ensureUri(settings, 'STAGE_API_BASE');
	const stageStorageAccountSettings = maybeGetStorageAccountSettings(settings, 'STAGE');
	const liveStorageAccountSettings = maybeGetStorageAccountSettings(settings, 'LIVE');
	const publisherStorageAccountSettings = maybeGetStorageAccountSettings(settings, 'PUBLISHER');
	if (settings.DO_METADATA_PHASE_ONE || settings.DO_METADATA_PHASE_TWO) {
		keyRequired(settings, `STAGE_ADMIN_EMAIL`);
		keyRequired(settings, `STAGE_ADMIN_PASSWORD`);
	}
	if (settings.DO_PDFS) {
		keyRequired(settings, 'BATCH_ACCOUNT_NAME');
		keyRequired(settings, 'BATCH_ACCOUNT_KEY');
		keyRequired(settings, 'BATCH_ACCOUNT_URL');
		keyRequired(settings, 'WORKBENCH_PDF_DIR');
		keyRequired(settings, 'AZURE_BATCH_READONLY_DB_CONNECTION_STRING');
	}
	if (settings.DO_METADATA_PHASE_ONE || settings.DO_TRANSFER_TO_LIVE) {
		keyRequired(settings, "ONIX_METADATA_GIT_URI");
		keyRequired(settings, "ONIX_METADATA_GIT_BRANCH_NAME");
	}
	if (settings.DO_COVER_IMAGES || settings.DO_PDFS || settings.DO_TRANSFER_TO_LIVE) {
		if (!stageStorageAccountSettings) {
			console.log("STAGE storage account credentials not provided");
			return;
		}
	}
	if (settings.DO_COVER_IMAGES || settings.DO_PDFS) {
		if (!publisherStorageAccountSettings) {
			console.log("PUBLISHER storage account credentials not provided");
			return;
		}
	}
	if (settings.DO_COVER_IMAGES) {
		keyRequired(settings, `WORKBENCH_COVER_IMAGE_DIR`);
	}
	if (settings.DO_TRANSFER_TO_LIVE) {
		if (!liveStorageAccountSettings) {
			console.log("LIVE storage account credentials not provided");
			return;
		}
		ensureUri(settings, 'LIVE_API_BASE');
		keyRequired(settings, `LIVE_ADMIN_EMAIL`);
		keyRequired(settings, `LIVE_ADMIN_PASSWORD`);
	}
	const logWriter = new ErrorLogWriter(settings.ERROR_LOG_URI || (settings.STAGE_API_BASE + "/public/asset-processing-log-insert"));
	try {
		if (settings.DO_COVER_IMAGES || settings.DO_TRANSFER_TO_LIVE) {
			await fetchAzCopy(AZCOPY_PATH);
		}

		if (settings.DO_COVER_IMAGES) {
			await doCoverImages(
				logWriter,
				settings.WORKBENCH_COVER_IMAGE_DIR,
				publisherStorageAccountSettings,
				stageStorageAccountSettings
			);
		}

		if (settings.DO_PDFS) {
			await doPdfs(
				logWriter,
				settings,
				publisherStorageAccountSettings,
				stageStorageAccountSettings,
				settings.STAGE_API_BASE
			);
		}

		const tmpDir = await (async () => {
			if (!settings.DO_METADATA_PHASE_ONE && !settings.DO_TRANSFER_TO_LIVE) {
				return;
			}
			console.log(`Cloning github repo for XML files (uri: ${settings.ONIX_METADATA_GIT_URI}, branch: ${settings.ONIX_METADATA_GIT_BRANCH_NAME})...`);
			if (settings.METADATA_PATH) {
				return settings.METADATA_PATH;
			}
			return await cloneClaGithubRepo(settings.ONIX_METADATA_GIT_URI, settings.ONIX_METADATA_GIT_BRANCH_NAME);
		})();
		try {
			if (settings.DO_METADATA_PHASE_ONE) {
				console.log(`Chunking and uploading XML files to Stage database...`);
				await doMetadataPhaseOne(
					logWriter,
					tmpDir,
					settings.STAGE_ADMIN_EMAIL,
					settings.STAGE_ADMIN_PASSWORD,
					settings.STAGE_API_BASE,
					settings.ONIX_INCLUDE_REGEX
				);
			}
			if (settings.DO_TRANSFER_TO_LIVE) {
				await logWriter.log({
					sub_stage: "transfer-live",
					content: `Syncing Stage to Live Storage Account. Be patient, this can take a while!`,
				});
				await syncStageToProductionStorageAccount(logWriter, stageStorageAccountSettings, liveStorageAccountSettings);
				await logWriter.log({
					sub_stage: "transfer-live",
					content: `Chunking and uploading XML files to Live database...`,
				});
				await doMetadataPhaseOne(
					logWriter,
					tmpDir,
					settings.LIVE_ADMIN_EMAIL,
					settings.LIVE_ADMIN_PASSWORD,
					settings.LIVE_API_BASE,
					settings.ONIX_INCLUDE_REGEX
				);
				await doMetadataPhaseTwo(
					logWriter,
					settings.LIVE_ADMIN_EMAIL,
					settings.LIVE_ADMIN_PASSWORD,
					liveStorageAccountSettings.ConnectionString,
					settings.LIVE_API_BASE
				);
				await logWriter.log({
					sub_stage: "transfer-live",
					content: `Finished transferring to live`,
				});
			}
		} finally {
			if (!settings.METADATA_PATH) {
				await removeDir(tmpDir);
			}
		}
		if (settings.DO_METADATA_PHASE_TWO) {
			await doMetadataPhaseTwo(
				logWriter,
				settings.STAGE_ADMIN_EMAIL,
				settings.STAGE_ADMIN_PASSWORD,
				stageStorageAccountSettings.ConnectionString,
				settings.STAGE_API_BASE
			);
		}
		console.log("Completed requested sub-stages");
	} catch (e) {
		if (!e._logged) {
			await logWriter.log({
				success: false,
				high_priority: true,
				sub_stage: getSubStage(settings),
				content: e.name + "\n" + e.message + "\n" + e.stack,
			});
			e._logged = true;
		}
		throw e;
	} finally {
		await logWriter.close();
	}
	process.exit(0);
})();