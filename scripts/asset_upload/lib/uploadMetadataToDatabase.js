const path = require("path");

const axios = require("axios").default;
const FormData = require("form-data");
const fs = require("fs-extra");
const xmlParser = require("fast-xml-parser");

const glob = require("./glob");
const genTmpPath = require("./genTmpPath");

const fetchClaSessionToken = require("./fetchClaSessionToken");
const removeDir = require("./removeDir");

const MAX_CHUNK_FILE_SIZE = 1 * 1024 * 1024; // 1MB

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const arrayChunk = (arr, chunkSize) => {
	const chunked = [];
	for (let i = 0, len = arr.length; i < len; i += chunkSize) {
		let max = Math.min(len, i + chunkSize);
		const chunk = [];
		for (let j = i; j < max; ++j) {
			chunk.push(arr[j]);
		}
		chunked.push(chunk);
	}
	return chunked;
};

const sendXmlError = async (logWriter, err, chunkName) => {
	const errorObj = {
		chunk: chunkName,
	};
	if (err.errors) {
		errorObj.product_errors = err.errors;
	}
	if (err.xml && err.xml.errors) {
		errorObj.xml_errors = err.xml.errors;
	}
	if (err.title) {
		errorObj.title = err.title;
	}
	await logWriter.write({
		sub_stage: "upload-metadata-phase-one",
		asset_identifier: err.isbn13 || err.pdf_isbn13 || err.pdfIsbn13 || err.issnId || err.identifier,
		high_priority: true,
		success: false,
		content: JSON.stringify(errorObj),
		category: "onix-validation",
	});
};

const sendUpsertError = async (logWriter, err, chunkName) => {
	const params = {
		sub_stage: "upload-metadata-phase-one",
		high_priority: true,
		success: false,
		content: JSON.stringify({
			chunk: chunkName,
			error: err,
		}),
		category: "generic-upsert-error",
	};
	let assetIdentifier = null;
	if (err && (typeof err === "string")) {
		{
			const match = err.match(/\[\[PDFISBN13: (.+?)\]\]/);
			if (match) {
				assetIdentifier = match[1];
			}
		}
		if (!assetIdentifier) {
			const match = err.match(/\[\[ISBN13: (.+?)\]\]/);
			if (match) {
				assetIdentifier = match[1];
			}
		}
	}
	if (assetIdentifier) {
		params.asset_identifier = assetIdentifier;
	}
	await logWriter.write(params);
};

