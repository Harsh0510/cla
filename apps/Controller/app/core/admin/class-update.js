const ensure = require("#tvf-ensure");
const examBoards = require("../../common/examBoards");
const inputStringIsValid = require("../../common/inputStringIsValid");

const wondeClassUpdatableFields = new Set(require("../../common/wonde/classUpdatableFields"));

/**
 * Edits a single class for a particular institution
 * @param {object} params The request body
 * @param {object} ctx The context object
 */
module.exports = async function (params, ctx) {
	await ctx.ensureLoggedIn();
	const sessionData = await ctx.getSessionData();
	const userRole = sessionData.user_role;
	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin" || userRole === "school-admin" || userRole === "teacher", 401, "Unauthorized");
	// Validate inputs
	const courseUpdateFields = [];
	const courseUpdateBinds = [];
	let numFieldsChanged = 0;

	ensure.validIdentifier(ctx, params.oid, "Identifier");

	if (params.hasOwnProperty("title")) {
		ensure.nonEmptyStr(ctx, params.title, "Title");
		inputStringIsValid.lengthIsValid(ctx, params.title, "Title", null, 200);
		numFieldsChanged++;
		courseUpdateFields.push(`title = $${courseUpdateBinds.push(params.title)}`);
	}
	if (params.hasOwnProperty("key_stage")) {
		ensure.nonEmptyStr(ctx, params.key_stage, "Key Stage");
		numFieldsChanged++;
		courseUpdateFields.push(`key_stage = $${courseUpdateBinds.push(params.key_stage)}`);
	}
	if (params.hasOwnProperty("year_group")) {
		numFieldsChanged++;
		if (params.year_group) {
			ensure.nonEmptyStr(ctx, params.year_group, "Year Group");
			inputStringIsValid.lengthIsValid(ctx, params.year_group, "Year Group", null, 200);
			courseUpdateFields.push(`year_group = $${courseUpdateBinds.push(params.year_group)}`);
		} else {
			courseUpdateFields.push(`year_group = NULL`);
		}
	}
	if (params.hasOwnProperty("number_of_students")) {
		numFieldsChanged++;
		if (Number.isInteger(params.number_of_students)) {
			inputStringIsValid.nonNegativeIntegerWithMinMax(ctx, params.number_of_students, "Number of Students", 1, 10000);
			courseUpdateFields.push(`number_of_students = $${courseUpdateBinds.push(params.number_of_students)}`);
		} else {
			courseUpdateFields.push(`number_of_students = NULL`);
		}
	}
	if (params.hasOwnProperty("exam_board")) {
		numFieldsChanged++;
		if (params.exam_board) {
			ctx.assert(examBoards.byName[params.exam_board], 400, "Exam Board not found");
			courseUpdateFields.push(`exam_board = $${courseUpdateBinds.push(params.exam_board)}`);
		} else {
			courseUpdateFields.push(`exam_board = NULL`);
		}
	}
	if (userRole === "cla-admin") {
		if (params.hasOwnProperty("school_id")) {
			ensure.nonNegativeInteger(ctx, params.school_id, "Institution");
			numFieldsChanged++;
			courseUpdateFields.push(`school_id = $${courseUpdateBinds.push(params.school_id)}`);
		}
	}
	if (numFieldsChanged == 0) {
		ctx.throw(400, "No fields changed");
	}
	courseUpdateFields.push(`date_edited = NOW()`);
	courseUpdateFields.push(`modified_by_user_id = $${courseUpdateBinds.push(sessionData.user_id)}`);

	let tryingToEditBlockedFields = false;
	for (const key in params) {
		if (params.hasOwnProperty(key) && wondeClassUpdatableFields.has(key)) {
			tryingToEditBlockedFields = true;
			break;
		}
	}
	if (tryingToEditBlockedFields) {
		const binds = [];
		const whereClauses = [];
		whereClauses.push(`(oid = $${binds.push(params.oid)})`, `(archive_date IS NULL)`);
		if (userRole !== "cla-admin") {
			whereClauses.push(`(school_id = $${binds.push(sessionData.school_id)})`);
		}
		const canEdit = await ctx.appDbQuery(
			`
				SELECT
					wonde_identifier IS NULL AS can_edit
				FROM
					course
				WHERE
					${whereClauses.join(" AND ")}
			`,
			binds
		);
		if (canEdit.rowCount > 0) {
			ctx.assert(canEdit.rows[0].can_edit, 400, "Cannot edit record");
		} else {
			ctx.throw(400, "Course not found");
		}
	}

	const courseUpdateWhereClauses = [];
	{
		courseUpdateWhereClauses.push(`(course.oid = $${courseUpdateBinds.push(params.oid)})`);
	}
	if (userRole !== "cla-admin") {
		courseUpdateWhereClauses.push(`(course.school_id = $${courseUpdateBinds.push(sessionData.school_id)})`);
	}
	if (userRole === "teacher") {
		courseUpdateWhereClauses.push(`(course.creator_id = $${courseUpdateBinds.push(sessionData.user_id)})`);
	}
	courseUpdateWhereClauses.push(`(course.archive_date IS NULL)`);

	let wasEdited = false;

	const pool = ctx.getAppDbPool();
	const client = await pool.connect();
	try {
		await client.query("BEGIN");

		{
			const copyCheckWhereClauses = [];
			const copyCheckBinds = [];
			{
				copyCheckWhereClauses.push(`(course.oid = $${copyCheckBinds.push(params.oid)})`);
			}
			if (userRole !== "cla-admin") {
				copyCheckWhereClauses.push(`(course.school_id = $${copyCheckBinds.push(sessionData.school_id)})`);
			}
			if (userRole === "teacher") {
				copyCheckWhereClauses.push(`(course.creator_id = $${copyCheckBinds.push(sessionData.user_id)})`);
			}
			copyCheckWhereClauses.push(`(extract.archive_date IS NULL AND extract.date_expired > NOW())`);

			// Do not allow deleting classes with copies
			const counts = await client.query(
				`
					SELECT
						COUNT(extract.id) AS _count_
					FROM
						extract
					INNER JOIN course
						ON extract.course_id = course.id
					WHERE
						${copyCheckWhereClauses.join(` AND `)}
				`,
				copyCheckBinds
			);
			if (counts && Array.isArray(counts.rows) && counts.rows.length > 0 && counts.rows[0]._count_ > 0) {
				throw "You may not edit a class that has active copies";
			}
		}

		/** Update the course information of a class specified by oid */
		const result = await client.query(
			`
				UPDATE
					course
				SET
					${courseUpdateFields.join(",")}
				WHERE
					${courseUpdateWhereClauses.join(` AND `)}
			`,
			courseUpdateBinds
		);

		await client.query("COMMIT");

		wasEdited = result.rowCount > 0;
	} catch (e) {
		await client.query("ROLLBACK");
		if (typeof e === "string") {
			ctx.throw(400, e);
		} else {
			if (e.message.indexOf(` violates unique constraint `) !== -1) {
				ctx.throw(400, `A class with that name already exists`);
			} else {
				ctx.throw(400, "Unknown Error [1]");
			}
		}
	} finally {
		client.release();
	}

	/** Return whether or not it has been edited */
	return {
		result: {
			edited: wasEdited,
		},
	};
};
