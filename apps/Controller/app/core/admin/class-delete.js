const ensure = require("#tvf-ensure");

/**
 * Deletes a class
 * @param {object} params The request body
 * @param {object} ctx The context object
 */
module.exports = async function (params, ctx) {
	const userRole = await ctx.getUserRole();
	const sessionData = await ctx.getSessionData();

	// Throw an error if non admins attempt to access this endpoint
	ctx.assert(userRole === "cla-admin" || userRole === "school-admin" || userRole === "teacher", 401, "Unauthorized");

	// Validate the supplied oid
	ensure.validIdentifier(ctx, params.oid, "OID");

	const whereClauses = [];
	const binds = [];
	{
		const bindIdx = binds.push(params.oid);
		whereClauses.push(`(course.oid = $${bindIdx})`);
	}
	if (userRole !== "cla-admin") {
		const bindIdx = binds.push(sessionData.school_id);
		whereClauses.push(`(course.school_id = $${bindIdx})`);
	}
	if (userRole === "teacher") {
		const bindIdx = binds.push(sessionData.user_id);
		whereClauses.push(`(course.creator_id = $${bindIdx})`);
	}
	whereClauses.push(`(course.archive_date IS NULL)`);
	const whereSql = whereClauses.join(` AND `);

	const checkCountWhereClauses = whereClauses.slice(0);
	checkCountWhereClauses.push(`(extract.archive_date IS NULL AND extract.date_expired > NOW())`);
	const checkCountWhereSql = checkCountWhereClauses.join(" AND ");

	let wasDeleted = false;

	const pool = ctx.getAppDbPool();
	const client = await pool.connect();
	try {
		await client.query("BEGIN");

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
					${checkCountWhereSql}
			`,
			binds
		);
		if (counts && Array.isArray(counts.rows) && counts.rows.length > 0 && counts.rows[0]._count_ > 0) {
			throw "You may not delete a class that has active copies";
		}

		/** Delete the class row from the database and return the oid of the deleted class */
		const result = await client.query(
			`
				DELETE FROM
					course
				WHERE
					${whereSql}
				RETURNING
					id
			`,
			binds
		);

		await client.query("COMMIT");

		wasDeleted = result.rowCount > 0;
	} catch (e) {
		await client.query("ROLLBACK");
		if (typeof e === "string") {
			ctx.throw(400, e);
		} else {
			ctx.throw(400, "Unknown Error [1]");
		}
	} finally {
		client.release();
	}

	/** Return whether or not it has been deleted */
	return {
		result: wasDeleted,
	};
};