const doMetadataPhaseOne = async (logWriter, projectDir, email, password, apiBase, includeRegex) => {
	await logWriter.write({
		sub_stage: "upload-metadata-phase-one",
		content: `Creating session token for ${apiBase}...`,
	});
	const sessionId = await fetchClaSessionToken(apiBase, email, password);
	await logWriter.write({
		sub_stage: "upload-metadata-phase-one",
		content: `Got session token for ${apiBase}`,
	});
	const fetchChunkedXmlFiles = async () => {
		const getOnixWrap = text => {
			return `
<?xml version="1.0" encoding="UTF-8"?>
<ONIXMessage xmlns="http://ns.editeur.org/onix/3.0/reference" release="3.0">
	<Header>
		<Sender>
			<SenderName>Copyright Licensing Agency</SenderName>
		</Sender>
		<SentDateTime>20200318T190006</SentDateTime>
	</Header>
${text}
</ONIXMessage>
		`.trim();
		};

		const getProductXmls = async (xmlPath) => {
			const contents = (await fs.readFile(xmlPath)).toString();
			const parsed = (new xmlParser.XMLParser({
				preserveOrder: true,
				stopNodes:["ONIXMessage.Header", "ONIXMessage.Product"],
			})).parse(contents);
			if (!Array.isArray(parsed)) {
				return null;
			}
			const onixMessage = (() => {
				for (const node of parsed) {
					if (!node.hasOwnProperty("ONIXMessage")) {
						continue;
					}
					if (!Array.isArray(node.ONIXMessage)) {
						continue;
					}
					return node.ONIXMessage;
				}
				return null;
			})();
			if (!onixMessage) {
				return null;
			}
			const ret = [];
			for (const node of onixMessage) {
				if (!node.Product) {
					continue;
				}
				const p = node.Product;
				if (!Array.isArray(p)) {
					continue;
				}
				let text = "";
				for (const pnode of p) {
					if (pnode["#text"]) {
						text += pnode["#text"];
					}
				}
				if (text) {
					ret.push("<Product>" + text + "</Product>");
				}
			}
			return ret;
		};

		const chunkSingleXmlFile = async (xmlFilePath, tmpDir, baseFileName, into) => {
			const products = await getProductXmls(xmlFilePath);
			if (!products) {
				return false;
			}
			const chunkedProducts = arrayChunk(products, 50);
			let i = 0;
			for (const chunk of chunkedProducts) {
				const xmlText = getOnixWrap(chunk.join("\n"));
				const target = path.join(tmpDir, baseFileName + '_' + i + '.xml');
				await fs.writeFile(target, xmlText);
				into.push(target);
				++i;
			}
			return true;
		};

		const tmpDir = genTmpPath();
		await fs.ensureDir(tmpDir);

		let includeCb;
		if (!includeRegex) {
			includeCb = () => true;
		} else {
			const re = new RegExp(includeRegex);
			includeCb = (base) => re.test(base);
		}
		try {
			const allXmlFiles = await glob(path.join(projectDir, "metadata/XML/*.xml"));
			const allChunkedXmlFiles = [];

			for (const xmlFilePath of allXmlFiles) {
				const baseName = path.basename(xmlFilePath, ".xml");
				if (!includeCb(baseName)) {
					await logWriter.write({
						sub_stage: "upload-metadata-phase-one",
						content: "Skipping: " + xmlFilePath,
					});
					continue;
				}
				const stats = await fs.stat(xmlFilePath);
				if (stats.size >= MAX_CHUNK_FILE_SIZE) {
					const didChunk = await chunkSingleXmlFile(xmlFilePath, tmpDir, baseName, allChunkedXmlFiles);
					if (!didChunk) {
						await logWriter.write({
							sub_stage: "upload-metadata-phase-one",
							content: "Could not chunk XML file at: " + xmlFilePath,
						});
						continue;
					}
				} else {
					const target = path.join(tmpDir, baseName + '.xml');
					await fs.copyFile(xmlFilePath, target);
					allChunkedXmlFiles.push(target);
				}
			}
			return [tmpDir, allChunkedXmlFiles];
		} catch (e) {
			await removeDir(tmpDir);
			throw e;
		}
	};
	const uploadChunk = async (chunk) => {
		let tryIndex = 0;
		while (true) {
			const fd = new FormData();
			fd.append('__DATA__', "{}");
			fd.append(
				'assets',
				fs.createReadStream(chunk),
				{
					knownLength: (await fs.stat(chunk)).size,
				}
			);
			const headers = {
				...fd.getHeaders(),
				'X-CSRF': 'y',
				Cookie: 'XSESSID=' + sessionId,
			};
			try {
				const result = await axios.post(
					apiBase + '/admin/validate-and-upsert/phase-one',
					fd,
					{
						withCredentials: true,
						headers: headers,
						timeout: 2 * 60 * 1000,
					}
				);
				return result.data.results;
			} catch (e) {
				console.log(e);
				if (tryIndex > 5) {
					throw e;
				}
			}
			await logWriter.write({
				sub_stage: "upload-metadata-phase-one",
				content: `Attempt to upload chunk: ${chunk} failed. Trying again (try ${tryIndex})`,
				success: false,
				high_priority: false,
			});
			await wait(200 * Math.pow(2, tryIndex));
			tryIndex++;
		}
	};
	const uploadChunks = async chunks => {
		const ret = [];
		let index = 1;
		const chunkCount = chunks.length;
		for (const chunk of chunks) {
			const result = await uploadChunk(chunk);
			ret.push(result);
			if (result.upsertErrors.length || result.xmlErrors.length) {
				if (Array.isArray(result.upsertErrors)) {
					for (const err of result.upsertErrors) {
						await sendUpsertError(logWriter, err, chunk);
					}
				}
				if (Array.isArray(result.xmlErrors)) {
					for (const err of result.xmlErrors) {
						await sendXmlError(logWriter, err, chunk);
					}
				}
			}
			await logWriter.write({
				sub_stage: "upload-metadata-phase-one",
				content: `Uploaded chunk [${index}/${chunkCount}]: ${chunk} (${result.products.length} products uploaded)`,
			});
			index++;
		}
		return ret;
	};
	await logWriter.write({
		sub_stage: "upload-metadata-phase-one",
		content: `Fetching and chunking ONIX XML files...`,
	});
	const [tmpDir, chunked] = await fetchChunkedXmlFiles();
	try {
		await logWriter.write({
			sub_stage: "upload-metadata-phase-one",
			content: `Uploading the XML chunks to '${apiBase}'...`,
		});
		await uploadChunks(chunked);
		await logWriter.write({
			sub_stage: "upload-metadata-phase-one",
			content: `Uploading complete!`,
		});
	} finally {
		await removeDir(tmpDir);
	}
};

const doMetadataPhaseTwo = async (logWriter, email, password, azureStorageConnectionString, apiBase) => {
	await logWriter.write({
		sub_stage: "upload-metadata-phase-two",
		content: `Creating session token for ${apiBase}...`,
	});
	const sessionId = await fetchClaSessionToken(apiBase, email, password);
	const result = await axios.post(
		apiBase + '/admin/validate-and-upsert/phase-two',
		{
			azure_connection_string: azureStorageConnectionString,
		},
		{
			withCredentials: true,
			headers: {
				'X-CSRF': 'y',
				Cookie: "XSESSID=" + sessionId,
			}
		}
	);
	return result.data.results;
};

module.exports = {
	doMetadataPhaseOne,
	doMetadataPhaseTwo,
};