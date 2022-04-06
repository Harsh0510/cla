const cluster = require("cluster");
const util = require("util");
const crypto = require("crypto");

const axios = require("axios");

const genRandomBytes = util.promisify(crypto.randomBytes);

const go = require(`./worker-lib`);

if (cluster.isMaster) {
	(async () => {
		const sessionString = Date.now().toString() + (await genRandomBytes(16)).toString("hex");
		let sessionIndex = 0;

		let childDidExit = false;
		let childExitCode;
		const logUri = process.argv[2] + "/public/asset-processing-log-insert";

		const pendingLogItems = [];
		const sendPendingLogItems = async () => {
			if (!pendingLogItems.length) {
				return;
			}
			const toSend = pendingLogItems.slice(0);
			pendingLogItems.length = 0;
			await axios.post(
				logUri,
				{
					items: toSend,
				},
				{
					headers: {
						"X-CSRF": "y",
					},
				}
			);
		};
		let timeout;
		const sendPendingLogItemsTimeout = () => {
			if (timeout) {
				clearTimeout(timeout);
			}
			timeout = setTimeout(() => {
				sendPendingLogItems().finally(() => {
					if (childDidExit) {
						process.exit(childExitCode);
					}
					sendPendingLogItemsTimeout();
				});
			}, Math.random() * 30000);
		};
		sendPendingLogItemsTimeout();
		const child = cluster.fork();
		child.on("message", (logItem) => {
			logItem = JSON.parse(logItem);
			logItem.stage = "pdf-processing";
			logItem.asset_identifier = process.argv[3];
			logItem.session_identifier = sessionString;
			logItem.session_index = sessionIndex++;
			console.log(logItem);
			pendingLogItems.push(logItem);
		});
		child.on("error", (error) => {
			if (childDidExit) {
				return;
			}
			childDidExit = true;
			childExitCode = -1;
			pendingLogItems.push({
				stage: "pdf-processing",
				asset_identifier: process.argv[3],
				high_priority: true,
				date_created: Date.now(),
				session_identifier: sessionString,
				session_index: sessionIndex++,
				success: false,
				content: error.name + "\n" + error.message + "\n" + error.stack,
				category: "server-error",
			});
			sendPendingLogItemsTimeout();
		});
		child.on("exit", (code) => {
			if (childDidExit) {
				return;
			}
			childDidExit = true;
			childExitCode = code;
			pendingLogItems.push({
				stage: "pdf-processing",
				asset_identifier: process.argv[3],
				high_priority: true,
				date_created: Date.now(),
				session_identifier: sessionString,
				session_index: sessionIndex++,
				success: childExitCode === 0,
				content: "Exit code: " + childExitCode,
				category: childExitCode === 0 ? null : "server-error",
			});
			sendPendingLogItemsTimeout();
		});
	})();
} else {
	(async () => {
		const logger = (item) => {
			item.date_created = Date.now();
			cluster.worker.send(JSON.stringify(item));
		};
		try {
			await go(logger, process.argv);
		} catch (e) {
			const msg = e.isNice ? e.message : e.name + "\n" + e.message + "\n" + e.stack;
			logger({
				content: msg,
				high_priority: true,
				success: false,
				category: e.category || "server-error",
				sub_stage: e.subStage || null,
			});
			process.exit(1);
		}
		process.exit(0);
	})();
}
