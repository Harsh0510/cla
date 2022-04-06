const ensure = require("#tvf-ensure");
const disallowedApprovedDomains = require("../../common/disallowedApprovedDomains");
const performSchoolSearch = require("./common/performSchoolSearch");

const disallowedApprovedDomainsMap = Object.create(null);
disallowedApprovedDomains.forEach((domain) => {
	disallowedApprovedDomainsMap[domain] = true;
});

/**
 * Retrieve institution data for bind institution dropdown area
 * params : {
 * 	domain(optional): 'non empty string',
 *  include_extra_data(optional): true/false,
 *  query(optional): 'non empty string',
 * }
 */
module.exports = async function (params, ctx) {
	let domain = null;
	let include_extra_data = false; //flag for insert data
	let query = null; //search with institution name
	let limit = 25; //Default limit
	let domainHasChanged = false;
	let partial_postcode_search = false;
	let full_postcode_search = false;
	let foundResults = false;

	if (params.hasOwnProperty("domainHasChanged")) {
		domainHasChanged = params.domainHasChanged ? true : false;
	}

	if (params.hasOwnProperty("domain")) {
		ensure.nonEmptyStr(ctx, params.domain, "Domain");
		ensure.isEmail(ctx, `example@${params.domain}`, `Domain`);
		domain = params.domain.toLowerCase();
	}

	if (params.hasOwnProperty("include_extra_data")) {
		ctx.assert(params.include_extra_data === true || params.include_extra_data === false, 400, "Invalid flag");
		include_extra_data = params.include_extra_data;
	}

	if (params.hasOwnProperty("partial_postcode_search")) {
		ctx.assert(typeof params.partial_postcode_search === "boolean", 400, "Invalid flag");
		partial_postcode_search = params.partial_postcode_search;
	}

	if (params.hasOwnProperty("full_postcode_search")) {
		ctx.assert(typeof params.full_postcode_search === "boolean", 400, "Invalid flag");
		full_postcode_search = params.full_postcode_search;
	}

	if (params.hasOwnProperty("query")) {
		ensure.nonEmptyStr(ctx, params.query, "Query");
		query = params.query.toLowerCase();
	}

	if (params.hasOwnProperty("limit")) {
		ensure.positiveInteger(ctx, params.limit, "limit");
		ctx.assert(params.limit <= 100, 400, "Invalid limit");
		limit = params.limit;
	}

	try {
		const paramValues = {
			include_extra_data: include_extra_data,
			domain: domain,
			domainHasChanged: domainHasChanged,
			full_postcode_search: full_postcode_search,
			partial_postcode_search: partial_postcode_search,
			query: query,
			limit: limit,
		};

		let result = [];
		//searchInTsVector as 'true' then the function behaviour doesn't change
		const searchInTsVector = await performSchoolSearch(ctx, paramValues, true);
		if (searchInTsVector.foundResults) {
			result = searchInTsVector.schoolRecords.result.rows;
		} else {
			//searchInTsVector as 'false' then replace all the (public_keywords @@ plainto_tsquery($${newBinds.push(theSearchQuery)})) clauses with (public_combined_keywords LIKE $${newBinds.push('%' + theSearchQuery.toLowerCase() + '%')})
			const searchOutTsVector = await performSchoolSearch(ctx, paramValues, false);
			if (searchOutTsVector.foundResults) {
				result = searchOutTsVector.schoolRecords.result.rows;
			}
		}

		return {
			result: result,
		};
	} catch (e) {
		ctx.throw(400, "Unknown Error");
	}
};
