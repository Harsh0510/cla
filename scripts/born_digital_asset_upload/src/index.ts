import path from "path";
import os from "os";
import crypto from "crypto";
import cluster, { Worker } from "cluster";

import pg, { Pool } from "pg";
import { ShareClient, ShareServiceClient } from "@azure/storage-file-share";
import { BlobServiceClient } from "@azure/storage-blob";
import deepEqual from "fast-deep-equal";
import fs from "fs-extra";

import blockingQueue from "./blockingQueue";
import getAllFilePaths from "./pdfs/getAllFilePaths";
import fetchSettings, { ISettings } from "./fetchSettings";
import processSingleAsset from "./pdfs/processSingleAsset";
import * as metadata from "./metadata/index";
import TJsonValue from "./TJsonValue";
import parseToc from "./metadata/parseToc";
import DataUpserter, { IProduct } from "./metadata/DataUpserter";

const isbnRegex = /97[0-9]{10}[0-9x]/i;

const getAllPdfPaths = async (client: ShareClient, baseDir: string, exclude: Set<string>, prefix?: string | null) => {
	return await getAllFilePaths(client, baseDir, prefix, (name: string) => {
		if (!name.match(/\.pdf$/i)) {
			return false;
		}
		const m = name.toLowerCase().match(isbnRegex);
		if (!m) {
			return false;
		}
		if (exclude.has(m[0] as string)) {
			return false;
		}
		return true;
	});
};

const getAllCoverImagePaths = async (
	client: ShareClient,
	baseDir: string,
	exclude: Set<string>,
	prefix?: string | null
) => {
	return await getAllFilePaths(client, baseDir, prefix, (name: string) => {
		if (!name.match(/\.(png|jpe?g|bmp|gif|webp)$/i)) {
			return false;
		}
		const m = name.toLowerCase().match(isbnRegex);
		if (!m) {
			return false;
		}
		if (exclude.has(m[0] as string)) {
			return false;
		}
		return true;
	});
};

interface IItem {
	isbn: string;
	pdf: string;
	cover?: string | null | undefined;
}
interface IMessageReady {
	type: "ready";
}

type TStage = "pdf-processing" | "metadata-processing";

interface IMessageError {
	type: "error";
	context: string | null;
	stage: TStage;
	error: {
		message: string;
		stack?: string | undefined;
	};
}

interface IMessagePdf {
	type: "pdf";
	item: IItem;
}

interface IMessageMetadata {
	type: "metadata";
	file: {
		old: string | null;
		new: string;
	};
}

interface IMessageProductsComplete {
	type: "products_complete";
	products: Record<string, TJsonValue>[];
}

type TMessage = IMessageReady | IMessageError | IMessagePdf | IMessageMetadata | IMessageProductsComplete;

interface ILoggerTask {
	pool: Pool;
	sessionIdentifier: string;
	sessionIndex: number;
	stage: TStage;
	context: string | null;
	message: string;
	stack?: string | undefined;
}

const makeQueues = () => {
	const errorLoggerQueue = blockingQueue(async (deets: ILoggerTask) => {
		await deets.pool.query(
			`
				INSERT INTO
					asset_processing_log
					(
						application,
						session_identifier,
						session_index,
						stage,
						asset_identifier,
						high_priority,
						success,
						content
					)
				VALUES
					(
						'bd',
						$1,
						$2,
						$3,
						$4,
						TRUE,
						FALSE,
						$5
					)
			`,
			[deets.sessionIdentifier, deets.sessionIndex, deets.stage, deets.context, deets.message + " :: " + deets.stack]
		);
		console.error(new Date(), "error!", deets.context, deets.message, deets.stack);
	});

	const productUploadQueue = blockingQueue(
		async (deets: { pool: Pool; sessionIdentifier: string; sessionIndex: number; product: IProduct }) => {
			try {
				const du = new DataUpserter(deets.pool);
				await du.upsert(deets.product);
			} catch (e) {
				const ee = e as Error;
				errorLoggerQueue.push({
					pool: deets.pool,
					context: null,
					message: ee.message,
					sessionIdentifier: deets.sessionIdentifier,
					sessionIndex: deets.sessionIndex,
					stage: "metadata-processing",
					stack: ee.stack,
				});
			}
		}
	);

	return {
		errorLoggerQueue,
		productUploadQueue,
	};
};

