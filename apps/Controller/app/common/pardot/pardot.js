const axios = require("axios");
const jwt = require("jsonwebtoken");

const { sqlToJsTimestamp } = require("../date");

if (!process.env.IS_AZURE) {
	try {
		require("./_pardot_api_details");
	} catch (e) {}
}

function getQueryString(params) {
	params = params || {};
	const usp = new URLSearchParams();
	for (const key in params) {
		if (params.hasOwnProperty(key) && params[key] !== undefined && params[key] !== null) {
			usp.append(key, params[key].toString());
		}
	}
	usp.append("format", `json`);
	return usp.toString();
}

function retTrue() {
	return true;
}

const PARDOT_API_BASE = process.env.CLA_PARDOT_API_IS_SANDBOX_MODE ? "https://pi.demo.pardot.com/api" : "https://pi.pardot.com/api";
const SALESFORCE_ORIGIN = process.env.CLA_PARDOT_API_IS_SANDBOX_MODE ? "https://test.salesforce.com" : "https://login.salesforce.com";

const privateKey = (() => {
	let k = process.env.CLA_PARDOT_API_PRIVATE_KEY;
	if (!k) {
		return "";
	}
	k = k.trim();
	if (!k) {
		return "";
	}
	if (!k.match(/^-----BEGIN PRIVATE KEY-----/ms)) {
		return "";
	}
	if (!k.match(/-----END PRIVATE KEY-----$/ms)) {
		return "";
	}
	if (k.includes("\n")) {
		return k;
	}
	const match = k.match(/^-----BEGIN PRIVATE KEY-----(.+?)-----END PRIVATE KEY-----$/s);
	if (!match) {
		return "";
	}
	const parts = [];
	parts.push("-----BEGIN PRIVATE KEY-----");
	let curr = 0;
	const len = match[1].length;
	while (curr < len) {
		const count = Math.min(64, len - curr);
		parts.push(match[1].slice(curr, curr + count));
		curr += count;
	}
	parts.push("-----END PRIVATE KEY-----");
	return parts.join("\n");
})();

class Api {
	constructor() {
		this._accessToken = ``;
	}

	async _authenticate() {
		const assertion = jwt.sign(
			{
				iss: process.env.CLA_PARDOT_API_CLIENT_ID,
				exp: Date.now() / 1000 + 604800,
				aud: SALESFORCE_ORIGIN,
				sub: process.env.CLA_PARDOT_API_SALESFORCE_USERNAME,
			},
			privateKey,
			{
				algorithm: "RS256",
			}
		);
		const params = new URLSearchParams();
		params.append("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");
		params.append("assertion", assertion);
		const result = await axios({
			method: "post",
			url: `${SALESFORCE_ORIGIN}/services/oauth2/token`,
			validateStatus: retTrue,
			data: params,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});
		if (result.status < 200 || result.status >= 300) {
			console.error("pardot authentication error", result.status, result.statusText);
			throw new Error(result.statusText);
		}
		if (!result.data.access_token) {
			throw new Error(`could not fetch access token`);
		}
		this._accessToken = result.data.access_token;
	}

	async _api(isPost, endpoint, params) {
		if (!this._accessToken) {
			await this._authenticate();
		}
		let result;
		let didRetry = false;
		const url = PARDOT_API_BASE + endpoint + "?" + getQueryString(params);
		const method = isPost ? `post` : `get`;
		while (true) {
			result = await axios({
				method,
				url,
				validateStatus: retTrue,
				headers: {
					Authorization: "Bearer " + this._accessToken,
					"Pardot-Business-Unit-Id": process.env.CLA_PARDOT_API_BUSINESS_UNIT_ID,
				},
			});
			if (result.status < 200 || result.status >= 300) {
				console.error("pardot api error [1]", result.status, method, endpoint);
				const err = new Error();
				err.result = result;
				throw err;
			}
			if (result.status !== 204 && result.data[`@attributes`].stat === "fail") {
				if (!didRetry && result.data.err === "Invalid API key or user key") {
					didRetry = true;
					await this._authenticate();
					continue;
				}
				console.error("pardot api error [2]", result.status, method, endpoint);
				const err = new Error();
				err.result = result.data;
				throw err;
			}
			result = result.data;
			break;
		}
		return result;
	}

	async post(endpoint, params) {
		return await this._api(true, endpoint, params);
	}

	async get(endpoint, params) {
		return await this._api(false, endpoint, params);
	}

