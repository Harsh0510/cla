const util = require('util');
const crypto = require('crypto');
const axios = require("axios");

const genRandomBytes = util.promisify(crypto.randomBytes);

module.exports = class ErrorLogWriter {
	constructor(logUri) {
		this._logUri = logUri;
		this._batchedErrors = [];
		this._isSending = false;
		this._index = 0;
	}
	_maybeSend() {
		if (this._isSending) {
			return;
		}
		if (!this._batchedErrors.length) {
			return;
		}
		this._isSending = true;
		if (this._timeout) {
			clearTimeout(this._timeout);
		}
		this._timeout = setTimeout(() => {
			const batchedErrors = this._batchedErrors.slice(0);
			this._batchedErrors.length = 0;
			axios.post(
				this._logUri,
				{
					items: batchedErrors
				},
				{
				headers: {
					"X-CSRF": "y"
				}
			}).catch(() => {
				this._batchedErrors = batchedErrors.concat(this._batchedErrors);
			}).finally(() => {
				this._isSending = false;
				this._maybeSend();
			});
		}, 2000);
	}
	async log(item) {
		if (!this._sessionString) {
			const randomBytesBuffer = await genRandomBytes(16);
			this._sessionString = Date.now().toString() + randomBytesBuffer.toString('hex');
		}
		const logItem = { ...item };
		logItem.stage = "metadata-processing";
		logItem.date_created = Date.now();
		logItem.session_identifier = this._sessionString;
		logItem.session_index = this._index;
		this._index++;
		console.log(JSON.stringify(logItem, null, "  "));
		this._batchedErrors.push(logItem);
		this._maybeSend();
	}
	write(msg) {
		this.log(msg);
	}
	async close() {
		const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
		while (this._batchedErrors.length) {
			await wait(100);
		}
	}
};