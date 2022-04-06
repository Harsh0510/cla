const fs = require('fs');

const BlobService = require('../../../apps/Controller/app/core/admin/azure/BlobService');
const Batch = require('../../../apps/Controller/app/core/admin/azure/Batch');

const arrayChunk = require("../lib/arrayChunk");

function byKey(arr) {
	const ret = Object.create(null);
	for (const a of arr) {
		ret[a] = a;
	}
	return ret;
}

function intersect(obj1, obj2) {
	const ret = Object.create(null);
	for (const key in obj1) {
		if (obj2[key]) {
			ret[key] = key;
		}
	}
	return ret;
}

function getDbConnectionUri(deets) {
	const queryParts = [];
	if (deets.ssl) {
		queryParts.push(`ssl=true`);
	}
	const qs = queryParts.length ? `?${queryParts.join('&')}` : '';
	return `postgres://${deets.user}:${deets.password}@${deets.host}:${deets.port}/${deets.database}${qs}`;
}

const getIsbnsToExclude = async (querier) => {
	return (await querier("SELECT identifier FROM asset_processing_ignore")).rows.map(r => r.identifier);
};

async function getIsbnsToProcess(settings) {
	const isbnsToExcludeMap = byKey(await getIsbnsToExclude(settings.db_pool.query.bind(settings.db_pool)));
	const isIsbnAllowed = (() => {
		if (!settings.isbn_list) {
			return () => true;
		}
		const isbns = JSON.parse(fs.readFileSync(settings.isbn_list).toString());
		const isbnsSet = new Set(isbns);
		return isbn => isbnsSet.has(isbn);
	})();
	const bs = new BlobService(settings.storage_connection_string);

	const blobs1 = (await bs.getAllBlobsInContainer('coverpages')).map(blob => blob.name).filter(name => name.match(/^[0-9]{4}.+?\.png$/)).map(name => name.slice(0, -4));
	const blobs2 = (await bs.getAllDirectoriesInContainer('highqualitypages')).map(blob => blob.name).filter(name => name.match(/^[0-9]{4}.+?\/$/)).map(name => name.slice(0, -1));
	const blobs3 = (await bs.getAllBlobsInContainer('pagecounts')).map(blob => blob.name).filter(name => name.match(/^[0-9]{4}.+?\.txt$/)).map(name => name.slice(0, -4).split("___")[0]);
	const blobs4 = (await bs.getAllDirectoriesInContainer('pagepreviews')).map(blob => blob.name).filter(name => name.match(/^[0-9]{4}.+?\/$/)).map(name => name.slice(0, -1));

	// get intersection
	const b1 = byKey(blobs1);
	const b2 = byKey(blobs2);
	const b3 = byKey(blobs3);
	const b4 = byKey(blobs4);
	const alreadyProcessed = intersect(b1, intersect(b2, intersect(b3, b4)));

	const rawUploads = (await bs.getAllBlobsInContainer('rawuploads')).filter(blob => {
		const match = blob.name.match(/^([0-9]{4}.+?)\.(pdf|epub)$/);
		return match && isIsbnAllowed(match[1]);
	}).map(blob => {
		const matches = blob.name.match(/^([0-9]{4}.+?)\.(pdf|epub)$/);
		return {
			isbn: matches[1],
			type: matches[2],
		};
	});

	const rawUploadsMap = Object.create(null);
	for (const rawUpload of rawUploads) {
		rawUploadsMap[rawUpload.isbn] = rawUpload;
	}

	for (const isbn in alreadyProcessed) {
		delete rawUploadsMap[isbn];
	}

	const isbns = Object.keys(rawUploadsMap).filter(isbn => !isbnsToExcludeMap[isbn]);
	isbns.sort();
	return isbns.map(isbn => rawUploadsMap[isbn]);
}

module.exports = async (logWriter, settings) => {
	const toProcess = await getIsbnsToProcess(settings);

	const batch = new Batch(
		new BlobService(settings.storage_connection_string),
		{
			name: settings.batch_name,
			url: settings.batch_url,
			key: settings.batch_key,
		}
	);

	if (toProcess.length > 0) {
		await logWriter.log({
			sub_stage: "asset-processing",
			content: `Found ${toProcess.length} assets to process: ` + JSON.stringify(toProcess)
		});
		const dbConnectionUri = settings.azure_batch_db_connection_string || getDbConnectionUri({
			database: settings.azure_batch_db_name,
			host: settings.azure_batch_db_host,
			user: settings.azure_batch_db_user,
			password: settings.azure_batch_db_password,
			port: settings.azure_batch_db_port,
			ssl: !!settings.azure_batch_db_ssl,
		});
		const items = toProcess.map(isbn => ({
			...isbn,
			generateHighQualityImages: settings.do_high_quality_pages,
			highQualityPreviews: false,
		}));
		const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
		const chunkedItems = arrayChunk(items, 500);
		const totalChunks = chunkedItems.length;
		let chunkNumber = 1;
		for (const chunk of chunkedItems) {
			try {
				await batch.submit(chunk, dbConnectionUri, settings.api_base);
			} catch (e) {
				console.log(e, e.message);
				throw e;
			}
			await logWriter.log({
				sub_stage: "asset-processing",
				content: `Submitted asset chunk ${chunkNumber} of ${totalChunks} - ${chunk.length} assets`,
			});
			if (chunkNumber < totalChunks) {
				await wait(5000);
			}
			chunkNumber++;
		}
		await logWriter.log({
			sub_stage: "asset-processing",
			content: 'Submission successful. It may be take a few hours for all assets to be processed. Check Azure for progress!'
		});
	} else {
		await logWriter.log({
			sub_stage: "asset-processing",
			content: 'No ISBNs to process.'
		});
	}
};