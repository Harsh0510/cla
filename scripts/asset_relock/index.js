const fs = require('fs');
const path = require('path');

const csv = require('csv-parser');
const prompts = require('prompts');
const { Pool, types } = require('pg');

// Parse BIGINT as integers. This is technically NOT safe if it overflows the max. safe integer. We should fix this at some point!
types.setTypeParser(20, val => parseInt(val, 10));

function log(...args) {
	console.log(...args);
}

async function getSchoolIdFromRow(client, row) {
	if (row['School ID']) {
		return parseInt(row['School ID'], 10);
	}
	if (row['School']) {
		const result = await client.query(
			'SELECT id FROM school WHERE name = $1',
			[
				row['School'],
			]
		);
		if (result.rowCount !== 1) {
			return 0;
		}
		return parseInt(result.rows[0].id, 10);
	}
	return 0;
}

async function getAssetIdFromRow(client, row) {
	if (row['Asset ID']) {
		return parseInt(row['Asset ID'], 10);
	}
	if (row['Read ISBN']) {
		const result = await client.query(
			'SELECT id FROM asset WHERE isbn13 = $1 OR pdf_isbn13 = $1',
			[
				row['Read ISBN'],
			]
		);
		if (result.rowCount !== 1) {
			return 0;
		}
		return parseInt(result.rows[0].id, 10);
	}
	return 0;
}

async function processCsvRow(client, row) {
	const schoolId = await getSchoolIdFromRow(client, row);
	if (!schoolId) {
		throw new Error('Could not find school ID');
	}
	log(`Found school ID: ${schoolId}`);
	const assetId = await getAssetIdFromRow(client, row);
	if (!assetId) {
		throw new Error('Could not find asset ID');
	}
	log(`Found asset ID: ${assetId}`);

	{
		// Remove the unlocks.
		const result = await client.query(
			`
				DELETE FROM
					asset_school_info
				WHERE
					school_id = $1
					AND asset_id = $2
			`,
			[
				schoolId,
				assetId,
			],
		);
		log(`Deleted ${result.rowCount} asset_school_info rows`);
	}

	{
		// Cleanup - delete orphaned extracts.
		const deletedExtracts = await client.query(
			`
				DELETE FROM
					extract
				WHERE
					school_id = $1
					AND asset_id = $2
				RETURNING
					id
			`,
			[
				schoolId,
				assetId,
			],
		);
		log(`Deleted ${deletedExtracts.rowCount} extract rows`);
		if (deletedExtracts.rowCount > 0) {
			// Delete orphaned extract_shares.
			const deletedExtractsIdString = deletedExtracts.rows.map(r => r.id).join(', ');
			const result = await client.query(
				`
					DELETE FROM
						extract_share
					WHERE
						extract_id IN (${deletedExtractsIdString})
				`
			);
			log(`Deleted ${result.rowCount} extract_share rows having extract_id in ${deletedExtractsIdString}`);
		}
	}

	{
		// Delete orphaned extract_pages.
		const result = await client.query(
			`
				DELETE FROM
					extract_page
				WHERE
					asset_id = $1
					AND course_id IN (SELECT id FROM course WHERE school_id = $2)
			`,
			[
				assetId,
				schoolId,
			],
		);
		log(`Deleted ${result.rowCount} extract_page rows`);
	}

	{
		// Also delete orphaned extract_pages_by_school.
		const result = await client.query(
			`
				DELETE FROM
					extract_page_by_school
				WHERE
					school_id = $1
					AND asset_id = $2
			`,
			[
				schoolId,
				assetId,
			],
		);
		log(`Deleted ${result.rowCount} extract_page_by_school rows`);
	}
}

(async () => {
	const responses = await prompts([
		{
			type: 'text',
			name: 'csv_file_path',
			message: 'Absolute path to CSV file containing assets/schools to re-lock',
		},
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

	const pool = await new Pool({
		user: responses.username,
		host: responses.host,
		database: responses.database,
		password: responses.password,
		port: responses.port,
		ssl: responses.ssl,
	});

	const results = [];
	fs
	.createReadStream(responses.csv_file_path)
	.pipe(csv())
	.on('data', data => results.push(data))
	.on('end', async () => {
		const client = await pool.connect();
		try {
			await client.query('BEGIN');

			let i = 0;
			for (const row of results) {
				log(`Processing row index ${i}...`);
				try {
					await processCsvRow(client, row);
				} catch (e) {
					log(`Error with row index ${i}: ${e.message} (moving to next row...)`);
				}
				i++;
			}
			
			await client.query('COMMIT');
		} catch (e) {
			await client.query('ROLLBACK');
			throw e;
		} finally {
			client.release();
		}
		log('CSV parsed.');
	});
})();