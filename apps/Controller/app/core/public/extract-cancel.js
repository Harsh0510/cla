const ensure = require("#tvf-ensure");
const getExtractPagesForCourse = require("../../common/getExtractPagesForCourse");
const { extractStatus, userRoles } = require("../../common/staticValues");
const updateExtractCoursePage = require("../../common/updateExtractCoursePage");
const updateExtractSchoolPage = require("../../common/updateExtractSchoolPage");
const getExtractPagesForSchool = require("../../common/getExtractPagesForSchool");

module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();

	ensure.validIdentifier(ctx, params.oid, "Extract Oid");
	const sessionData = await ctx.getSessionData();
	const currentUserRole = sessionData.user_role;

	let result;
	const whereClause = ["(grace_period_end >= NOW())", "(archive_date IS NULL)", `(oid = '${params.oid}')`, `(status = '${extractStatus.editable}')`];

	if (currentUserRole !== userRoles.claAdmin) {
		whereClause.push(`(school_id=${sessionData.school_id})`);
	}

	let extractId;

	const pool = ctx.getAppDbPool();
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		result = await client.query(
			`
				UPDATE
					extract
				SET
					status = $1,
					modified_by_user_id = $2,
					date_edited = NOW()
				WHERE
					${whereClause.join(" AND ")}
				RETURNING
					oid,
					asset_id,
					course_id,
					school_id,
					id
			`,
			[extractStatus.cancelled, sessionData.user_id]
		);
		if (!result.rowCount) {
			ctx.throw(400, "extract not found");
		}

		const querier = ctx.appDbQuery.bind(ctx);
		const extract = result.rows[0];
		extractId = extract.id;
		const extractPagesForSchool = await getExtractPagesForSchool(querier, extract.school_id, extract.asset_id, extract.id, []);
		const extractPagesForCourse = await getExtractPagesForCourse(querier, extract.school_id, extract.asset_id, extract.id, extract.course_id, []);

		//update extract pages for school
		await updateExtractSchoolPage(client.query.bind(client), extract.asset_id, extract.school_id, extractPagesForSchool);
		//update extract pages for course
		await updateExtractCoursePage(client.query.bind(client), extract.asset_id, extract.course_id, extractPagesForCourse);

		await client.query("COMMIT");
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		client.release();
	}

	await ctx.appDbQuery(
		`
			INSERT INTO
				extract_status_change_event
				(
					category,
					user_id,
					extract_id
				)
			VALUES
				(
					'cancel',
					$1,
					$2
				)
		`,
		[sessionData.user_id, extractId]
	);

	return {
		result: result.rowCount > 0,
	};
};
