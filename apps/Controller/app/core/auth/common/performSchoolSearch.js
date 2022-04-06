const getSchoolRecords = require("./getSchoolRecords");
const getSchoolByRegx = require("./getSchoolByRegx");

const ROLE_SCHOOL_ADMIN = "school-admin";

/**
 * Retrieve school data for bind school dropdown area
 * ctx: context
 * values: cantaining the params value
 * searchInTsVector: boolean parameter
 *	true: If that's true, then the function behaviour doesn't change.
 *	params: values which need to bind with query
 *	false: If it's 'false' then replace all the (public_keywords @@ plainto_tsquery($${newBinds.push(theSearchQuery)})) clauses with (public_combined_keywords LIKE $${newBinds.push('%' + theSearchQuery.toLowerCase() + '%')})
 */
module.exports = async function (ctx, params, searchInTsVector) {
	const { include_extra_data, domain, domainHasChanged, full_postcode_search, partial_postcode_search, query, limit } = params;

	const columns = ["school.id AS id", "school.name AS name"];

	const caseColumns = [];
	const whereClauses = [];
	const tableJoins = [];
	const binds = [];

	let foundResults = false;
	let schoolRecords = [];

	if (include_extra_data) {
		columns.push("school.address1 AS address1");
		columns.push("school.address2 AS address2");
		columns.push("school.city AS city");
		columns.push("school.post_code AS post_code");
		caseColumns.push(", CASE WHEN (school.city IS NULL OR TRIM(school.city) = '') THEN CONCAT(school.name,', ', school.post_code )");
		caseColumns.push("WHEN (school.post_code IS NULL OR TRIM(school.post_code) = '') THEN CONCAT(school.name,', ', school.city)");
		caseColumns.push("ELSE CONCAT(school.name,', ',school.city,', ', school.post_code)  END AS title");
	}

	// if we get the domain and domain on change
	if (domain && domainHasChanged) {
		const bindIdx = binds.push(`${domain}%`);
		tableJoins.push(`LEFT JOIN approved_domain ON school.id = approved_domain.school_id`);
		tableJoins.push(`LEFT JOIN cla_user ON school.id = cla_user.school_id AND cla_user.role = '${ROLE_SCHOOL_ADMIN}'`);
		whereClauses.push(`(LOWER(approved_domain.domain) LIKE $${bindIdx})`);
		schoolRecords = await getSchoolRecords(ctx, columns, caseColumns, whereClauses, tableJoins, limit, binds);
		if (schoolRecords.result.rowCount > 0) {
			foundResults = true;
		}
	}

	// if we don't get any results for domain, then first try a full postcode search (if requested)
	if (!foundResults && full_postcode_search) {
		const newBinds = binds.slice(0);
		const newWhereClauses = whereClauses.slice(0);
		const bindQuery = newBinds.push(`${query}`);
		newWhereClauses.push(`(postcode_lower = $${bindQuery})`);
		schoolRecords = await getSchoolRecords(ctx, columns, caseColumns, newWhereClauses, tableJoins, limit, newBinds);
		if (schoolRecords.result.rowCount > 0) {
			foundResults = true;
		}
	}
	// if we don't get any results, then fall back to a partial postcode search (if requested)
	if (!foundResults && partial_postcode_search) {
		const newBinds = binds.slice(0);
		const newWhereClauses = whereClauses.slice(0);
		const bindQuery = newBinds.push(`${query}`);
		newWhereClauses.push(`(postcode_first_part_lower = $${bindQuery})`);
		schoolRecords = await getSchoolRecords(ctx, columns, caseColumns, newWhereClauses, tableJoins, limit, newBinds);
		if (schoolRecords.result.rowCount > 0) {
			foundResults = true;
		}
	}

	// no results - try extracting a full postcode from the query if possible and perform a postcode search
	if (!foundResults) {
		//try extracting a full postcode from the query if possible and perform a postcode search
		const postcodeRegex = /(([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2}))/;
		schoolRecords = await getSchoolByRegx(
			ctx,
			postcodeRegex,
			query,
			whereClauses,
			columns,
			caseColumns,
			tableJoins,
			limit,
			binds,
			false,
			searchInTsVector
		);
		if (schoolRecords && schoolRecords.result.rowCount > 0) {
			foundResults = true;
		} else {
			//try extracting a partial postcode from the query if possible and perform a postcode search
			const postcodePartialRegex = /(([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))[0-9a-zA-Z]?/;
			schoolRecords = await getSchoolByRegx(
				ctx,
				postcodePartialRegex,
				query,
				whereClauses,
				columns,
				caseColumns,
				tableJoins,
				limit,
				binds,
				true,
				searchInTsVector
			);
			if (schoolRecords && schoolRecords.result.rowCount > 0) {
				foundResults = true;
			}
		}
	}

	// otherwise if we have no results, then fallback to a normal fulltext search
	if (!foundResults) {
		const newBinds = binds.slice(0);
		const newWhereClauses = whereClauses.slice(0);
		if (searchInTsVector) {
			const bindQuery = newBinds.push(query);
			newWhereClauses.push(`(public_keywords @@ plainto_tsquery($${bindQuery}))`);
		} else {
			const queryLower = query ? query.toLowerCase() : "";
			const bindQuery = newBinds.push("%" + queryLower + "%");
			newWhereClauses.push(`(public_combined_keywords LIKE $${bindQuery})`);
		}

		schoolRecords = await getSchoolRecords(ctx, columns, caseColumns, newWhereClauses, tableJoins, limit, newBinds);
		if (schoolRecords.result.rowCount > 0) {
			foundResults = true;
		}
	}
	return {
		foundResults: foundResults,
		schoolRecords: schoolRecords,
	};
};
