const fs = require("fs");
const util = require("util");

const readFileSync = util.promisify(fs.readFile);
const unlinkSync = util.promisify(fs.unlink);

const { getFlattenedProducts, getErrorsOnly } = require("./lib/util");

const BlobResource = require("./azure/BlobResource");
const BlobService = require("./azure/BlobService");

const playgroundAssetValidator = require("./parseUploads/playgroundAssetValidator")();

const DataUpserter = require("./parseUploads/DataUpserter");

const byKey = (arr) => {
	const ret = Object.create(null);
	for (const a of arr) {
		ret[a] = a;
	}
	return ret;
};

const intersect = (obj1, obj2) => {
	const ret = Object.create(null);
	for (const key in obj1) {
		if (obj2[key]) {
			ret[key] = key;
		}
	}
	return ret;
};

/**
 * @param {BlobService} bs
 * @returns PromiseLike<Record<string, string>>
 */
const getRawUploadsMapFromAzure = async (bs) => {
	const rawData = await bs.getAllBlobsInContainer("rawuploads");
	const map = Object.create(null);
	for (const blob of rawData) {
		if (!blob.name.match(/.+\.(pdf|epub)$/)) {
			continue;
		}
		const parts = blob.name.split(".");
		const fileFormat = parts.pop();
		const isbn = parts.join(".");
		map[isbn] = fileFormat;
	}
	return map;
};

/**
 * @param {BlobService} bs
 * @returns PromiseLike<string[]>
 */
const getCoverPageIsbnsFromAzure = async (bs) => {
	return (await bs.getAllBlobsInContainer("coverpages"))
		.map((blob) => blob.name)
		.filter((name) => name.match(/.+\.png$/))
		.map((name) => name.slice(0, -4));
};

/**
 * @param {BlobService} bs
 * @returns PromiseLike<string[]>
 */
const getHighQualityPageIsbnsFromAzure = async (bs) => {
	return (await bs.getAllDirectoriesInContainer("highqualitypages"))
		.map((blob) => blob.name)
		.filter((name) => name.match(/^[^/]+\/$/))
		.map((name) => name.slice(0, -1));
};

/**
 * @param {BlobService} bs
 * @returns PromiseLike<string[]>
 */
const getPageCountIsbnsFromAzure = async (bs) => {
	return (await bs.getAllBlobsInContainer("pagecounts"))
		.map((blob) => blob.name)
		.filter((name) => name.match(/.+\.txt$/))
		.map((name) => name.slice(0, -4).split("___")[0]);
};

/**
 * @param {BlobService} bs
 * @returns PromiseLike<string[]>
 */
const getPagePreviewIsbnsFromAzure = async (bs) => {
	return (await bs.getAllDirectoriesInContainer("pagepreviews"))
		.map((blob) => blob.name)
		.filter((name) => name.match(/^[^/]+\/$/))
		.map((name) => name.slice(0, -1));
};

const fetchAzureData = async (bs) => {
	// get the assets that are already in Azure
	const [rawUploadsMap, coverPageIsbns, highQualityPageIsbns, pageCountIsbns, pagePreviewIsbns] = await Promise.all([
		getRawUploadsMapFromAzure(bs),
		getCoverPageIsbnsFromAzure(bs),
		getHighQualityPageIsbnsFromAzure(bs),
		getPageCountIsbnsFromAzure(bs),
		getPagePreviewIsbnsFromAzure(bs),
	]);
	const coverPageIsbnMap = byKey(coverPageIsbns);
	const highQualityPageIsbnMap = byKey(highQualityPageIsbns);
	const pageCountIsbnMap = byKey(pageCountIsbns);
	const pagePreviewIsbnMap = byKey(pagePreviewIsbns);
	const azureProcessed = intersect(
		rawUploadsMap,
		intersect(coverPageIsbnMap, intersect(highQualityPageIsbnMap, intersect(pageCountIsbnMap, pagePreviewIsbnMap)))
	);
	for (const isbn in azureProcessed) {
		azureProcessed[isbn] = rawUploadsMap[isbn];
	}
	return azureProcessed;
};

const processPhaseOne = async (dbPool, assets) => {
	const results = await playgroundAssetValidator.process(assets);
	const products = getFlattenedProducts(results);

	const dataUpserter = new DataUpserter();
	dataUpserter.setDatabaseQuerier(dbPool);

	const upsertErrors = [];
	for (const product of products) {
		try {
			await dataUpserter.upsert(product);
		} catch (e) {
			let msg = e.message || "";
			if (product.isbn13) {
				msg += " [[ISBN13: " + product.isbn13 + "]]";
			}
			if (product.pdfIsbn13) {
				msg += " [[PDFISBN13: " + product.pdfIsbn13 + "]]";
			}
			if (product.title) {
				msg += " [[TITLE: " + product.title + "]]";
			}
			if (e.stack && typeof e.stack === "string") {
				msg += " [" + e.stack + "]";
			}
			upsertErrors.push(msg);
		}
	}

	return {
		xmlErrors: getErrorsOnly(results),
		results,
		products,
		upsertErrors,
	};
};

const processPhaseTwo = async (dbPool, connString) => {
	if (!(connString && typeof connString === "string")) {
		throw new Error("Azure connection string not provided");
	}
	const bs = new BlobService(connString);
	const azureProcessed = await fetchAzureData(bs);

	const assetData = (await bs.getAllBlobsInContainer("pagecounts")).map((blob) => {
		const parts = blob.name.slice(0, -4).split("___");
		const isbn = parts[0];
		const pageCount = parseInt(parts[1], 10);
		return {
			pdfIsbn13: isbn,
			fileFormat: azureProcessed[isbn],
			pageCount: pageCount,
		};
	});

	const dataUpserter = new DataUpserter();
	dataUpserter.setDatabaseQuerier(dbPool);
	await dataUpserter.updateAssets(assetData);

	try {
		await dataUpserter.deleteOrphanedRecords();
	} catch (e) {}

	return { assetData };
};

const upsertPhaseOne = async (params, ctx) => {
	await ctx.ensureClaAdminRequest();
	ctx._koaCtx.request.socket.setTimeout(30 * 60 * 1000); // increase socket timeout to 30 minutes
	let assets;
	if (params.assets) {
		if (Array.isArray(params.assets)) {
			assets = params.assets;
		} else {
			assets = [params.assets];
		}
	} else {
		assets = [];
	}
	try {
		return {
			results: await processPhaseOne(ctx.getAppDbPool(), assets),
		};
	} catch (e) {
		ctx.throw(400, e.data || e.message);
	}
};

const upsertPhaseTwo = async (params, ctx) => {
	await ctx.ensureClaAdminRequest();
	ctx._koaCtx.request.socket.setTimeout(30 * 60 * 1000); // increase socket timeout to 30 minutes
	try {
		return {
			results: await processPhaseTwo(ctx.getAppDbPool(), params.azure_connection_string),
		};
	} catch (e) {
		ctx.throw(400, e.data || e.message);
	}
};

module.exports = {
	upsertPhaseOne,
	upsertPhaseTwo,
};
