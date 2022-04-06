const { Pool, types } = require('pg');
const prompts = require('prompts');

// Parse BIGINT as integers. This is technically NOT safe if it overflows the max. safe integer. We should fix this at some point!
types.setTypeParser(20, val => parseInt(val, 10));

module.exports = async function(prefix, defaults) {
	prefix = prefix || "";
	defaults = defaults || {};
	const responses = await prompts([
		{
			type: 'text',
			name: 'database',
			initial: defaults.database,
			message: `${prefix} Remote PostgreSQL database: DB name`,
		},
		{
			type: 'text',
			name: 'username',
			initial: defaults.username,
			message: `${prefix} Remote PostgreSQL database: Username`,
		},
		{
			type: 'text',
			name: 'host',
			initial: defaults.host || 'localhost',
			message: `${prefix} Remote PostgreSQL database: Host`,
		},
		{
			type: 'password',
			name: 'password',
			initial: defaults.password,
			message: `${prefix} Remote PostgreSQL database: Password`,
		},
		{
			type: 'number',
			name: 'port',
			initial: defaults.port,
			message: `${prefix} Remote PostgreSQL database: Port`,
		},
		{
			type: 'confirm',
			name: 'ssl',
			initial: defaults.ssl === undefined ? false : defaults.ssl,
			message: `${prefix} Remote PostgreSQL database: Use SSL?`,
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
	return await new Pool({
		user: responses.username,
		host: responses.host,
		database: responses.database,
		password: responses.password,
		port: responses.port,
		ssl: responses.ssl,
	});
};
