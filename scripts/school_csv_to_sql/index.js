const fs = require('fs');

const csv = require('csv-parser');
const prompts = require('prompts');
const { Pool, types } = require('pg');

const schoolLevels = require('../../apps/Controller/app/common/school-levels');
const schoolTypes = require('../../apps/Controller/app/common/school-types');
const territories = require('../../apps/Controller/app/common/territories');

// Parse BIGINT as integers. This is technically NOT safe if it overflows the max. safe integer. We should fix this at some point!
types.setTypeParser(20, val => parseInt(val, 10));

const schoolLevelsByName = Object.create(null);
const schoolLevelsById = Object.create(null);
for (const sl of schoolLevels) {
	schoolLevelsByName[sl.name.toLowerCase()] = sl.id;
	schoolLevelsById[sl.id] = sl.name;
}
const schoolTypesByName = Object.create(null);
const schoolTypesById = Object.create(null);
for (const st of schoolTypes) {
	schoolTypesByName[st.name.toLowerCase()] = st.id;
	schoolTypesById[st.id] = st.name;
}

const territoriesByName = Object.create(null);
const territoriesById = Object.create(null);
for (const item of territories) {
	territoriesByName[item.name.toLowerCase()] = item.id;
	territoriesById[item.id] = item.name;
}

String.prototype.clean = function() {
	return this.trim().replace(/\s+/g, ' ');
};

function fixData(raw, index) {
	const ret = Object.create(null);

	function err(msg) {
		throw new Error(`Row ${index + 1} identifier ${ret.identifier}: ${msg}`);
	}

	// trim all the keys and values
	for (const key in raw) {
		if (raw.hasOwnProperty(key)) {
			const k = key.trim();
			const v = raw[key].trim();
			ret[k] = v || null;
		}
	}

	// ensure required fields are there
	if (!ret.identifier) {
		err(`identifier not provided`);
	}
	if (!ret.name) {
		err(`name not provided`);
	}
	if (!ret.address1) {
		err(`address1 not provided`);
	}
	if (!ret.city) {
		err(`city not provided`);
	}
	if (!ret.post_code) {
		err(`post_code not provided`);
	}

	{
		// validate territory
		if (!ret.territory) {
			err(`territory not provided`);
		}
		const v = ret.territory.toLowerCase().clean();
		if (territoriesById[v]) {
			// okay
			ret.territory = v;
		} else if (territoriesByName[v]) {
			ret.territory = territoriesByName[v];
		} else {
			err(`unknown territory '${ret.territory}'`);
		}
	}

	{
		if (!ret.school_type) {
			err(`school_type not provided`);
		}
		const v = ret.school_type.toLowerCase().clean();
		if (schoolTypesById[v]) {
			ret.school_type = v;
		} else if (schoolTypesByName[v]) {
			ret.school_type = schoolTypesByName[v];
		} else {
			err(`unknown school_type '${ret.school_type}'`);
		}
	}

	{
		if (!ret.school_level) {
			err(`school_level not provided`);
		}
		const lv = ret.school_level.toLowerCase().clean();
		if (schoolLevelsById[lv]) {
			ret.school_level = lv;
		} else if (schoolLevelsByName[lv]) {
			ret.school_level = schoolLevelsByName[lv];
		} else {
			err(`unknown school_level '${ret.school_level}'`);
		}
	}

	if (ret.number_of_students !== null) {
		ret.number_of_students = parseInt(ret.number_of_students, 10);
	}

	return ret;
}

async function insertCsvRow(client, row, insertType) {
	if (row.identifier === 'identifier') {
		return;
	}
	let schoolId;
	{
		const fields = [
			`identifier`,
			`local_authority`,
			`name`,
			`school_type`,
			`school_level`,
			`number_of_students`,
			`address1`,
			`address2`,
			`city`,
			`county`,
			`post_code`,
			`territory`,
			`school_home_page`,
		];
		const fieldsUpdate = fields.join(', ');
		const bindsSql = fields.map((_, idx) => `$${idx + 1}`).join(', ');
		let doUpdateSql = '';
		if (insertType === 'upsert') {
			doUpdateSql = `ON CONFLICT (identifier) DO UPDATE SET ` + fields.map(field => `${field} = EXCLUDED.${field}`).join(', ');
		} else if (insertType === 'ignore') {
			doUpdateSql = `ON CONFLICT DO NOTHING`;
		}

		const query = `
			INSERT INTO
				school
				(${fieldsUpdate})
			VALUES
				(${bindsSql})
			${doUpdateSql}
			RETURNING
				id
		`.clean();
		const binds = fields.map(field => row[field]);
		{
			let results = await client.query(query, binds);
			if (!results.rowCount) {
				results = await client.query(`SELECT id FROM school WHERE name = $1`, [row.name]);
			}
			if (!results.rowCount) {
				results = await client.query(`SELECT id FROM school WHERE identifier = $1`, [row.identifier]);
			}
			schoolId = parseInt(results.rows[0].id, 10);
		}
	}
	if (schoolId && row.domain) {
		const query = `
			INSERT INTO
				approved_domain
				(domain, school_id)
			VALUES
				($1, $2)
			ON CONFLICT DO NOTHING
		`.clean();
		const binds = [
			row.domain,
			schoolId,
		];
		await client.query(query, binds);
	}
}

(async () => {
	const responses = await prompts([
		{
			type: 'text',
			name: 'csv_file_path',
			message: 'Absolute path to CSV file containing schools',
		},
		{
			type: "select",
			name: `insert_type`,
			initial: 1,
			message: 'Insert type',
			choices: [
				{value: 'insert', title: 'Insert: Insert only - do not update'},
				{value: 'upsert', title: 'Upsert: Insert or update based on identifier'},
				{value: 'ignore', title: 'Ignore: Insert, but do not touch existing rows with a conflicting unique constraint'},
			],
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

	const results = [];
	let resultsLen = 0;
	fs
	.createReadStream(responses.csv_file_path)
	.pipe(csv())
	.on('data', data => {
		resultsLen++;
		results.push(fixData(data, resultsLen));
	})
	.on('end', async () => {
		const client = await pool.connect();
		try {
			await client.query('BEGIN');

			for (const row of results) {
				await insertCsvRow(client, row, responses.insert_type);
			}
			
			await client.query('COMMIT');
		} catch (e) {
			await client.query('ROLLBACK');
			throw e;
		} finally {
			client.release();
		}
	});
})();