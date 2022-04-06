const ensure = require("#tvf-ensure");

const BlobService = require("./azure/BlobService");
const Batch = require("./azure/Batch");

module.exports = async function (params, ctx) {
	await ctx.ensureClaAdminRequest();

	ensure.nonEmptyStr(ctx, params.connection_string, "Azure Blob Storage connection string");

	if (!params.batch) {
		ctx.throw(400, `Batch credentials not provided`);
	}
	if (typeof params.batch !== "object") {
		ctx.throw(400, `Batch credentials not provided`);
	}
	ensure.nonEmptyStr(ctx, params.batch.name, "params.batch.name");
	ensure.nonEmptyStr(ctx, params.batch.key, "params.batch.key");
	ensure.nonEmptyStr(ctx, params.batch.url, "params.batch.url");

	const bs = new BlobService(params.connection_string);
	const batch = new Batch(bs, params.batch);

	const pageCountBlobs = await bs.getAllBlobsInContainer("pagecounts");
	const pageCounts = pageCountBlobs.map((blob) => blob.name.slice(0, -4).split("___")[0]);

	const rawUploadBlobs = await bs.getAllBlobsInContainer("rawuploads");
	const rawUploads = rawUploadBlobs.map((blob) => blob.name.split(".")[0]);

	const rawUploadsMap = Object.create(null);
	for (const isbn of rawUploads) {
		rawUploadsMap[isbn] = true;
	}
	for (const isbn of pageCounts) {
		delete rawUploadsMap[isbn];
	}

	const isbns = Object.keys(rawUploadsMap).sort();

	if (isbns.length > 0) {
		await batch.submit(isbns);
	}

	return {
		page_counts: pageCounts,
		raw_uploads: rawUploads,
		isbns: isbns,
	};
};