	/**
	 * Fetch the
	 * @param {string} email The email address
	 */
	async getProspect(email) {
		let result;
		try {
			result = await this.get(`/prospect/version/4/do/read/email/${encodeURI(email)}`);
		} catch (e) {
			if (e.result && e.result.data && e.result.data.err === `Invalid prospect email address`) {
				return null;
			}
			throw e;
		}
		if (!result.prospect) {
			return null;
		}
		if (Array.isArray(result.prospect)) {
			// multiple prospects - return the most recently updated one
			if (result.prospect.length === 0) {
				return null;
			}
			let latestProspect = null;
			let latestUpdateTime = 0;
			for (const prospect of result.prospect) {
				const timestamp = sqlToJsTimestamp(prospect.updated_at);
				if (latestProspect === null || timestamp > latestUpdateTime) {
					latestProspect = prospect;
					latestUpdateTime = timestamp;
				}
			}
			return latestProspect;
		}
		return result.prospect;
	}

	/**
	 *
	 * @param {object} details
	 * @param {string} details.first_name
	 * @param {string} details.last_name
	 * @param {string} details.email
	 * @param {string} details.school_name
	 * @param {string} details.school_identifier
	 * @param {string} details.job_title
	 * @returns {object} The added prospect.
	 */
	async addProspect(details) {
		const qs = {};
		qs.first_name = details.first_name;
		qs.last_name = details.last_name;
		qs.EP_Status = `Registered`;
		qs.SchoolId = details.school_identifier;
		qs.SchoolName = details.school_name;
		qs.job_title = details.job_title;
		const result = await this.post(`/prospect/version/4/do/upsert/email/${encodeURI(details.email)}`, qs);
		return result.prospect;
	}

	/**
	 * Associate the provided prospectId with the default list ID.
	 * If the prospect is already a member of the list, then nothing happens.
	 * @param {number} prospectId The Pardot ID of the Prospect.
	 * @param {number} listId The Pardot ID of the List to which the Prospect should be subscribed.
	 * @param {boolean} optedIn Has the prospect opted-in to the newsletter?
	 * @return {Promise<boolean>} Indicates whether the prospected was added to the list (TRUE) or was not added (FALSE)
	 */
	async insertIgnoreListMembership(prospectId, listId, optedIn) {
		try {
			await this.insertListMembership(prospectId, listId, optedIn);
		} catch (e) {
			if (!(e.result && e.result.data && e.result.data.err)) {
				throw e;
			}
			if (e.result.data.err.indexOf("already a member of") >= 0) {
				return false;
			}
			throw e;
		}
		return true;
	}

	async insertListMembership(prospectId, listId, optedIn) {
		const qs = {
			opted_out: optedIn ? `false` : `true`,
		};
		await this.post(`/listMembership/version/4/do/create/list_id/${listId}/prospect_id/${prospectId}`, qs);
	}

	async deleteListMembership(prospectId, listId) {
		await this.post(`/listMembership/version/4/do/delete/list_id/${listId}/prospect_id/${prospectId}`);
	}

	/**
	 * Update a user's list preferences: opts them in or out of receiving newsletters
	 * @param {number} prospectId The Pardot ID of the Prospect.
	 * @param {number} listId The Pardot ID of the List to which the Prospect should be subscribed.
	 * @param {boolean} optedIn
	 * @return {Promise<void>}
	 */
	async updateListMembership(prospectId, listId, optedIn) {
		const qs = {
			opted_out: optedIn ? "false" : "true",
		};
		const result = await this.post(`/listMembership/version/4/do/update/list_id/${listId}/prospect_id/${prospectId}`, qs);
		if (!result.list_membership) {
			throw new Error(`could not update list membership [1]`);
		}
		if (
			result.list_membership.prospect_id != prospectId ||
			result.list_membership.list_id != process.env.CLA_PARDOT_API_LIST_MEMBERSHIP_ID ||
			result.list_membership.opted_out == optedIn
		) {
			throw new Error(`error updating list membership [2]`);
		}
	}

	async upsertListMembership(prospectId, listId, optedIn) {
		try {
			await this.updateListMembership(prospectId, listId, optedIn);
		} catch (e) {
			if (!(e.result && e.result.data && e.result.data.err)) {
				throw e;
			}
			if (e.result.data.err === "Invalid ID") {
				// user not already a member of this list - so add them to the list
				await this.insertListMembership(prospectId, listId, optedIn);
			} else {
				throw e;
			}
		}
	}
}

module.exports = new Api();
