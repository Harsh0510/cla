const XLSX = require('xlsx');
const prompts = require('prompts');
const { Pool, types } = require('pg');

const schoolLevels = require('../../apps/Controller/app/common/school-levels');
const schoolTypes = require('../../apps/Controller/app/common/school-types');

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

String.prototype.clean = function() {
	return this.trim().replace(/\s+/g, ' ');
};

function fixData(raw, index) {
	const ret = Object.create(null);

	function err(msg) {
		throw new Error(`Row ${index + 1}: ${msg}`);
	}

	// trim all the keys and values
	for (const key in raw) {
		if (raw.hasOwnProperty(key)) {
			const k = key.clean().toLowerCase();
			let v = raw[key];
			if (typeof v === "string") {
				v = v.clean();
			}
			if (v === "Not applicable") {
				v = null;
			}
			ret[k] = v || null;
		}
	}

	if (!ret.establishmentname) {
		err(`establishmentname not provided`);
	}
	if (!ret.level) {
		err(`level not provided`);
	}
	if (!ret.urn) {
		err(`urn not provided`);
	}
	if (!ret["hwb-dfe"]) {
		err(`hwb-dfe not provided`);
	}

	{
		const v = ret["establishmenttypegroup (name)"].toLowerCase().clean();
		if (v === "welsh schools") {
			ret["establishmenttypegroup (name)"] = "welsh-school";
		} else if (schoolTypesById[v]) {
			ret["establishmenttypegroup (name)"] = v;
		} else if (schoolTypesByName[v]) {
			ret["establishmenttypegroup (name)"] = schoolTypesByName[v];
		} else {
			err(`unknown school_type '${ret["establishmenttypegroup (name)"]}'`);
		}
	}

	{
		const lv = ret.level.toLowerCase().clean();
		if (schoolLevelsById[lv]) {
			ret.level = lv;
		} else if (schoolLevelsByName[lv]) {
			ret.level = schoolLevelsByName[lv];
		} else {
			err(`unknown level '${ret.level}'`);
		}
	}

	if (ret.number_of_students !== null) {
		ret.number_of_students = parseInt(ret.number_of_students, 10) || 0;
	}
	if (ret.establishmentnumber !== null) {
		ret.establishmentnumber = parseInt(ret.establishmentnumber, 10) || 0;
	}

	if (ret["address 3"] && !ret["address3"]) {
		ret["address3"] = ret["address 3"];
	}

	return ret;
}

async function insertCsvRows(client, rows) {
	for (const row of rows) {
		if (row.urn === "urn") {
			continue;
		}
		const fields = {
			dfe: row["urn"],
			la_code: row["la (code)"],
			establishment_number: row["establishmentnumber"],
			school_level: row["level"],
			number_of_students: row["numberofpupils"],
			address1: row["street"],
			address2: row["locality"],
			address3: row["address3"],
			city: row["town"],
			county: row["county (name)"],
			post_code: row["postcode"],
			local_authority: row["la (name)"],
			school_type: row["establishmenttypegroup (name)"],
			school_home_page: row["schoolwebsite"],
			name: row["establishmentname"],
			hwb_identifier: row["hwb-dfe"],
		};

		const existingId = await (async () => {
			let result;
			result = await client.query(
				`
					SELECT
						id
					FROM
						school
					WHERE
						dfe = $1
						AND hwb_identifier = $2
				`,
				[
					row.urn,
					row["hwb-dfe"],
				]
			);
			if (result.rowCount) {
				return result.rows[0].id;
			}
			result = await client.query(
				`
					SELECT
						id
					FROM
						school
					WHERE
						hwb_identifier = $1
				`,
				[
					row["hwb-dfe"],
				]
			);
			if (result.rowCount) {
				return result.rows[0].id;
			}
			result = await client.query(
				`
					SELECT
						id
					FROM
						school
					WHERE
						dfe = $1
				`,
				[
					row.urn,
				]
			);
			if (result.rowCount) {
				return result.rows[0].id;
			}
			return null;
		})();
		if (existingId) {
			const binds = [];
			const updates = [];
			for (const field in fields) {
				if (fields.hasOwnProperty(field)) {
					updates.push(field + " = $" + binds.push(fields[field]));
				}
			}
			await client.query(
				`
					UPDATE
						school
					SET
						${updates.join(", ")}
					WHERE
						id = ${existingId}
				`,
				binds
			);
		} else {
			const fieldNames = [];
			const values = [];
			const binds = [];
			for (const field in fields) {
				if (fields.hasOwnProperty(field)) {
					fieldNames.push(field);
					values.push("$" + binds.push(fields[field]));
				}
			}
			await client.query(
				`
					INSERT INTO
						school
						(${fieldNames.join(",")})
					VALUES
						(${values.join(",")})
					ON CONFLICT
					DO NOTHING
				`,
				binds
			);
		}
	}
}

(async () => {
	const responses = await prompts([
		{
			type: 'text',
			name: 'xlsx_file_path',
			message: 'Absolute path to XLSX file containing schools',
			initial: `/c3/old_home_2/home/tvf/cla/sprint46/EP-1928_attachments/DfE-schools-in-Hwb-but-not-EP.xlsx`,
		},
		{
			type: 'text',
			name: 'database',
			initial: 'stage_cla_app_db',
			message: 'Remote PostgreSQL database: DB name',
			initial: "cla_am_db",
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

	const wb = XLSX.readFile(responses.xlsx_file_path);
	const results = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
		.map(fixData)
		.filter(v => !!v)
	;
	await insertCsvRows(pool, results);
	console.log("DONE");
	process.exit(0);
})();