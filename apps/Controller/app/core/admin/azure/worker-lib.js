const fs = require("fs");
const path = require("path");
const util = require("util");
const crypto = require("crypto");

const axios = require("axios");

const { Client } = require("pg");
const shellQuote = require("shell-quote").quote;

const SharedBlobService = require("./SharedBlobService");
const BlobResource = require("./BlobResource");
const generatePdfThumbnail = require("../lib/generatePdfThumbnail");
const generatePdfPagePreviews = require("../lib/generatePdfPagePreviews/index");
const generatePdfHighQualityImages = require("../lib/generatePdfHighQualityImages/index");
const getPdfPageCount = require("../lib/getPdfPageCount/index");
const customSetTimeout = require("../../../common/customSetTimeout");
const execPromise = require("../lib/execPromise");
const execFilePromise = require("../lib/execFilePromise");

const genRandomBytes = util.promisify(crypto.randomBytes);

module.exports = async function go(log, argv) {
	/**
	 * argv[2] = controller API URL base without trailing slash (e.g. 'https://api.educationplatform.co.uk')
	 * argv[3] = isbn
	 * argv[4] = container sas url to raw uploads (contains all the raw pdfs)
	 * argv[5] = container sas url to cover pages (public)
	 * argv[6] = container sas url to page previews (public)
	 * argv[7] = container sas url to high quality page screens (PRIVATE)
	 * argv[8] = JSON-encoded blob service host
	 * argv[9] = container sas url to page counts (public)
	 * argv[10] = type of asset: 'epub' or 'pdf'
	 * argv[11] = the readonly postgres connection uri
	 * argv[12] = generate high quality images of each page?
	 * argv[13] = use highqualitypages as previewpages (i.e. preview pages should be high quality?)
	 * argv[14] = container sas url to private assets (contains ghostscript and magick binaries)
	 * argv[15] = container sas url to raw cover pages
	 */
	const CONTROLLER_API_BASE = argv[2];
	const ISBN = argv[3];
	const CONTAINER_TOKEN_RAW_UPLOADS = argv[4];
	const CONTAINER_TOKEN_COVER_PAGES = argv[5];
	const CONTAINER_TOKEN_PAGE_PREVIEWS = argv[6];
	const CONTAINER_TOKEN_HIGH_QUALITY_PAGES = argv[7];
	const CONTAINER_TOKEN_PRIVATE_ASSETS = argv[14];
	const CONTAINER_TOKEN_RAW_COVER_PAGES = argv[15];
	const CONTAINER_NAME_RAW_UPLOADS = "rawuploads";
	const CONTAINER_NAME_RAW_COVER_PAGES = "rawcoverpages";
	const CONTAINER_NAME_COVER_PAGES = "coverpages";
	const CONTAINER_NAME_PAGE_PREVIEWS = "pagepreviews";
	const CONTAINER_NAME_HIGH_QUALITY_PAGES = "highqualitypages";
	const CONTAINER_NAME_PRIVATE_ASSETS = "privateassets";
	const IS_EPUB = argv[10] === "epub";
	const POSTGRES_CONNECTION_STRING = argv[11];
	const GENERATE_HIGH_QUALITY_IMAGES = argv[12] === "1";
	const HIGH_QUALITY_PREVIEW_IMAGES = argv[13] === "1";

	const blobServiceHost = JSON.parse(argv[8]);

	const CONTAINER_TOKEN_PAGE_COUNTS = argv[9];
	const CONTAINER_NAME_PAGE_COUNTS = "pagecounts";

	const blobServiceRawUploads = new SharedBlobService(blobServiceHost, CONTAINER_TOKEN_RAW_UPLOADS);
	const blobServiceRawCoverPages = new SharedBlobService(blobServiceHost, CONTAINER_TOKEN_RAW_COVER_PAGES);
	const blobServiceCoverPages = new SharedBlobService(blobServiceHost, CONTAINER_TOKEN_COVER_PAGES);
	const blobServicePagePreviews = new SharedBlobService(blobServiceHost, CONTAINER_TOKEN_PAGE_PREVIEWS);
	const blobServiceHighQualityPages = new SharedBlobService(blobServiceHost, CONTAINER_TOKEN_HIGH_QUALITY_PAGES);
	const blobServicePageCounts = new SharedBlobService(blobServiceHost, CONTAINER_TOKEN_PAGE_COUNTS);
	const blobServicePrivateAssets = new SharedBlobService(blobServiceHost, CONTAINER_TOKEN_PRIVATE_ASSETS);

	const wait = (ms) => new Promise((resolve) => customSetTimeout(resolve, ms));

	async function shouldBlurPreviews() {
		const MAX_ATTEMPTS = 4;
		let currAttempt = 0;
		let lastError;
		while (currAttempt < MAX_ATTEMPTS) {
			const client = new Client({
				connectionString: POSTGRES_CONNECTION_STRING,
				statement_timeout: 5000,
			});
			try {
				await client.connect();

				const result = await client.query(
					`
						SELECT
							publisher.blurry_preview_images AS should_blur
						FROM
							asset
							INNER JOIN publisher
								ON asset.publisher_id = publisher.id
						WHERE
							asset.isbn13 = $1
							OR asset.alternate_isbn13 = $1
							OR asset.pdf_isbn13 = $1
					`,
					[ISBN]
				);
				if (result.rowCount > 0) {
					return !!result.rows[0].should_blur;
				}
				return false;
			} catch (e) {
				lastError = e;
				currAttempt++;
			} finally {
				await client.end();
			}
			await wait(Math.random() * 1000 * 2 ** currAttempt);
		}
		if (lastError) {
			lastError.message += " [could not connect to DB]";
			throw lastError;
		}
		throw new Error(`could not connect to DB`);
	}

	async function downloadAssetFileFromBlobStorage(isbn13) {
		const ext = IS_EPUB ? ".epub" : ".pdf";
		const loc = path.join(__dirname, ISBN + `_out${ext}`);
		await blobServiceRawUploads.downloadBlob(new BlobResource(CONTAINER_NAME_RAW_UPLOADS, isbn13 + ext), loc);
		return loc;
	}

	function downloadExecutable(name) {
		return new Promise((resolve, reject) => {
			const loc = path.join(__dirname, name);
			blobServicePrivateAssets
				.downloadBlob(new BlobResource(CONTAINER_NAME_PRIVATE_ASSETS, name), loc)
				.catch(reject)
				.then(() => {
					fs.chmod(loc, 0o777, (err) => {
						if (err) {
							reject(err);
						} else {
							resolve(loc);
						}
					});
				});
		});
	}

	async function generateCoverImage(ghostscriptBinaryPath, magickBinaryPath, pdfFilePath, isbn13) {
		const thumbnailPath = path.join(__dirname, `cla-${isbn13}-thumbnail.png`);
		await generatePdfThumbnail(ghostscriptBinaryPath, magickBinaryPath, pdfFilePath, { width: 300, height: 300 }, thumbnailPath);
		return thumbnailPath;
	}

	async function uploadFileToAzureBlobStorage(localFilePath, blobService, containerName, blobName, props) {
		return await blobService.uploadFile(localFilePath, new BlobResource(containerName, blobName), props);
	}

	async function generatePagePreviews(ghostscriptBinaryPath, magickBinaryPath, pdfFilePath, isbn13, progressCallback) {
		const outputDirectory = __dirname;
		const watermarkPath = path.join(__dirname, "watermark.jpg");

		const shouldBlur = await shouldBlurPreviews();

		return await generatePdfPagePreviews(
			ghostscriptBinaryPath,
			magickBinaryPath,
			pdfFilePath,
			watermarkPath,
			isbn13,
			outputDirectory,
			shouldBlur,
			progressCallback
		);
	}

	async function generateHighQualityPageImages(ghostscriptBinaryPath, magickBinaryPath, pdfFilePath, isbn13, progressCallback) {
		const outputDirectory = __dirname;
		return await generatePdfHighQualityImages(ghostscriptBinaryPath, magickBinaryPath, pdfFilePath, isbn13, outputDirectory, progressCallback);
	}

	async function getAssetMetadata() {
		return (
			await axios.post(
				CONTROLLER_API_BASE + "/public/asset-get-metadata",
				{
					isbn13: ISBN,
				},
				{
					headers: {
						"X-CSRF": "y",
					},
				}
			)
		).data.data;
	}

	async function getEpubCoverImageDimensions(epubFilePath, magickBinaryPath) {
		const imgOutName = (await genRandomBytes(16)).toString("hex");
		const imgOutPath = path.join(__dirname, imgOutName);
		await execPromise(`ebook-meta '${epubFilePath}' --get-cover '${imgOutPath}'`);
		const result = await execFilePromise(magickBinaryPath, ["identify", "-format", "%w/%h", imgOutPath]);
		fs.unlinkSync(imgOutPath);
		const parts = result.split("/");
		return {
			width: parseInt(parts[0], 10),
			height: parseInt(parts[1], 10),
		};
	}

	async function convertEpubToPdf(epubFilePath, pdfFilePath, metadata, coverImageDimensions, coverImagePath) {
		const coverImageAspectRatio = coverImageDimensions.width / coverImageDimensions.height;
		const aspectBetween = (low, high) => coverImageAspectRatio >= low && coverImageAspectRatio < high;

		const imprint = (metadata.imprint || "").toLowerCase().trim();
		const publisher = (metadata.publisher || "").toLowerCase().trim();

		class EpubError extends Error {
			constructor(errType) {
				const subType = (() => {
					if (errType === "aspect") {
						return "Cover image aspect not allowed";
					}
					if (errType === "imprint") {
						return "Unrecognised imprint";
					}
					if (errType === "publisher") {
						return "Unrecognised publisher";
					}
					return "Unknown error";
				})();
				super(`[Publisher: ${publisher}; Imprint: ${imprint}; Cover Aspect: ${coverImageAspectRatio}] [${subType}]`);
				this.isNice = true;
				this.category = "epub-validation-failure";
				this.subStage = "epub-conversion";
			}
		}

		let margins = 60;
		let trimSize = [13, 20]; // centimetres
		let fontSize = 13;
		let lineHeight = null;

		if (publisher === "penguin random house children's uk") {
			if (imprint === "puffin" || imprint === "puffin classics") {
				if (aspectBetween(0.772, 0.93)) {
					trimSize = [19, 24];
					fontSize = 14;
				} else if (aspectBetween(0.93, 1.15)) {
					trimSize = [25, 25];
					fontSize = 14;
				} else if (aspectBetween(1.15, 1.33)) {
					trimSize = [26, 23];
					fontSize = 14;
				} else {
					throw new EpubError("aspect");
				}
			} else if (imprint === "penguin" || imprint === "penguin classics") {
				if (aspectBetween(0.6, 0.772)) {
					trimSize = [13, 20];
					fontSize = 11;
					lineHeight = 125;
				} else {
					throw new EpubError("aspect");
				}
			} else if (imprint === "bbc children's books") {
				if (aspectBetween(0.6, 0.772)) {
					trimSize = [15.5, 23];
					fontSize = 12;
				} else if (aspectBetween(0.772, 0.93)) {
					trimSize = [19, 24];
					fontSize = 14;
				} else if (aspectBetween(0.93, 1.15)) {
					trimSize = [18, 18];
					fontSize = 14;
				} else if (aspectBetween(1.15, 1.33)) {
					trimSize = [26, 23];
					fontSize = 14;
				} else {
					throw new EpubError("aspect");
				}
			} else if (imprint === "ladybird") {
				if (aspectBetween(0.6, 0.772)) {
					trimSize = [14.5, 21.5];
					fontSize = 13;
				} else if (aspectBetween(0.772, 0.93)) {
					trimSize = [19, 24];
					fontSize = 14;
				} else if (aspectBetween(0.93, 1.15)) {
					trimSize = [25, 25];
					fontSize = 14;
				} else if (aspectBetween(1.15, 1.33)) {
					trimSize = [26, 23];
					fontSize = 14;
				} else {
					throw new EpubError("aspect");
				}
			} else if (imprint === "rhcp digital") {
				if (aspectBetween(0.772, 0.93)) {
					trimSize = [23, 29];
					fontSize = 14;
				} else if (aspectBetween(0.93, 1.15)) {
					trimSize = [18, 18];
					fontSize = 14;
				} else if (aspectBetween(1.15, 1.33)) {
					trimSize = [26, 23];
					fontSize = 14;
				} else {
					throw new EpubError("aspect");
				}
			} else if (imprint === "warne") {
				if (aspectBetween(0.6, 0.772)) {
					trimSize = [11.5, 15];
					fontSize = 14;
				} else {
					throw new EpubError("aspect");
				}
			} else {
				throw new EpubError("imprint");
			}
		} else if (publisher === "penguin books ltd") {
			if (imprint === "penguin" || imprint === "penguin classics") {
				if (aspectBetween(0.6, 0.772)) {
					trimSize = [13, 20];
					fontSize = 11;
					lineHeight = 125;
				} else {
					throw new EpubError("aspect");
				}
			} else {
				throw new EpubError("imprint");
			}
		} else if (publisher === "random house") {
			if (imprint === "bbc digital") {
				if (aspectBetween(0.6, 0.772)) {
					trimSize = [13, 20];
					fontSize = 12;
				} else if (aspectBetween(0.772, 0.93)) {
					trimSize = [23, 29];
					fontSize = 14;
				} else if (aspectBetween(0.93, 1.15)) {
					trimSize = [14, 16];
					fontSize = 14;
				} else {
					throw new EpubError("aspect");
				}
			} else if (imprint === "cornerstone digital") {
				if (aspectBetween(0.6, 0.772)) {
					trimSize = [13, 20];
					fontSize = 12;
				} else {
					throw new EpubError("aspect");
				}
			} else if (imprint === "ebury digital") {
				if (aspectBetween(0.5, 0.6)) {
					trimSize = [10, 20];
					fontSize = 12;
				} else if (aspectBetween(0.6, 0.772)) {
					trimSize = [13, 20];
					fontSize = 12;
				} else if (aspectBetween(0.772, 0.93)) {
					trimSize = [23, 29];
					fontSize = 14;
				} else if (aspectBetween(0.93, 1.15)) {
					trimSize = [20, 20];
					fontSize = 14;
				} else {
					throw new EpubError("aspect");
				}
			} else if (imprint === "merky books digital") {
				if (aspectBetween(0.6, 0.772)) {
					trimSize = [13, 20];
					fontSize = 12;
				} else {
					throw new EpubError("aspect");
				}
			} else if (imprint === "preface digital") {
				if (aspectBetween(0.6, 0.772)) {
					trimSize = [13, 20];
					fontSize = 12;
				} else {
					throw new EpubError("aspect");
				}
			} else if (imprint === "vintage digital") {
				if (aspectBetween(0.6, 0.772)) {
					trimSize = [13, 20];
					fontSize = 12;
				} else if (aspectBetween(0.93, 1.15)) {
					trimSize = [13, 13];
					fontSize = 12;
				} else {
					throw new EpubError("aspect");
				}
			} else if (imprint === "virgin digital") {
				if (aspectBetween(0.6, 0.772)) {
					trimSize = [13, 20];
					fontSize = 12;
				} else if (aspectBetween(0.772, 0.93)) {
					trimSize = [20, 24];
					fontSize = 14;
				} else if (aspectBetween(0.93, 1.15)) {
					trimSize = [14, 14];
					fontSize = 12;
				} else {
					throw new EpubError("aspect");
				}
			} else {
				throw new EpubError("imprint");
			}
		} else if (publisher === "hachette") {
			if (imprint === "franklin watts") {
				trimSize = [14.5, 21.5];
				fontSize = 13;
			} else if (imprint === "wayland") {
				trimSize = [14.5, 21.5];
				fontSize = 13;
			} else {
				throw new EpubError("imprint");
			}
		} else if (publisher === "faber & faber") {
			if (aspectBetween(0.6, 0.772)) {
				trimSize = [13, 20];
				fontSize = 12;
			} else if (aspectBetween(0.772, 0.93)) {
				trimSize = [19, 24];
				fontSize = 12;
			} else if (aspectBetween(0.93, 1.15)) {
				trimSize = [25, 25];
				fontSize = 14;
			} else if (aspectBetween(1.15, 1.33)) {
				trimSize = [26, 23];
				fontSize = 14;
			} else {
				throw new EpubError("aspect");
			}
		} else if (publisher === "spck") {
			trimSize = [14.5, 21.5];
			fontSize = 12;
		} else if (publisher === "ivp") {
			trimSize = [14.5, 21.5];
			fontSize = 12;
		} else if (publisher === "crown house publishing") {
			trimSize = [14.5, 21.5];
			fontSize = 12;
		} else if (publisher === "harpercollins publishers") {
			if (aspectBetween(0.6, 0.772)) {
				trimSize = [21, 30];
				fontSize = 12;
			} else {
				throw new EpubError("aspect");
			}
		} else if (publisher === "bloomsbury publishing") {
			if (imprint === "bloomsbury education") {
				if (aspectBetween(0.5, 0.6)) {
					trimSize = [10, 20];
					fontSize = 12;
				} else if (aspectBetween(0.6, 0.772)) {
					trimSize = [16, 23];
					fontSize = 12;
				} else {
					throw new EpubError("aspect");
				}
			} else if (imprint === "methuen drama") {
				trimSize = [13, 20];
				fontSize = 12;
			} else if (imprint === "oberon books") {
				if (aspectBetween(0.48, 0.6)) {
					trimSize = [13, 21];
					fontSize = 12;
				} else if (aspectBetween(0.6, 0.772)) {
					trimSize = [13, 20];
					fontSize = 12;
				} else if (aspectBetween(0.772, 0.985)) {
					trimSize = [22, 26];
					fontSize = 12;
				} else if (aspectBetween(0.985, 1)) {
					trimSize = [25, 25];
					fontSize = 14;
				} else if (aspectBetween(1, Infinity)) {
					trimSize = [30, 25];
					fontSize = 14;
				} else {
					throw new EpubError("aspect");
				}
			} else if (imprint === "the arden shakespeare") {
				trimSize = [13, 20];
				fontSize = 12;
			} else {
				throw new EpubError("imprint");
			}
		} else if (publisher === "thames and hudson" || publisher === "thames & hudson") {
			if (aspectBetween(0.6, 0.772)) {
				trimSize = [15, 23];
				fontSize = 12;
			} else {
				throw new EpubError("aspect");
			}
		} else {
			throw new EpubError("publisher");
		}

		const cmdArgs = [epubFilePath, pdfFilePath, "--pdf-serif-family", "EB Garamond 12", "--pdf-page-numbers", "--output-profile", "generic_eink"];
		if (coverImagePath) {
			cmdArgs.push("--remove-first-image", "--cover", coverImagePath, "--preserve-cover-aspect-ratio");
		}
		cmdArgs.push(
			"--pdf-page-margin-top",
			margins,
			"--pdf-page-margin-right",
			margins,
			"--pdf-page-margin-bottom",
			margins,
			"--pdf-page-margin-left",
			margins,
			"--base-font-size",
			fontSize,
			"--pdf-default-font-size",
			fontSize,
			"--pdf-mono-font-size",
			fontSize,
			"--custom-size",
			`${trimSize[0] / 2.54}x${trimSize[1] / 2.54}` /* convert to inches */
		);
		if (lineHeight) {
			cmdArgs.push("--minimum-line-height", "125");
		}

		await execPromise(`ebook-convert ${shellQuote(cmdArgs)}`);
	}

	log({
		sub_stage: "initialization",
		content: "Starting",
	});

	const ghostscriptBinaryPath = await downloadExecutable("gs");
	log({
		sub_stage: "initialization",
		content: "Downloaded ghostscript binary",
	});

	const magickBinaryPath = await downloadExecutable("magick");
	log({
		sub_stage: "initialization",
		content: "Downloaded magick binary",
	});

	// Download original PDF/epub asset
	const assetFilePath = await downloadAssetFileFromBlobStorage(ISBN);

	log({
		sub_stage: "initialization",
		content: `Downloaded ${IS_EPUB ? "epub" : "PDF"} asset`,
	});

	// Convert EPUB to PDF if necessary
	let pdfFilePath = assetFilePath;
	if (IS_EPUB) {
		pdfFilePath = assetFilePath + ".pdf";
		const br = new BlobResource(CONTAINER_NAME_RAW_COVER_PAGES, ISBN + ".png");
		log({
			sub_stage: "epub-conversion",
			content: `Checking whether cover image exists...`,
		});
		const coverImageAlreadyExists = await blobServiceRawCoverPages.doesBlobExist(br);
		log({
			sub_stage: "epub-conversion",
			content: `Cover image exists? ${coverImageAlreadyExists ? "YES" : "NO"}`,
		});
		let coverImagePath;
		if (coverImageAlreadyExists) {
			coverImagePath = ISBN + "_cover_image_" + (await genRandomBytes(16)).toString("hex") + ".png";
			await blobServiceRawCoverPages.downloadBlob(br, coverImagePath);
			log({
				sub_stage: "epub-conversion",
				content: `Downloaded cover image`,
			});
		}
		// wait a random period of time so we don't hit the asset metadata endpoint all at the same time
		await wait(Math.random() * 30000);
		log({
			sub_stage: "epub-conversion",
			content: `Finished waiting`,
		});
		const metadata = await getAssetMetadata();
		log({
			sub_stage: "epub-conversion",
			content: `Fetched asset metadata (${JSON.stringify(metadata)})`,
		});
		if (!metadata) {
			const err = new Error(
				"Metadata not found - this usually means the asset wasn't uploaded (either because it didn't exist or because a metadata error occurred)."
			);
			err.isNice = true;
			err.category = "asset-not-found";
			err.subStage = "epub-conversion";
			throw err;
		}
		const coverImageDimensions = await getEpubCoverImageDimensions(assetFilePath, magickBinaryPath);
		log({
			sub_stage: "epub-conversion",
			content: `Calculated cover image dimensions from EPUB (${coverImageDimensions.width}x${coverImageDimensions.height})`,
		});
		await convertEpubToPdf(assetFilePath, pdfFilePath, metadata, coverImageDimensions, coverImagePath);
		log({
			sub_stage: "epub-conversion",
			content: `Converted EPUB to PDF`,
		});
	}

	// Calculate page count
	const pageCount = await getPdfPageCount(ghostscriptBinaryPath, pdfFilePath);
	log({
		sub_stage: "page-count",
		content: `Calculated page count (${pageCount})`,
	});
	const filePath = path.join(__dirname, "pagecount.txt");
	fs.writeFileSync(filePath, pageCount.toString());
	await uploadFileToAzureBlobStorage(filePath, blobServicePageCounts, CONTAINER_NAME_PAGE_COUNTS, ISBN + "___" + pageCount.toString() + ".txt");

	log({
		sub_stage: "page-count",
		content: `Uploaded page count`,
	});

	// Generate high quality pdfs
	if (GENERATE_HIGH_QUALITY_IMAGES || HIGH_QUALITY_PREVIEW_IMAGES) {
		const highQualityPngPaths = await generateHighQualityPageImages(ghostscriptBinaryPath, magickBinaryPath, pdfFilePath, ISBN, (msg) => {
			log({
				sub_stage: "high-quality-page-images",
				content: `Generate high quality images progress: ` + msg,
			});
		});

		log({
			sub_stage: "high-quality-page-images",
			content: `Generated ${highQualityPngPaths.length} high quality pages`,
		});

		for (let idx = 0; idx < highQualityPngPaths.length; ++idx) {
			await uploadFileToAzureBlobStorage(
				highQualityPngPaths[idx],
				blobServiceHighQualityPages,
				CONTAINER_NAME_HIGH_QUALITY_PAGES,
				ISBN + "/" + idx + ".png",
				{
					cacheControl: `max-age=0, no-cache, no-store, must-revalidate`,
				}
			);
			log({
				sub_stage: "high-quality-page-images",
				content: `Uploaded high quality page ${idx}`,
			});
			if (HIGH_QUALITY_PREVIEW_IMAGES) {
				await uploadFileToAzureBlobStorage(
					highQualityPngPaths[idx],
					blobServicePagePreviews,
					CONTAINER_NAME_PAGE_PREVIEWS,
					ISBN + "/" + idx + ".png"
				);
				log({
					sub_stage: "high-quality-page-images",
					content: `Also uploaded good quality page preview ${idx}`,
				});
			}
		}
		let contentMsg;
		if (HIGH_QUALITY_PREVIEW_IMAGES) {
			contentMsg = "Uploaded all high quality pages and high quality page previews";
		} else {
			contentMsg = "Uploaded all high quality pages";
		}
		log({
			sub_stage: "high-quality-page-images",
			content: contentMsg,
		});
	} else {
		log({
			sub_stage: "high-quality-page-images",
			content: `Skipped generating high quality pages`,
		});
	}

	// Generate page previews
	if (!HIGH_QUALITY_PREVIEW_IMAGES) {
		const pagePreviewPngPaths = await generatePagePreviews(ghostscriptBinaryPath, magickBinaryPath, pdfFilePath, ISBN, (msg) => {
			log({
				sub_stage: "page-previews",
				content: `Generate page preview progress: ` + msg,
			});
		});

		log({
			sub_stage: "page-previews",
			content: `Generated ${pagePreviewPngPaths.length} page previews`,
		});

		for (let idx = 0; idx < pagePreviewPngPaths.length; ++idx) {
			await uploadFileToAzureBlobStorage(pagePreviewPngPaths[idx], blobServicePagePreviews, CONTAINER_NAME_PAGE_PREVIEWS, ISBN + "/" + idx + ".png");
			log({
				sub_stage: "page-previews",
				content: `Uploaded page preview ${idx}`,
			});
		}

		log({
			sub_stage: "page-previews",
			content: `Uploaded ALL page previews`,
		});
	}

	// Generate cover image - only if necessary
	const coverImageAlreadyExists = await blobServiceCoverPages.doesBlobExist(new BlobResource(CONTAINER_NAME_COVER_PAGES, ISBN + ".png"));
	if (coverImageAlreadyExists) {
		log({
			sub_stage: "cover-image",
			content: `Cover image already exists - not creating`,
		});
	} else {
		const coverPagePngPath = await generateCoverImage(ghostscriptBinaryPath, magickBinaryPath, pdfFilePath, ISBN);

		log({
			sub_stage: "cover-image",
			content: `Generated cover image`,
		});

		await uploadFileToAzureBlobStorage(coverPagePngPath, blobServiceCoverPages, CONTAINER_NAME_COVER_PAGES, ISBN + ".png");

		log({
			sub_stage: "cover-image",
			content: `Uploaded cover image - exiting successfully`,
		});
	}
};
