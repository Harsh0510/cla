const moment = require("moment");

const getClassYearGroup = require("./getClassYearGroup");
const apiRequestEx = require("./apiRequestEx");
const getSchoolLevel = require("./getSchoolLevel");
const getTerritoryFromPostcode = require("./getTerritoryFromPostcode");

const API_BASE_URL = `https://api.wonde.com/v1.0`;

const apiRequest = (method, endpoint, data) => apiRequestEx(method, API_BASE_URL + endpoint, data);

const trimOrNull = (str) => {
	if (typeof str !== "string") {
		if (typeof str === "undefined") {
			return null;
		}
		return str;
	}
	str = str.trim();
	return str ? str : null;
};

const dateForApi = (jsDate) => moment.utc(jsDate).format("YYYY-MM-DD HH:mm:ss");

module.exports = {
	async getApprovedSchoolIds(jsDate, page) {
		page = page || 1;
		const params = {
			per_page: 100,
			page: page,
		};
		if (jsDate) {
			params.updated_after = dateForApi(jsDate);
		}
		const result = await apiRequest("GET", "/schools", params);
		return {
			has_more: !!(result.meta && result.meta.pagination && result.meta.pagination.more),
			data: result.data.map((record) => record.id),
		};
	},
	async getRevokedSchoolIds(jsDate, page) {
		page = page || 1;
		const params = {
			per_page: 100,
			page: page,
		};
		if (jsDate) {
			params.updated_after = dateForApi(jsDate);
		}
		const result = await apiRequest("GET", "/schools/revoked", params);
		return {
			has_more: !!(result.meta && result.meta.pagination && result.meta.pagination.more),
			data: result.data.map((record) => record.id),
		};
	},
	async getLatestSchools(jsDate, page, onlyApproved) {
		page = page || 1;
		const params = {
			per_page: 100,
			page: page,
		};
		if (jsDate) {
			params.updated_after = dateForApi(jsDate);
		}
		const apiSegment = onlyApproved ? "/schools" : "/schools/all";
		const result = await apiRequest("GET", apiSegment, params);
		const ret = [];
		for (const record of result.data) {
			const school = {
				name: trimOrNull(record.name),
				urn: record.urn,
				id: record.id,
				la_code: trimOrNull(record.la_code),
				mis: trimOrNull(record.mis),
				address_postcode: trimOrNull(record.address.address_postcode),
				address_line_1: trimOrNull(record.address.address_line_1),
				address_line_2: trimOrNull(record.address.address_line_2),
				address_town: trimOrNull(record.address.address_town),
				school_level: getSchoolLevel(record.phase_of_education),
				address_country_name: record.address && record.address.address_country ? trimOrNull(record.address.address_country.name) : null,
				territory: getTerritoryFromPostcode(record.address.address_postcode),
			};
			ret.push(school);
		}
		return {
			has_more: !!(result.meta && result.meta.pagination && result.meta.pagination.more),
			data: ret,
		};
	},
	async getDistinctPhasesOfEducation() {
		const ret = {};
		let page = 1;
		while (true) {
			const result = await apiRequest("GET", "/schools/all", {
				per_page: 100,
				page: page,
			});
			const hasMore = result.meta && result.meta.pagination && result.meta.pagination.more;
			for (const record of result.data) {
				if (!ret[record.phase_of_education]) {
					ret[record.phase_of_education] = [];
				}
				ret[record.phase_of_education].push([record.id, record.name]);
			}
			if (!hasMore) {
				break;
			}
			++page;
		}
		return ret;
	},
	async getUsersForSchool(wondeSchoolIdentifier, page) {
		page = page || 1;
		const result = await apiRequest("GET", `/schools/${wondeSchoolIdentifier}/employees`, {
			include: "contact_details",
			per_page: 100,
			page: page,
		});
		const ret = [];
		for (const u of result.data) {
			if (!(u.contact_details && u.contact_details.data && u.contact_details.data.emails)) {
				continue;
			}
			const c = u.contact_details.data.emails;
			let email = c.work || c.primary || c.email;
			if (!email) {
				continue;
			}
			email = email.trim().toLowerCase();
			if (!email) {
				continue;
			}
			ret.push({
				id: u.id,
				mis_id: trimOrNull(u.mis_id),
				upi: trimOrNull(u.upi),
				email: email,
				first_name: trimOrNull(u.forename),
				last_name: trimOrNull(u.surname),
				title: trimOrNull(u.title),
			});
		}
		return {
			has_more: !!(result.meta && result.meta.pagination && result.meta.pagination.more),
			data: ret,
		};
	},
	async getClassesForSchool(wondeSchoolIdentifier, page) {
		page = page || 1;
		const result = await apiRequest("GET", `/schools/${wondeSchoolIdentifier}/classes`, {
			include: "students.year",
			per_page: 100,
			page: page,
		});
		const ret = [];
		for (const c of result.data) {
			ret.push({
				id: c.id,
				mis_id: c.mis_id,
				title: trimOrNull(c.name),
				year_group: getClassYearGroup(c),
			});
		}
		return {
			has_more: !!(result.meta && result.meta.pagination && result.meta.pagination.more),
			data: ret,
		};
	},
};
