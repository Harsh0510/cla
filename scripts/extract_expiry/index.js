const prompts = require("prompts");
const { Pool } = require("pg");

const run = async (querier) => {
	// Create a map of id -> asset
	const assets = (await querier(`SELECT id, copyable_page_count FROM asset`)).rows;
	const assetMap = Object.create(null);
	const maxCopyablePagesForCourse = Object.create(null);
	for (const asset of assets) {
		assetMap[asset.id] = asset;
		maxCopyablePagesForCourse[asset.id] = Math.ceil(asset.copyable_page_count * 0.05);
	}
	
	// Get all the active extracts.
	// Must be in date created order (ASC)
	const extracts = (await querier(`
		SELECT
			id,
			asset_id,
			school_id,
			course_id,
			pages
		FROM
			extract
		WHERE
			date_expired > NOW()
		ORDER BY
			date_created ASC,
			id ASC
	`)).rows;

	const extractsToExpire = [];
	const copiedPageCountMap = Object.create(null);
	for (const extract of extracts) {
		if (!copiedPageCountMap[extract.asset_id]) {
			copiedPageCountMap[extract.asset_id] = Object.create(null);
		}
		if (!copiedPageCountMap[extract.asset_id][extract.course_id]) {
			copiedPageCountMap[extract.asset_id][extract.course_id] = Object.create(null);
		}
		const newPages = Object.create(null);
		for (const page in copiedPageCountMap[extract.asset_id][extract.course_id]) {
			newPages[page] = true;
		}
		for (const page of extract.pages) {
			newPages[page] = true;
		}
		const numPagesCopied = Object.keys(newPages).length;
		if (numPagesCopied > maxCopyablePagesForCourse[extract.asset_id]) {
			/**
			 * This extract would take the pages copied past the limit.
			 * Expire the copy!
			 * Do NOT update copiedPageCountMap[extract.asset_id][extract.course_id]
			 * because this copy will be expiring, so it shouldn't count towards
			 * the copy limit for extracts created after this one. 
			 */
			extractsToExpire.push(extract.id);
		} else {
			copiedPageCountMap[extract.asset_id][extract.course_id] = newPages;
		}
	}
	if (!extractsToExpire.length) {
		return;
	}

	// We're expiring at least one extract.

	console.log("Expiring (" + extractsToExpire.length + "): " + JSON.stringify(extractsToExpire));

	await querier(`
		UPDATE
			extract
		SET
			date_expired = NOW() - INTERVAL '1 hour'
		FROM
			(VALUES ${extractsToExpire.map(id => "(" + id + "::integer)").join(",")})
			AS v(id)
		WHERE
			extract.id = v.id
	`);

	// Re-fetch all the active extracts
	const remainingExtracts = (await querier(`
		SELECT
			id,
			asset_id,
			school_id,
			course_id,
			pages
		FROM
			extract
		WHERE
			date_expired > NOW()
	`)).rows;

	/**
	 * Map of asset id -> course id -> page -> true
	 */
	const newExtractPagesByCourse = Object.create(null);

	/**
	 * Map of asset id -> school id -> page -> true
	 */
	const newExtractPagesBySchool = Object.create(null);

	for (const extract of remainingExtracts) {
		for (const page of extract.pages) {
			if (!newExtractPagesByCourse[extract.asset_id]) {
				newExtractPagesByCourse[extract.asset_id] = Object.create(null);
			}
			if (!newExtractPagesByCourse[extract.asset_id][extract.course_id]) {
				newExtractPagesByCourse[extract.asset_id][extract.course_id] = Object.create(null);
			}
			newExtractPagesByCourse[extract.asset_id][extract.course_id][page] = true;

			if (!newExtractPagesBySchool[extract.asset_id]) {
				newExtractPagesBySchool[extract.asset_id] = Object.create(null);
			}
			if (!newExtractPagesBySchool[extract.asset_id][extract.school_id]) {
				newExtractPagesBySchool[extract.asset_id][extract.school_id] = Object.create(null);
			}
			newExtractPagesBySchool[extract.asset_id][extract.school_id][page] = true;
		}
	}

	{
		// Update the extract_page table to contain only active extract data (not expired ones)
		const values = [];
		for (const assetId in newExtractPagesByCourse) {
			for (const courseId in newExtractPagesByCourse[assetId]) {
				for (const page in newExtractPagesByCourse[assetId][courseId]) {
					values.push(`(${assetId}, ${courseId}, ${page})`);
				}
			}
		}
		await querier(`TRUNCATE extract_page`);
		if (values.length) {
			await querier(`
				INSERT INTO
					extract_page
					(asset_id, course_id, page_number)
				VALUES
					${values.join(", ")}
				ON CONFLICT DO NOTHING
			`);
		}
	}
	{
		// Update the extract_page_by_school table to contain only active extract data (not expired ones)
		const values = [];
		for (const assetId in newExtractPagesBySchool) {
			for (const schoolId in newExtractPagesBySchool[assetId]) {
				for (const page in newExtractPagesBySchool[assetId][schoolId]) {
					values.push(`(${assetId}, ${schoolId}, ${page})`);
				}
			}
		}
		await querier(`TRUNCATE extract_page_by_school`);
		if (values.length) {
			await querier(`
				INSERT INTO
					extract_page_by_school
					(asset_id, school_id, page_number)
				VALUES
					${values.join(", ")}
				ON CONFLICT DO NOTHING
			`);
		}
	}
	{
		// Refresh the school_extract_email_send_log table
		const values = [];
		for (const assetId in newExtractPagesBySchool) {
			for (const schoolId in newExtractPagesBySchool[assetId]) {
				const pagesCopied = Object.keys(newExtractPagesBySchool[assetId][schoolId]).length;
				const totalPages = assetMap[assetId].copyable_page_count;
				const ratio = pagesCopied / totalPages;
				const flooredFive = Math.floor((ratio * 100) / 5) * 5;
				if (flooredFive) {
					values.push(`(${assetId}, ${schoolId}, ${flooredFive})`);
				}
			}
		}
		await querier(`TRUNCATE school_extract_email_send_log`);
		if (values.length) {
			await querier(`
				INSERT INTO
					school_extract_email_send_log
					(asset_id, school_id, highest_percentage_ratio)
				VALUES
					${values.join(", ")}
			`);
		}
	}
};

(async () => {
	const responses = await prompts([
		{
			type: 'text',
			name: 'database',
			initial: 'stage_cla_app_db',
			message: 'Remote PostgreSQL database: DB name',
			initial: "livedb",
		},
		{
			type: 'text',
			name: 'username',
			initial: 'tvfadmin@stage-application',
			message: 'Remote PostgreSQL database: Username',
			initial: "cla_am_user",
		},
		{
			type: 'text',
			name: 'host',
			initial: 'stage-application.postgres.database.azure.com',
			message: 'Remote PostgreSQL database: Host',
			initial: "localhost",
		},
		{
			type: 'password',
			name: 'password',
			message: 'Remote PostgreSQL database: Password',
			initial: "cla_am_pass",
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
		await run(client.query.bind(client));
		await client.query("COMMIT");
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		client.release();
	}
	console.log("DONE");
	process.exit(0);
})();