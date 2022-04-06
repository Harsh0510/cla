import MyXMLHttpRequest from "./MyXMLHttpRequest";
import apiBaseOrigin from "./apiBaseOrigin";

const getParamsToSend = (params) => {
	const paramsToSend = {};
	if (params) {
		if (params instanceof HTMLFormElement || params instanceof FormData) {
			let fd;
			if (params instanceof HTMLFormElement) {
				fd = new FormData(params);
			} else {
				fd = params;
			}
			for (const pair of fd.entries()) {
				paramsToSend[pair[0]] = pair[1];
			}
		} else if (typeof params === "object") {
			Object.assign(paramsToSend, params);
		}
	}
	return JSON.stringify(paramsToSend);
};

/**
 *
 * @param {string} endpoint
 * @param {object} params
 * @param {object} [options]
 * @param {boolean} [options.binary] Submit to a binary endpoint?
 * @param {number} [options.timeout] Timeout in milliseconds.
 * @param {{[key: string]: File}} [options.files] Optional files to submit to endpoint.
 */
export default function (endpoint, params, options) {
	const isBinary = options && options.binary;
	const customTimeout = options && options.timeout ? options.timeout : 120000; // default 120 seconds
	const url = apiBaseOrigin + endpoint;
	return new Promise((resolve, reject) => {
		let hasResolved = false;

		const xhr = new MyXMLHttpRequest();
		xhr.open("POST", url);
		xhr.withCredentials = true;
		if (!isBinary) {
			xhr.setRequestHeader("Content-Type", "application/json");
		}
		xhr.setRequestHeader("X-CSRF", "y");

		const sessId = localStorage.getItem("sessId");
		if (sessId) {
			xhr.setRequestHeader("X-SESSID", sessId);
		}
		xhr.timeout = customTimeout;
		const timeoutHandle = setTimeout(() => {
			if (!hasResolved) {
				hasResolved = true;
				xhr.abort();
				reject("timeout");
			}
		}, customTimeout);
		xhr.ontimeout = () => {
			if (!hasResolved) {
				hasResolved = true;
				clearTimeout(timeoutHandle);
				reject("timeout");
			}
		};
		xhr.onreadystatechange = (_) => {
			if (xhr.readyState === 4) {
				clearTimeout(timeoutHandle);
				if (sessId) {
					const newSessId = xhr.getResponseHeader("X-SESSID");
					if (sessId != newSessId) {
						if (newSessId) {
							localStorage.setItem("sessId", newSessId);
						} else {
							localStorage.removeItem("sessId");
						}
						window.location.reload(true);
						return;
					}
				}
				if (!hasResolved) {
					hasResolved = true;
					if (xhr.status >= 200 && xhr.status < 300) {
						const response = JSON.parse(xhr.responseText);
						resolve(response);
					} else {
						reject(xhr.responseText);
					}
				}
			}
		};
		let paramsToSend;
		if (isBinary) {
			paramsToSend = new FormData();
			paramsToSend.append(`__DATA__`, getParamsToSend(params));
			if (options.files) {
				for (const key in options.files) {
					if (!Object.prototype.hasOwnProperty.call(options.files, key)) {
						continue;
					}
					paramsToSend.append(key, options.files[key]);
				}
			}
		} else {
			paramsToSend = getParamsToSend(params);
		}
		xhr.send(paramsToSend);
	});
}
