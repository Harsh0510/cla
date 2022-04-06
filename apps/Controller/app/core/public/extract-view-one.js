const ensure = require("#tvf-ensure");
const { ensureCanCopy } = require("../auth/common/canCopy");
const getAssetPagesWithoutExcludedPages = require("./common/getAssetPagesWithoutExcludedPages");
const generateExtractViewUrlsWrap = require("./common/generateExtractViewUrlsWrap");
const { extractStatus, userRoles } = require("../../common/staticValues");
const getExtractUserAssetUrl = require("./common/getExtractUserAssetUrl");
const EXTRACT_STATUS_EDITABLE = extractStatus.editable;
const EXTRACT_STATUS_ACTIVE = extractStatus.active;

module.exports = async function (params, ctx, generateExtractViewUrls) {
	ensure.validIdentifier(ctx, params.extract_oid, "extract_oid");
	let currentUser = null;
	let school_id = 0;
	const sessionData = await ctx.getSessionData();
	const currUserId = sessionData ? sessionData.user_id || 0 : 0;
	if (!sessionData) {
		currentUser = userRoles.viewers;
		ensure.validIdentifier(ctx, params.extract_share_oid, "Extract Share");
	} else {
		await ensureCanCopy(ctx);
		currentUser = sessionData.user_role;
		if (currentUser !== userRoles.claAdmin) {
			ctx.assert(sessionData.school_id, 401, "You must be associated with a school to create an extract");
			school_id = sessionData.school_id;
		}
		if (params.extract_share_oid) {
			if (params.extract_share_oid != "share") {
				// teachers/school-admins may see any extract from their school
				ensure.validIdentifier(ctx, params.extract_share_oid, "extract_share_oid");
			} else {
				ctx.assert(params.extract_share_oid === "share", 401, "extract_share_oid invalid");
			}
		}
	}

	const joins = [];
	const selectColumns = [
		"asset.pdf_isbn13 AS work_isbn13",
		"extract.pages AS pages",
		"asset.copy_excluded_pages AS copy_excluded_pages",
		"extract.is_watermarked AS is_watermarked",
		"extract.status AS extract_status",
		"asset_user_upload.filename AS asset_filename",
	];
	const values = [];
	let idx = 1;
	const whereClauses = [];

	joins.push("INNER JOIN asset ON extract.asset_id = asset.id");
	joins.push("LEFT JOIN asset_user_upload ON asset_user_upload.id = extract.asset_user_upload_id");
	whereClauses.push("(extract.archive_date IS NULL)");
	whereClauses.push(`(extract.oid = $${idx++})`);
	values.push(params.extract_oid);

	if (params.extract_share_oid && params.extract_share_oid === "share" && currentUser !== userRoles.viewers) {
		//cla-admin/teachers/school-admins may see any extract from their school for mobile and table view
		if (currentUser !== userRoles.claAdmin) {
			whereClauses.push(`(extract.school_id = $${idx++})`);
			values.push(sessionData.school_id);
		}
		selectColumns.push("extract.date_expired AS date_expired");
	} else {
		if (params.extract_share_oid && params.extract_share_oid != "share") {
			joins.push("INNER JOIN extract_share ON extract.id = extract_share.extract_id");
			whereClauses.push(`(extract_share.archive_date IS NULL)`);
			whereClauses.push(`(extract_share.oid = $${idx++})`);
			values.push(params.extract_share_oid);
			selectColumns.push("extract_share.date_expired AS date_expired");
		} else {
			selectColumns.push("extract.date_expired AS date_expired");
		}
		selectColumns.push("extract.asset_id AS asset_id");
		selectColumns.push("extract.id AS extract_id");
		selectColumns.push("asset.title AS work_title");
		selectColumns.push("extract.title AS title");
		selectColumns.push("extract.user_id AS extract_user_id");
	}

	let extract;

	const results = await ctx.appDbQuery(
		`
			SELECT
				${selectColumns.join(", ")}
			FROM
				extract
				${joins.join(" ")}
			WHERE
				${whereClauses.join(" AND ")}

		`,
		values
	);
	if (Array.isArray(results.rows) && results.rows.length) {
		extract = results.rows[0];
	}

	ctx.assert(extract, 400, "Extract not found");
	if (
		((currentUser === userRoles.viewers || params.extract_share_oid) && extract.date_expired && extract.date_expired.getTime() < Date.now()) ||
		extract.extract_status === extractStatus.cancelled
	) {
		ctx.throw(400, `The link to this content has expired. If you made the copy, please regenerate the link here.`);
	} else if (params.extract_share_oid && extract && params.extract_share_oid != "share") {
		//update extract status if extract status is editable
		if (
			extract.extract_status === EXTRACT_STATUS_EDITABLE &&
			((sessionData && sessionData.user_role !== userRoles.claAdmin && extract.extract_user_id != currUserId) || !sessionData)
		) {
			await ctx.appDbQuery(
				`
					UPDATE extract
					SET
						status = $1,
						modified_by_user_id = $4,
						date_edited = NOW()
					WHERE id = $2
						AND extract.archive_date IS NULL
						AND extract.status = $3
				`,
				[EXTRACT_STATUS_ACTIVE, extract.extract_id, EXTRACT_STATUS_EDITABLE, currUserId]
			);
		}
		// insert data into the extraxt_access table
		const { header } = ctx._koaCtx.request;
		const sourceUserAgent = header["user-agent"] ? header["user-agent"] : "";
		const sourceReferrer = header["referrer"] ? header["referrer"] : "";
		const userAgent = sourceUserAgent.slice(0, 255);
		const referrer = sourceReferrer.slice(0, 255);
		const ipAddress = ctx.getClientIp();

		const accessorSchoolName = sessionData && sessionData.school ? sessionData.school : null;

		await ctx.appDbQuery(
			`
				INSERT INTO
					extract_access
					(
						asset_id,
						extract_id,
						title_of_work,
						title_of_copy,
						ip_address,
						user_agent,
						referrer,
						extract_oid,
						extract_share_oid,
						accessor_school_id,
						accessor_school_name,
						user_id
					)
				VALUES
					(
						$1,
						$2,
						$3,
						$4,
						$5,
						$6,
						$7,
						$8,
						$9,
						$10,
						$11,
						$12
					)
			`,
			[
				extract.asset_id,
				extract.extract_id,
				extract.work_title,
				extract.title,
				ipAddress,
				userAgent,
				referrer,
				params.extract_oid,
				params.extract_share_oid,
				school_id,
				accessorSchoolName,
				currUserId,
			]
		);
	}
	let viewUrls = null;
	let assetUrl = null;
	if (extract.asset_filename) {
		assetUrl = getExtractUserAssetUrl(extract.asset_filename);
	} else {
		const pagesWithoutExcludedPages = getAssetPagesWithoutExcludedPages(extract.pages, extract.copy_excluded_pages);
		viewUrls = await generateExtractViewUrlsWrap(
			generateExtractViewUrls,
			pagesWithoutExcludedPages,
			extract.is_watermarked,
			extract.work_isbn13,
			params.extract_oid,
			extract.pages,
			extract.copy_excluded_pages
		);
	}
	return {
		asset: assetUrl,
		urls: viewUrls,
		is_watermarked: extract.is_watermarked,
	};
};