const fetchMetadataDiff = async (settings: ISettings) => {
	if (!settings.stages.metadataUpsert) {
		return {
			rootOld: null,
			rootNew: null,
			diffs: [],
		};
	}
	return await metadata.downloadAndDiff(
		settings.metadata.url,
		settings.metadata.revisionOld,
		settings.metadata.revisionNew
	);
};

const shuffleArray = <T>(array: T[]) => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j] as T, array[i] as T];
	}
};

const run = async () => {
	const settings = await fetchSettings();
	const serviceClient = ShareServiceClient.fromConnectionString(settings.workbench.connectionString);
	const shareClient = serviceClient.getShareClient("workbench");
	const pool = new pg.Pool({
		connectionString: settings.db.connectionString,
		max: 1,
		allowExitOnIdle: true,
	});
	if (cluster.isPrimary) {
		const { errorLoggerQueue, productUploadQueue } = makeQueues();
		const alreadyDoneIsbns = await (async () => {
			const isbns = (await pool.query<{ isbn: string }>(`SELECT isbn FROM asset_metadata`)).rows.map((p) =>
				p.isbn.toLowerCase()
			);
			return new Set(isbns);
		})();

		const metadataDiff = await fetchMetadataDiff(settings);
		let pdfPaths = settings.stages.pdfs
			? await getAllPdfPaths(shareClient, settings.workbench.pdfPath, alreadyDoneIsbns, settings.filePrefixFilter)
			: [];
		if (settings.randomizePdfs) {
			shuffleArray(pdfPaths);
		} else {
			pdfPaths.sort();
		}
		pdfPaths = pdfPaths.slice(0, settings.pdfMaxProcessCount);
		const coverImagePaths = settings.stages.pdfs
			? (
					await getAllCoverImagePaths(
						shareClient,
						settings.workbench.coverImagePath,
						alreadyDoneIsbns,
						settings.filePrefixFilter
					)
			  ).sort()
			: [];
		const itemsByIsbn: Record<string, { pdf: string; cover?: string }> = Object.create(null);
		for (const pdfPath of pdfPaths) {
			const match = path.basename(pdfPath).match(isbnRegex);
			if (!match) {
				continue;
			}
			const isbn = match[0]?.toLowerCase();
			if (!isbn) {
				continue;
			}
			if (itemsByIsbn[isbn]) {
				continue;
			}
			itemsByIsbn[isbn] = {
				pdf: pdfPath,
			};
		}
		for (const coverImagePath of coverImagePaths) {
			const match = path.basename(coverImagePath).match(isbnRegex);
			if (!match) {
				continue;
			}
			const isbn = match[0]?.toLowerCase();
			if (!isbn) {
				continue;
			}
			if (!itemsByIsbn[isbn]) {
				continue;
			}
			(itemsByIsbn[isbn] as { pdf: string; cover?: string }).cover = coverImagePath;
		}
		const items: TMessage[] = [];
		for (const item of metadataDiff.diffs) {
			items.push({
				type: "metadata",
				file: {
					old: item[0],
					new: item[1],
				},
			});
		}
		for (const isbn in itemsByIsbn) {
			items.push({
				type: "pdf",
				item: {
					isbn: isbn,
					pdf: (itemsByIsbn[isbn] as { pdf: string; cover?: string }).pdf,
					cover: (itemsByIsbn[isbn] as { pdf: string; cover?: string }).cover,
				},
			});
		}
		const beforeExit = async () => {
			if (metadataDiff.rootOld) {
				await fs.remove(metadataDiff.rootOld);
			}
			if (metadataDiff.rootNew) {
				await fs.remove(metadataDiff.rootNew);
			}
			await productUploadQueue.drain();
			await errorLoggerQueue.drain();
			if (settings.stages.metadataActivate) {
				await metadata.activateAssets(pool);
			}
		};
		const itemCount = items.length;
		if (!itemCount) {
			await beforeExit();
		} else {
			let idx = 0;
			const sessionIdentifier = Date.now().toString() + crypto.randomBytes(16).toString("hex");
			let sessionIndex = 0;
			const numCpus = Math.min(itemCount, settings.concurrency || os.cpus().length);
			let numProcessesRemaining = numCpus;
			cluster.on("exit", async () => {
				numProcessesRemaining--;
				if (numProcessesRemaining <= 0) {
					await beforeExit();
				}
			});
			cluster.on("message", (worker: Worker, msg: TMessage) => {
				if (msg.type === "ready") {
					const item = items[idx];
					console.log(new Date(), "processing [" + (idx + 1) + "/" + itemCount + "]: ", worker.id, item);
					if (item) {
						++idx;
						worker.send(item);
					} else {
						worker.kill();
					}
				} else if (msg.type === "products_complete") {
					for (const product of msg.products) {
						productUploadQueue.push({
							pool: pool,
							product: product as unknown as IProduct,
							sessionIdentifier: sessionIdentifier,
							sessionIndex: sessionIndex++,
						});
					}
				} else if (msg.type === "error") {
					errorLoggerQueue.push({
						pool: pool,
						context: msg.context,
						message: msg.error.message,
						sessionIdentifier: sessionIdentifier,
						sessionIndex: sessionIndex++,
						stage: msg.stage,
						stack: msg.error.stack,
					});
				}
			});
			for (let i = 0; i < numCpus; ++i) {
				cluster.fork();
			}
		}
	} else {
		const bsc = BlobServiceClient.fromConnectionString(settings.storageAccountConnectionString);
		const rawCoverPagesContainer = bsc.getContainerClient("rawcoverpages");
		const coverPagesContainer = bsc.getContainerClient("coverpages");
		const rawUploadsContainer = bsc.getContainerClient("rawuploads");
		const pageCountContainer = bsc.getContainerClient("pagecounts");
		process.on("message", async (item: TMessage) => {
			try {
				if (item.type === "pdf") {
					await processSingleAsset({
						isbn: item.item.isbn,
						pdfPath: item.item.pdf,
						coverImagePath: item.item.cover,
						containers: {
							rawCoverPages: rawCoverPagesContainer,
							coverPages: coverPagesContainer,
							rawUploads: rawUploadsContainer,
							pageCounts: pageCountContainer,
						},
						pool: pool,
						workbenchRootDirectoryClient: shareClient.rootDirectoryClient,
						binaries: settings.binaries,
					});
				} else if (item.type === "metadata") {
					const productsNew = await metadata.parseXmlFile(fs.createReadStream(item.file.new));
					const productsOld = item.file.old
						? (await metadata.parseXmlFile(fs.createReadStream(item.file.old))).products
						: [];
					for (const error of productsNew.errors) {
						(process as { send: (msg: TMessage) => void }).send({
							type: "error",
							stage: "metadata-processing",
							context: error.isbn || item.file.new,
							error: { message: error.message },
						});
					}
					const oldProductsByIsbn13 = Object.create(null);
					for (const product of productsOld) {
						oldProductsByIsbn13[product["pdfIsbn13"] as string] = product;
					}
					const productsToProcess: Record<string, TJsonValue>[] = [];
					for (const product of productsNew.products) {
						if (product["channel"] !== "BD") {
							continue;
						}
						const oldP = oldProductsByIsbn13[product["pdfIsbn13"] as string];
						if (!oldP || !deepEqual(oldP, product)) {
							product["_parsedToc"] = parseToc(product["toc"]) as Record<string, TJsonValue>[] | null;
							productsToProcess.push(product);
						}
					}
					if (productsToProcess.length) {
						(process as { send: (msg: TMessage) => void }).send({
							type: "products_complete",
							products: productsToProcess,
						});
					}
				} else {
					throw new Error("unknown type: " + item.type);
				}
			} catch (e) {
				const ee = e as Error;
				(process as { send: (msg: TMessage) => void }).send({
					type: "error",
					stage: item.type === "pdf" ? "pdf-processing" : "metadata-processing",
					context: item.type === "pdf" ? item.item.isbn : item.type === "metadata" ? item.file.new : null,
					error: { message: ee.message, stack: ee.stack },
				});
			}
			(process as { send: (msg: TMessage) => void }).send({ type: "ready" });
		});
		(process as { send: (msg: TMessage) => void }).send({ type: "ready" });
	}
};

(async () => {
	await run();
})();
