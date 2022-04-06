const fs = require('fs');
const path = require("path");

const util = require('util');
const { Pool, types } = require('pg');

// Parse BIGINT as integers. This is technically NOT safe if it overflows the max. safe integer. We should fix this at some point!
types.setTypeParser(20, val => parseInt(val, 10));

const csv = require('csv');
const prompts = require('prompts');

const homedir = require('os').homedir();

const result = require("dotenv").config({
	path: path.join(homedir, ".cla-ep-database-passwords.env"),
});
if (result && result.parsed) {
	Object.assign(process.env, result.parsed);
}

const genPassword = require('./genPassword');
const getCreateUserSql = require('./getCreateUserSql');

const readFile = util.promisify(fs.readFile);

function readCsvFromString(str) {
	return new Promise((resolve, reject) => {
		csv.parse(str, (err, data) => {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
}

async function readCsv(filePath) {
	const contents = (await readFile(filePath)).toString();
	return await readCsvFromString(contents);
}

async function getUsersFromPrompt() {
	const ret = [];
	while (1) {
		const responses = await prompts([
			{
				type: 'text',
				name: 'email',
				message: 'Email',
			},
			{
				type: 'select',
				name: `title`,
				message: `Title`,
				initial: 0,
				choices: [
					{title: `Mr`, value: `Mr`},
					{title: `Mrs`, value: `Mrs`},
					{title: `Ms`, value: `Ms`},
					{title: `Miss`, value: `Miss`},
					{title: `Dr`, value: `Dr`},
					{title: `Sir`, value: `Sir`},
				],
			},
			{
				type: 'text',
				name: 'first_name',
				message: 'First Name',
			},
			{
				type: 'text',
				name: 'last_name',
				message: 'Last Name',
			},
			{
				type: 'number',
				name: 'school_id',
				message: 'School ID',
			},
			{
				type: 'text',
				name: 'role',
				initial: 'teacher',
				message: 'Role',
			},
			{
				type: 'confirm',
				name: 'another',
				message: 'Add another?',
			},
		]);
		if (!(
			responses.email
			&& responses.first_name
			&& responses.last_name
			&& Number.isInteger(responses.school_id)
		)) {
			console.error('Invalid details provided. Skipping user.');
		} else {
			ret.push([responses.email, responses.first_name, responses.last_name, responses.school_id, responses.role, responses.title]);
		}
		if (!responses.another) {
			break;
		}
	}
	return ret;
}

(async () => {
	let initialDB = 'stage_cla_app_db';
	let initialUser = 'tvfadmin@stage-application';
	let initialHost = 'stage-application.postgres.database.azure.com';
	let initialPw = '';
	let initialPort = 5432;
	let initialSsl = true;
	let connectionString = null;
	if (process.argv[2] === 'local') {
		connectionString = `postgres://cla_am_user:cla_am_pass@localhost:19000/cla_am_db`;
	} else if (process.argv[2] === 'live') {
		initialDB = 'live_cla_app_db';
		initialUser = 'tvfadmin@live-application';
		initialHost = 'live-application.postgres.database.azure.com';
		initialPort = 5432;
		initialSsl = true;
		connectionString = process.env.CLA_APP_DB_CONNECTION_STRING_LIVE || '';
	} else if (process.argv[2] === 'stage') {
		connectionString = process.env.CLA_APP_DB_CONNECTION_STRING_STAGE || '';
	}
	const responsePrompts = [];
	if (!connectionString) {
		responsePrompts.push(
			{
				type: 'text',
				name: 'database',
				initial: initialDB,
				message: 'Remote PostgreSQL database: DB name',
			},
			{
				type: 'text',
				name: 'username',
				initial: initialUser,
				message: 'Remote PostgreSQL database: Username',
			},
			{
				type: 'text',
				name: 'host',
				initial: initialHost,
				message: 'Remote PostgreSQL database: Host',
			},
			{
				type: 'password',
				name: 'password',
				initial: initialPw,
				message: 'Remote PostgreSQL database: Password',
			},
			{
				type: 'number',
				name: 'port',
				initial: initialPort,
				message: 'Remote PostgreSQL database: Port',
			},
			{
				type: 'confirm',
				name: 'ssl',
				initial: initialSsl,
				message: 'Remote PostgreSQL database: Use SSL?',
			},
		);
	}
	responsePrompts.push(
		{
			type: 'text',
			name: 'csv',
			message: 'Path to CSV file. Leave value blank to use interactive mode.',
		}
	);
	console.log("NOTE: Create a .cla-ep-database-passwords.env file in your home directory with the Stage and Production database connection strings (https://github.com/iceddev/pg-connection-string) so you don't have to enter database credentials all the time!");
	const responses = await prompts(responsePrompts);
	
	if (
		!connectionString
		&& !(
			responses.database
			&& responses.host
			&& responses.database
			&& responses.password
			&& Number.isInteger(responses.port)
			&& (responses.port > 0)
		)
	) {
		console.error('Database credentials not provided.');
		process.exit(1);
	}

	let users;
	if (responses.csv) {
		users = await readCsv(responses.csv);
	} else {
		users = await getUsersFromPrompt();
	}
	for (const user of users) {
		user.push(await genPassword());
	}

	let pool;
	if (connectionString) {
		pool = new Pool({
			connectionString: connectionString
		});
	} else {
		pool = new Pool({
			user: responses.username,
			host: responses.host,
			database: responses.database,
			password: responses.password,
			port: responses.port,
			ssl: responses.ssl,
		});
	}

	const sql = await getCreateUserSql(users);

	await pool.query(sql.query, sql.values);

	for (const user of users) {
		console.log('Email: ' + user[0] + '\nPassword: ' + user[6] + '\n');
	}

	await pool.end();
	
})();
