const XLSX = require('xlsx');
const prompts = require('prompts');
const { Pool, types } = require('pg');

// Parse BIGINT as integers. This is technically NOT safe if it overflows the max. safe integer. We should fix this at some point!
types.setTypeParser(20, val => parseInt(val, 10));

function fixData(raw, index) {
	const fixed = Object.create(null);

	function err(msg) {
		throw new Error(`Row ${index + 1}: ${msg}`);
	}

	// trim all the keys and values
	for (const key in raw) {
		if (raw.hasOwnProperty(key)) {
			fixed[key.trim().toLowerCase()] = raw[key];
		}
	}

	// ensure required fields are there
	if (!fixed['prospect id']) {
		err(`prospect id not provided`);
	}
	if (!fixed['ep id']) {
		err(`ep id not provided`);
	}
	if (!Number.isInteger(fixed['prospect id'])) {
		err(`prospect id must be an integer`);
	}
	if (!Number.isInteger(fixed['ep id'])) {
		err(`ep id must be an integer`);
	}
	if (fixed['prospect id'] <= 0) {
		err(`prospect id must be greater than 0`);
	}
	if (fixed['ep id'] <= 0) {
		err(`ep id must be greater than 0`);
	}
	
	return {
		pardot_prospect_identifier: fixed['prospect id'],
		cla_user_id: fixed['ep id'],
	};
}

(async () => {
	const responses = await prompts([
		{
			type: 'text',
			name: 'xlsx_file_path',
			message: 'Absolute path to XLSX/CSV file containing Pardot data',
		},
		{
			type: 'text',
			name: 'database',
			initial: 'stage_cla_app_db',
			message: 'Remote PostgreSQL database: DB name',
		},
		{
			type: 'text',
			name: 'username',
			initial: 'tvfadmin@stage-application',
			message: 'Remote PostgreSQL database: Username',
		},
		{
			type: 'text',
			name: 'host',
			initial: 'stage-application.postgres.database.azure.com',
			message: 'Remote PostgreSQL database: Host',
		},
		{
			type: 'password',
			name: 'password',
			message: 'Remote PostgreSQL database: Password',
		},
		{
			type: 'number',
			name: 'port',
			initial: 5432,
			message: 'Remote PostgreSQL database: Port',
		},
		{
			type: 'confirm',
			name: 'ssl',
			initial: true,
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

	const wb = XLSX.readFile(responses.xlsx_file_path);
	const values = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
		.map(fixData)
		.filter(v => !!v)
		.map(v => `(${v.cla_user_id}, ${v.pardot_prospect_identifier})`)
		.join(', ')
	;
	const q = `
		UPDATE
			cla_user AS t
		SET
			pardot_prospect_identifier = c.pardot_prospect_identifier
		FROM (
			VALUES
			${values}
		) AS c(id, pardot_prospect_identifier)
		WHERE
			c.id = t.id
	`;
	await pool.query(q);
})();