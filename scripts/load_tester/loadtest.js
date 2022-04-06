const http = require("http");
const https = require("https");

const casync = require("async");

/**
 * 
 * @param {URL|string} opts.url 
 * @param {string} opts.method 
 * @param {object} opts.data 
 * @param {object} opts.headers 
 */
function request(opts, callback) {
	let invoked = false;
	const invoke = (...args) => {
		if (!invoked) {
			invoked = true;
			callback(...args);
		}
	};
	const url = (typeof opts.url === "string") ? new URL(opts.url) : opts.url;

	const data = JSON.stringify(opts.data || {});

	const options = {
		method: opts.method || 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': data.length,
		},
	};
	Object.assign(options.headers, opts.headers);

	let h;
	if (url.protocol === "https:") {
		h = https;
	} else {
		h = http;
	}

	const start = Date.now();
	const req = h.request(url, options, res => {
		const statusCode = res.statusCode;
		if (statusCode >= 200 && statusCode < 300) {
			invoke(
				null,
				{
					time_taken_ms: Date.now() - start,
				}
			);
		} else {
			invoke({
				type: `http-error`,
				status: statusCode,
				msg: res.statusMessage,
			});
		}
	});
	req.setTimeout(10000, () => {
		invoke({
			type: `timeout`,
		});
	});

	req.on('error', error => {
		invoke({
			type: `general-error`,
			data: error,
		});
	});

	req.write(data);
	req.end();
}

module.exports = async function(opts, fetcher) {
	const successes = [];
	const errors = [];
	fetcher = fetcher || opts.fetcher;

	const start = Date.now();
	const end = start + opts.duration * 1000;
	const queue = casync.queue((task, callback) => {
		const rstart = Date.now();
		request(task, (err, result) => {
			if (err) {
				console.log(`FUCKED`, task.url, err);
				errors.push(err);
			} else {
				successes.push(result);
			}
			const rdiff = Date.now() - rstart;
			const toSleep = Math.max(100, 999 - rdiff);
			setTimeout(() => {
				if (Date.now() < end) {
					queue.push(fetcher());
				}
				callback(err, result);
			}, toSleep);
		});
	}, opts.concurrency);
	for (let i = 0; i < opts.concurrency; ++i) {
		queue.push(fetcher());
	}
	await queue.drain();
	const timeTaken = Date.now() - start;

	const timesTaken = successes.map(v => v.time_taken_ms);
	timesTaken.sort((a, b) => a - b);
	const numTimesTaken = timesTaken.length;
	const percentiles = {};
	if (numTimesTaken >= 3) {
		const s = Math.floor(numTimesTaken / 2);
		if (numTimesTaken % 2) {
			percentiles["50"] = timesTaken[s];
		} else {
			percentiles["50"] = (timesTaken[s - 1] + timesTaken[s]) * 0.5;
		}
		percentiles["90"] = timesTaken[Math.floor(numTimesTaken * 0.9)];
		percentiles["99"] = timesTaken[Math.floor(numTimesTaken * 0.99)];
		percentiles["99.9"] = timesTaken[Math.floor(numTimesTaken * 0.999)];
		percentiles["99.99"] = timesTaken[Math.floor(numTimesTaken * 0.9999)];
	}
	const numRequests = successes.length + errors.length;
	return {
		num_requests: numRequests,
		mean: timesTaken.reduce((a, b) => a + b, 0) / numTimesTaken,
		median: percentiles["50"],
		nine_nine_nine: percentiles["99.9"],
		num_failures: errors.length,
		rps: numRequests / (timeTaken / 1000),
		time_taken_ms: timeTaken,
		percentiles: percentiles,
	};
}

// module.exports = async function (opts) {

// };