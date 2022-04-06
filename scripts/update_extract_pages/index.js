const prompts = require("prompts");
const { Pool } = require("pg");

(async () => {
	const responses = await prompts([
		{
			type: "text",
			name: "database",
			initial: "stage_cla_app_db",
			message: "Remote PostgreSQL database: DB name",
		},
		{
			type: "text",
			name: "username",
			initial: "tvfadmin@stage-application",
			message: "Remote PostgreSQL database: Username",
		},
		{
			type: "text",
			name: "host",
			initial: "stage-application.postgres.database.azure.com",
			message: "Remote PostgreSQL database: Host",
		},
		{
			type: "password",
			name: "password",
			message: "Remote PostgreSQL database: Password",
		},
		{
			type: "number",
			name: "port",
			initial: 5432,
			message: "Remote PostgreSQL database: Port",
		},
		{
			type: "confirm",
			name: "ssl",
			initial: true,
			message: "Remote PostgreSQL database: Use SSL?",
		},
	]);

	if (!(responses.database && responses.host && responses.username && responses.password && Number.isInteger(responses.port) && responses.port > 0)) {
		console.error("Database credentials not provided.");
		process.exit(1);
	}

	// DB connection
	const pool = new Pool({
		user: responses.username,
		host: responses.host,
		database: responses.database,
		password: responses.password,
		port: responses.port,
		ssl: responses.ssl,
	});

	// Fetch assets which have copy excluded pages
	const result = await pool.query(`
		SELECT
			id AS asset_id,
			copy_excluded_pages AS copy_excluded_pages
		FROM
			asset
		WHERE
			copy_excluded_pages IS NOT NULL
			AND copy_excluded_pages != '{}'::INT[]
	`);
	if (!result.rowCount) {
		console.error("No assets found with copy excluded pages");
		return;
	}
	const updatedExtracts = [];
	const deletedExtracts = [];
	for (const asset of result.rows) {
		const assetId = asset.asset_id;
		const copyExcludedPages = asset.copy_excluded_pages;
		const stringCopyExcludedPages = "(" + asset.copy_excluded_pages.join() + ")";
		const copyExcludedPagesMap = Object.create(null);
		for (const page of copyExcludedPages) {
			copyExcludedPagesMap[page] = true;
		}

		//Delete from extract_page which include the copy excluded pages based on asset_id
		await pool.query(`
			DELETE FROM
				extract_page
			WHERE
				page_number IN ${stringCopyExcludedPages}
				AND asset_id = ${assetId}
		`);

		//Delete from extract_page_by_school which include the copy excluded pages based on asset_id
		await pool.query(`
			DELETE FROM
				extract_page_by_school
			WHERE
				page_number IN ${stringCopyExcludedPages}
				AND asset_id = ${assetId}
		`);

		//Fetch extract pages from extract based on asset_id
		const extracts = await pool.query(`
			SELECT
				pages AS extract_pages,
				id As extract_id
			FROM
				extract
			WHERE
				asset_id = ${assetId}
		`);

		if (!extracts.rowCount) {
			continue;
		}

		for (const extract of extracts.rows) {
			const extractId = extract.extract_id;
			const extractPages = extract.extract_pages;
			const updatePages = []; // update pages without copy excluded pages
			for (const page of extractPages) {
				if (!copyExcludedPagesMap[page]) {
					updatePages.push(page);
				}
			}
			if (updatePages.length === extractPages.length) {
				continue;
			}

			if (updatePages.length === 0) {
				deletedExtracts.push({
					assetId: assetId,
					extractId: extractId,
				});

				//Delete from extract
				await pool.query(`
					DELETE FROM
						extract
					WHERE
						id = ${extractId}
				`);

				//Delete from extract_access
				await pool.query(`
					DELETE FROM
						extract_access
					WHERE
						extract_id = ${extractId}
				`);

				//Delete from extract_highlight
				await pool.query(`
					DELETE FROM
						extract_highlight
					WHERE
						extract_id = ${extractId}
				`);

				//Delete from extract_note
				await pool.query(`
					DELETE FROM
						extract_note
					WHERE
						extract_id = ${extractId}
				`);

				//Delete from extract_page_join
				await pool.query(`
					DELETE FROM
						extract_page_join
					WHERE
						extract_id = ${extractId}
				`);

				//Delete from extract_share
				await pool.query(`
					DELETE FROM
						extract_share
					WHERE
						extract_id = ${extractId}
				`);

				//Delete from extract_user_info
				await pool.query(`
					DELETE FROM
						extract_user_info
					WHERE
						extract_id = ${extractId}
				`);
			} else {
				updatedExtracts.push({
					assetId: assetId,
					extractId: extractId,
				});
				//Update extract pages and page_count fileds on extract table based on asset_id
				await pool.query(`
					UPDATE
						extract
					SET
						pages = '${JSON.stringify(updatePages)}',
						page_count = ${updatePages.length}
					WHERE
						id = ${extractId}
				`);
			}
		}
	}

	if (updatedExtracts.length || deletedExtracts.length) {
		for (const extract of updatedExtracts) {
			console.log("UPDATED Extract ID: " + extract.extractId + " and Asset ID: " + extract.assetId);
		}
		for (const extract of deletedExtracts) {
			console.log("DELETED Extract ID: " + extract.extractId + " and Asset ID: " + extract.assetId);
		}
	} else {
		console.log("No extracts updated.");
	}
	process.exit(0);
})();
