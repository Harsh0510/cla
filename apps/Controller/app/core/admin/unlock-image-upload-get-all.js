const ensure = require("#tvf-ensure");
const unlockImageUploadStatus = require("../../common/unlockImageUploadStatus");
const unlockImageUploadHelpers = require("../../common/unlockImageUploadHelpers");
const STATUS_BYID = unlockImageUploadStatus.statusById;
/**
 * Get all unlock image upload data
 */
const statusByName = unlockImageUploadStatus.statusByName;

module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();
	const sessionData = await ctx.getSessionData();

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	let limit;
	let offset;
	if (params.hasOwnProperty("limit")) {
		ensure.positiveInteger(ctx, params.limit, "Limit");
		limit = params.limit;
	} else {
		limit = 10;
	}

	if (params.hasOwnProperty("offset")) {
		ensure.nonNegativeInteger(ctx, params.offset, "Offset");
		offset = params.offset;
	} else {
		offset = 0;
	}

	ensure.nonEmptyStr(ctx, params.sort_direction, "Sort Direction");

	let unfilteredCount,
		sortDirection,
		extraParam = "";

	const sortFields = Object.create(null);

	sortFields.date_created = `unlock_image_upload.date_created`;
	sortFields.user_email_log = `unlock_image_upload.user_email_log`;
	sortFields.status = `unlock_image_upload.status`;
	sortFields.school_name_log = `unlock_image_upload.school_name_log`;

	// Ensure that the sort field is a valid column name
	if (!sortFields[params.sort_field]) {
		ctx.throw(400, "Sort field not found");
	}

	const sortField = sortFields[params.sort_field];

	switch (params.sort_direction.toUpperCase()[0]) {
		case "A":
			sortDirection = "ASC";
			break;
		case "D":
			sortDirection = "DESC";
			break;
		default:
			ctx.throw(400, "Invalid sort direction");
	}

	//Filter Params
	const activeFilters = Object.create(null);
	const filterRequest = {};

	//query parameters
	const values = [];
	const whereClauses = [];
	let whereClausesSql;

	// Get all users if cla-admin and school users if school-admin
	if (userRole === "cla-admin") {
		whereClauses.push(`TRUE`);
	} else {
		values.push(sessionData.user_id);
		whereClauses.push(`(unlock_image_upload.user_id = $${values.length})`);
	}

	if (params.query) {
		ctx.assert(typeof params.query === "string", 400, "Query invalid");
		const idx = values.push(params.query);
		whereClauses.push(`(unlock_image_upload.keywords @@ plainto_tsquery($${idx}))`);
	}

	//Filter out the data whihc status not equal pending
	const idx = values.push(STATUS_BYID.pending);
	whereClauses.push(`unlock_image_upload.status != $${idx}`);
	//final where Clauses
	whereClausesSql = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

	// Count all user
	try {
		const results = await ctx.appDbQuery(
			`
					SELECT
						COUNT(*) AS _count_
					FROM
					unlock_image_upload
						${whereClausesSql}
				`,
			values
		);

		if (Array.isArray(results.rows) && results.rows.length) {
			unfilteredCount = parseInt(results.rows[0]._count_, 10);
		}
	} catch (e) {
		ctx.throw(400, "Unknown error");
	}

	// Get all unlock image upload information
	try {
		values.push(limit);
		const limitClause = `$${values.length}`;

		values.push(offset);
		const offsetClause = `$${values.length}`;

		const query = `
				SELECT
					unlock_image_upload.id,
					unlock_image_upload.oid,
					unlock_image_upload.date_created,
					unlock_image_upload.user_id,
					CASE WHEN (asset.id IS NULL AND unlock_image_upload.status='approved') THEN 'approved-pending' ELSE unlock_image_upload.status END AS status,
					unlock_image_upload.date_closed,
					unlock_image_upload.rejection_reason,
					unlock_image_upload.pdf_isbn13,
					unlock_image_upload.user_email_log,
					unlock_image_upload.school_name_log
				FROM
					unlock_image_upload
				LEFT JOIN asset 
					ON (
						unlock_image_upload.pdf_isbn13 = asset.isbn13
						OR unlock_image_upload.pdf_isbn13 = asset.alternate_isbn13
						OR unlock_image_upload.pdf_isbn13 = asset.pdf_isbn13
					)
					AND asset.active
					AND asset.is_ep
				${whereClausesSql}
				ORDER BY
					${sortField} ${sortDirection},
					unlock_image_upload.id ASC
				LIMIT
					${limitClause}
				OFFSET
					${offsetClause}
			`;
		const result = await ctx.appDbQuery(query, values);
		var resultData = [];

		if (result.rows.length > 0) {
			for (var data of result.rows) {
				data.url = await unlockImageUploadHelpers.getUnlockImageUrl(data.id);
				resultData.push(data);
			}
		}

		return {
			data: resultData,
			unfiltered_count: unfilteredCount,
		};
	} catch (e) {
		ctx.throw(400, "Unknown error");
	}
};
