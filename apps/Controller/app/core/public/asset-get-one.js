const ensure = require("#tvf-ensure");
const isUnlockedSql = require("../../common/isUnlockedSql");
const azureBlobService = require("../admin/azure/azureBlobService");
const BlobResource = require("../admin/azure/BlobResource");

let subjectCodeToNameMap = null;

const generateSasTokenFake = () => {
	return "sas token";
};
const generateSasTokenReal = (ip) => {
	return azureBlobService.generateSasToken(new BlobResource("pagepreviews"), "r", ip).token;
};
const generateSasToken = azureBlobService ? generateSasTokenReal : generateSasTokenFake;

module.exports = async function (params, ctx) {
	ensure.validAssetIdentifier(ctx, params.isbn13, "ISBN");
	if (params.fetch_sas_token) {
		// fetch Azure SAS token for page previews
		await ctx.ensureLoggedIn();
	}

	if (!subjectCodeToNameMap) {
		const subjects = (
			await ctx.appDbQuery(`
			SELECT
				code, name
			FROM
				subject
		`)
		).rows;
		subjectCodeToNameMap = Object.create(null);
		for (const subject of subjects) {
			subjectCodeToNameMap[subject.code] = subject.name;
		}
	}

	const sessionData = await ctx.getSessionData();
	const school_id = sessionData ? sessionData.school_id : 0;
	const userId = sessionData ? sessionData.user_id : 0;
	const isLoggedIn = sessionData ? true : false;
	const binds = [];
	const joins = [];
	const whereClauses = [];

	joins.push(`
		LEFT JOIN asset_school_info
			ON asset_school_info.asset_id = asset.id
			AND asset_school_info.school_id = $${binds.push(school_id)}
		LEFT JOIN publisher
			ON asset.publisher_id = publisher.id
	`);
	if (userId) {
		joins.push(`
			LEFT JOIN asset_user_info
				ON asset_user_info.asset_id = asset.id AND asset_user_info.user_id = ${userId}
		`);
	}
	whereClauses.push(`(asset.pdf_isbn13 = $${binds.push(params.isbn13)})`);
	whereClauses.push("asset.active", "asset.is_ep");

	const result = await ctx.appDbQuery(
		`
			SELECT
				asset.id AS id,
				asset.content_form AS content_form,
				asset.title AS title,
				asset.sub_title AS sub_title,
				asset.description AS description,
				asset.page_count AS page_count,
				asset.table_of_contents AS table_of_contents,
				asset.edition AS edition,
				asset.imprint AS imprint,
				asset.publication_date AS publication_date,
				asset.subject_codes_log AS subject_codes,
				asset.publisher_name_log AS publisher,
				asset.authors_log AS authors,
				asset.buy_book_link AS buy_book_link,
				${isUnlockedSql(isLoggedIn)} AS is_unlocked,
				asset.page_offset_roman AS page_offset_roman,
				asset.page_offset_arabic AS page_offset_arabic,
				asset.copy_excluded_pages AS copy_excluded_pages,
				${userId ? "COALESCE(asset_user_info.is_favorite, FALSE)" : "FALSE"} AS is_favorite,
				asset.auto_unlocked AS auto_unlocked,
				asset.can_copy_in_full as can_copy_in_full,
				asset.file_format as file_format,
				publisher.temp_unlock_opt_in AS temp_unlock_opt_in
			FROM
				asset
			${joins.join(" ")}
			WHERE
				${whereClauses.join(" AND ")}
		`,
		binds
	);
	const response = {};

	if (result && result.rows && result.rows.length) {
		response.result = result.rows[0];
		if (sessionData && sessionData.user_role === "cla-admin") {
			response.is_unlocked = false;
		} else {
			response.is_unlocked = !!response.result.is_unlocked;
		}
		if (params.fetch_sas_token) {
			response.sas_token = generateSasToken();
		}
	} else {
		response.result = null;
	}

	return response;
};
