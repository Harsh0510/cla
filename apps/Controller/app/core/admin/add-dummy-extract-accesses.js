const moment = require("moment");
const ensure = require("#tvf-ensure");

module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();

	ctx.assert(userRole === "cla-admin", 401, "Unauthorized");

	ensure.validIdentifier(ctx, params.oid, "Extract Share OID");
	ensure.nonNegativeInteger(ctx, params.number_of_accesses, "Number of accesses");
	ctx.assert(params.number_of_accesses <= 100, `Number of accesses may not exceed 100`);
	ensure.nonEmptyStr(ctx, params.date_from, "Date from");
	ensure.nonEmptyStr(ctx, params.date_to, "Date to");

	const dateFromMoment = moment(params.date_from, "YYYY-MM-DD HH:mm:ssZ");
	const dateToMoment = moment(params.date_to, "YYYY-MM-DD HH:mm:ssZ");
	ctx.assert(dateFromMoment, "Invalid from date");
	ctx.assert(dateToMoment, "Invalid to date");

	const timestampFrom = dateFromMoment.valueOf();
	const timestampTo = dateToMoment.valueOf();

	ctx.assert(timestampFrom <= timestampTo, `From date must not be after to date`);

	const extractDetailsResults = await ctx.appDbQuery(
		`
			SELECT
				asset.id AS asset_id,
				extract_share.extract_id AS extract_id,
				asset.title AS title_of_work,
				extract.title AS title_of_copy,
				extract.oid AS extract_oid
			FROM
				extract_share
				INNER JOIN extract
					ON extract.id = extract_share.extract_id
				INNER JOIN asset
					ON asset.id = extract.asset_id
			WHERE
				extract_share.oid = $1
		`,
		[params.oid]
	);
	ctx.assert(extractDetailsResults.rowCount > 0, "No matching extract share found");
	const extractDetails = extractDetailsResults.rows[0];

	for (let i = 0; i < params.number_of_accesses; ++i) {
		const timestamp = Math.random() * (timestampTo - timestampFrom) + timestampFrom;

		await ctx.appDbQuery(
			`
			INSERT INTO
				extract_access
				(
					date_created,
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
					accessor_school_name
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
				moment(timestamp).format("YYYY-MM-DD HH:mm:ssZ"),
				extractDetails.asset_id,
				extractDetails.extract_id,
				`__DUMMY_TEST_ACCESS__`,
				extractDetails.title_of_copy,
				"0.0.0.0",
				"__DUMMY_USER_AGENT__",
				"__OCC_TESTING__",
				extractDetails.extract_oid,
				params.oid,
				0,
				null,
			]
		);
	}

	return {
		success: true,
	};
};
