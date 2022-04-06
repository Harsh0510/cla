const prompts = require('prompts');
const { Pool, types } = require('pg');

// Parse BIGINT as integers. This is technically NOT safe if it overflows the max. safe integer. We should fix this at some point!
types.setTypeParser(20, val => parseInt(val, 10));

const maybeMergeSchools = async (querier, duplicateSchoolIds) => {
	const result = (await querier(`
		SELECT
			school.id AS school_id,
			school.wonde_identifier AS wonde_identifier,
			school.wonde_approved AS wonde_approved,
			school.enable_wonde_class_sync AS enable_wonde_class_sync,
			school.enable_wonde_user_sync AS enable_wonde_user_sync,
			school.date_last_wonde_class_synced AS date_last_wonde_class_synced,
			school.date_last_wonde_user_synced AS date_last_wonde_user_synced,
			COUNT(cla_user.id) AS user_count
		FROM
			school
		LEFT JOIN cla_user
			ON cla_user.school_id = school.id
		WHERE
			school.id IN (${duplicateSchoolIds.join(", ")})
		GROUP BY
			school.id
	`)).rows;
	let numWithCountOverZero = 0;
	const userCountBySchoolId = {};
	let wondeSchool = null;
	for (const row of result) {
		userCountBySchoolId[row.school_id] = row.user_count;
		if (row.user_count) {
			numWithCountOverZero++;
		}
		if (row.wonde_identifier) {
			wondeSchool = row;
		}
	}
	if (numWithCountOverZero > 1) {
		return ["more_than_one_school_has_users", null];
	}
	// either all schools have 0 users, or 1 school has users
	if (numWithCountOverZero === 0) {
		// no schools have users
		const schoolIdToKeep = wondeSchool ? wondeSchool.school_id : duplicateSchoolIds[0];
		const deleteIds = duplicateSchoolIds.filter(id => id !== schoolIdToKeep);

		// delete all of them except 1
		await querier(`
			DELETE FROM
				school
			WHERE
				id IN (${deleteIds.join(", ")})
		`);

		return ["no_school_has_users", schoolIdToKeep];
	}
	// exactly 1 school has users - we need to keep this one
	const schoolWithUsers = result.find(row => row.user_count > 0);
	const deleteIds = duplicateSchoolIds.filter(id => id !== schoolWithUsers.school_id);
	await querier(`
		DELETE FROM
			school
		WHERE
			id IN (${deleteIds.join(", ")})
	`);

	if (!wondeSchool || wondeSchool.school_id === schoolWithUsers.school_id) {
		return ["one_school_has_users_easy", schoolWithUsers.school_id];
	}
	/**
	 * Exactly 1 school has users, and it's NOT the Wonde school.
	 * We need to copy over the Wonde data from the Wonde school into `schoolWithUsers`
	 */
	 const binds = [];
	 await querier(
		`
			UPDATE
				school
			SET
				wonde_identifier = $${binds.push(wondeSchool.wonde_identifier)},
				wonde_approved = $${binds.push(wondeSchool.wonde_approved)},
				enable_wonde_class_sync = $${binds.push(wondeSchool.enable_wonde_class_sync)},
				enable_wonde_user_sync = $${binds.push(wondeSchool.enable_wonde_user_sync)},
				date_last_wonde_class_synced = $${binds.push(wondeSchool.date_last_wonde_class_synced)},
				date_last_wonde_user_synced = $${binds.push(wondeSchool.date_last_wonde_user_synced)}
			WHERE
				id = $${binds.push(schoolWithUsers.school_id)}
		`,
		binds
	);
	return ["one_school_has_users_hard", schoolWithUsers.school_id];
};

(async () => {
	const responses = await prompts([
		{
			type: 'text',
			name: 'database',
			initial: 'cla_am_db',
			message: 'Remote PostgreSQL database: DB name',
		},
		{
			type: 'text',
			name: 'username',
			initial: 'cla_am_user',
			message: 'Remote PostgreSQL database: Username',
		},
		{
			type: 'text',
			name: 'host',
			initial: 'localhost',
			message: 'Remote PostgreSQL database: Host',
		},
		{
			type: 'password',
			name: 'password',
			initial: 'cla_am_pass',
			message: 'Remote PostgreSQL database: Password',
		},
		{
			type: 'number',
			name: 'port',
			initial: 19000,
			message: 'Remote PostgreSQL database: Port',
		},
		{
			type: 'confirm',
			name: 'ssl',
			initial: false,
			message: 'Remote PostgreSQL database: Use SSL?',
		},
	]);

	if (!(
		responses.database
		&& responses.host
		&& responses.database
		&& responses.password
		&& Number.isInteger(responses.port)
		&& (responses.port > 0)
	)) {
		console.error('Database credentials not provided.');
		process.exit(1);
	}

	const pool = new Pool({
		user: responses.username,
		host: responses.host,
		database: responses.database,
		password: responses.password,
		port: responses.port,
		ssl: responses.ssl,
	});

	const client = await pool.connect();
	try {
		await client.query("START TRANSACTION ISOLATION LEVEL SERIALIZABLE");

		const querier = client.query.bind(client);

		const duplicateSchoolIds = (await querier(`
			SELECT
				ARRAY_AGG(id) AS ids
			FROM
				school
			GROUP BY
				CONCAT(name, '::::', post_code)
			HAVING
				COUNT(*) > 1
		`)).rows.map(rec => rec.ids.map(id => parseInt(id, 10)));
		// const duplicateSchoolIds = require("./manual-sets");

		const bySet = {};

		for (const duplicates of duplicateSchoolIds) {
			const [res, keptId] = await maybeMergeSchools(querier, duplicates);
			console.log(duplicates, res, keptId);
			bySet[res] = bySet[res] || 0;
			bySet[res]++;
		}

		console.log(bySet);

		await client.query("COMMIT");

		console.log("SUCCESS!");
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		client.release();
	}
})();