const util = require("util");
const crypto = require("crypto");

const azureBatch = require("azure-batch");
const moment = require("moment");

const BlobResource = require("./BlobResource");
const BlobService = require("./BlobService");

const genRandomBytes = util.promisify(crypto.randomBytes);

module.exports = class Batch {
	/**
	 * @param {BlobService} blobService
	 * @param {object} creds
	 * @param {string} creds.name
	 * @param {string} creds.key
	 * @param {string} creds.url
	 */
	constructor(blobService, creds) {
		creds = creds || {};
		const accountName = creds.name || process.env.AZURE_BATCH_ACCOUNT_NAME;
		const accountKey = creds.key || process.env.AZURE_BATCH_ACCOUNT_KEY;
		const accountUrl = creds.url || process.env.AZURE_BATCH_ACCOUNT_URL;

		const credentials = new azureBatch.SharedKeyCredentials(accountName, accountKey);

		this.batchClient = new azureBatch.ServiceClient(credentials, accountUrl);

		this.blobService = blobService;
	}

	/**
	 * @param {number} length Number of bytes of generated ID. The string length will be twice this because it is hex-encoded.
	 * @returns {PromiseLike<string>}
	 */
	async generateId(length) {
		return (await genRandomBytes(length)).toString("hex");
	}

	/**
	 *
	 * @param {string} poolId
	 */
	createPool(poolId) {
		return new Promise((resolve, reject) => {
			const batchClient = this.batchClient;

			// Create a unique Azure Batch pool ID
			const poolConfig = {
				id: poolId,
				displayName: poolId,
				vmSize: "Standard_F2s_v2",
				virtualMachineConfiguration: {
					imageReference: {
						publisher: "Canonical",
						offer: "UbuntuServer",
						sku: "18.04-LTS",
						version: "latest",
					},
					nodeAgentSKUId: "batch.node.ubuntu 18.04",
				},
				enableAutoScale: true,
				autoScaleFormula: `
					startingNumberOfVMs = 0;
					maxNumberofVMs = 450;
					pendingTaskSamplePercent = $PendingTasks.GetSamplePercent(180 * TimeInterval_Second);
					pendingTaskSamples = pendingTaskSamplePercent < 70 ? startingNumberOfVMs : avg($PendingTasks.GetSample(180 * TimeInterval_Second));
					$TargetDedicatedNodes = min(maxNumberofVMs, pendingTaskSamples);
				`.trim(),
				autoScaleEvaluationInterval: moment.duration(5, "minutes"),
			};

			// Creating the Pool for the specific customer
			batchClient.pool.add(poolConfig, (error) => {
				let didError = false;
				let errorCode = null;
				if (error) {
					didError = true;
					if (error.response && error.response.body) {
						const ret = JSON.parse(error.response.body);
						errorCode = ret.code;
					} else {
						errorCode = "[unknown]";
					}
				}
				if (didError) {
					if (errorCode !== "PoolExists") {
						reject(errorCode);
						return;
					}
				}
				batchClient.pool.get(poolId, (error, result) => {
					if (!error) {
						if (result.state == "active") {
							resolve(result);
						}
					} else {
						if (error.statusCode == 404) {
							reject("Pool not found");
						} else {
							reject("Unknown error: " + error.statusCode);
						}
					}
				});
			});
		});
	}

	addJobToPool(poolId, jobId) {
		return new Promise(async (resolve, reject) => {
			this.batchClient.job.add(
				{
					id: jobId,
					displayName: jobId,
					jobPreparationTask: {
						id: `prep${await this.generateId(8)}`,
						commandLine: "sudo sh worker_init.sh",
						resourceFiles: [
							{
								httpUrl: this.blobService.generateSasToken(new BlobResource("rawuploads", "worker_init.sh")).uri,
								filePath: "worker_init.sh",
							},
						],
						waitForSuccess: true,
						userIdentity: {
							autoUser: {
								elevationLevel: "admin",
								scope: "pool",
							},
						},
					},
					poolInfo: {
						poolId: poolId,
					},
				},
				(err) => {
					if (err) {
						if (err.response && err.response.body) {
							const ret = JSON.parse(err.response.body);
							if (ret.code !== "JobExists") {
								reject(err);
								return;
							}
						} else {
							reject(err);
							return;
						}
					}
					resolve();
				}
			);
		});
	}

	fetchTaskInfo(items, readonlyDbConnectionUri, apiEndpoint) {
		const threeDaysInMinutes = 3 * 24 * 60;
		const rawCoverPagesContainerSasToken = this.blobService.generateSasToken(new BlobResource("rawcoverpages"), "r", null, threeDaysInMinutes);
		const coverPagesContainerSasToken = this.blobService.generateSasToken(new BlobResource("coverpages"), "racwd", null, threeDaysInMinutes);
		const highQualityPagesContainerSasToken = this.blobService.generateSasToken(
			new BlobResource("highqualitypages"),
			"racwd",
			null,
			threeDaysInMinutes
		);
		const pagePreviewsContainerSasToken = this.blobService.generateSasToken(new BlobResource("pagepreviews"), "racwd", null, threeDaysInMinutes);
		const rawUploadsContainerSasToken = this.blobService.generateSasToken(new BlobResource("rawuploads"), "r", null, threeDaysInMinutes);
		const pageCountContainerSasToken = this.blobService.generateSasToken(new BlobResource("pagecounts"), "racwd", null, threeDaysInMinutes);
		const binaryAssetsSasToken = this.blobService.generateSasToken(new BlobResource("privateassets"), "r", null, threeDaysInMinutes);

		const blobServiceHostEncoded = JSON.stringify(this.blobService.blobService.host || this.blobService.blobService.url);
		return items.map((item) => {
			let isbn;
			let assetType;
			let generateHighQualityImages;
			let highQualityPreviews;
			if (typeof item === "string") {
				isbn = item;
				assetType = "pdf";
				generateHighQualityImages = true;
				highQualityPreviews = false;
			} else {
				isbn = item.isbn;
				assetType = item.type || "pdf";
				generateHighQualityImages = typeof item.generateHighQualityImages === "undefined" ? true : !!item.generateHighQualityImages;
				highQualityPreviews = !!item.highQualityPreviews;
			}
			const command = `sh -c 'tar -zxvf bundle.tar.gz && npm i && node bundle.js '"'"'${apiEndpoint}'"'"' '"'"'${isbn}'"'"' '"'"'${
				rawUploadsContainerSasToken.token
			}'"'"' '"'"'${coverPagesContainerSasToken.token}'"'"' '"'"'${pagePreviewsContainerSasToken.token}'"'"' '"'"'${
				highQualityPagesContainerSasToken.token
			}'"'"' '"'"'${blobServiceHostEncoded}'"'"' '"'"'${
				pageCountContainerSasToken.token
			}'"'"' '"'"'${assetType}'"'"' '"'"'${readonlyDbConnectionUri}'"'"' '"'"'${generateHighQualityImages ? "1" : "0"}'"'"' '"'"'${
				highQualityPreviews ? "1" : "0"
			}'"'"' '"'"'${binaryAssetsSasToken.token}'"'"' '"'"'${rawCoverPagesContainerSasToken.token}'"'"''`;
			return {
				id: `${isbn}_task_${Math.floor(Math.random() * 1000000).toString()}`,
				displayName: "Process " + isbn,
				commandLine: command,
				resourceFiles: [
					{
						httpUrl: this.blobService.generateSasToken(new BlobResource("rawuploads", "bundle.tar.gz"), "r", null, threeDaysInMinutes).uri,
						filePath: "bundle.tar.gz",
					},
				],
			};
		});
	}

	submit(items, readonlyDbConnectionUri, apiEndpoint) {
		const self = this;
		return new Promise(async (resolve, reject) => {
			const poolId = `clapdfprocess`;
			const jobId = `clapdfprocessjob_${await self.generateId(8)}`;

			await self.createPool(poolId);
			await self.addJobToPool(poolId, jobId);

			Promise.all(
				this.fetchTaskInfo(items, readonlyDbConnectionUri, apiEndpoint).map(
					(taskInfo) =>
						new Promise((resolve2, reject2) => {
							const task = self.batchClient.task.add(jobId, taskInfo, (error) => {
								if (error) {
									reject2(error);
								} else {
									resolve2(task);
								}
							});
						})
				)
			)
				.then(resolve)
				.catch(reject);
		});
	}
};
