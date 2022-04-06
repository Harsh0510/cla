/**
 * Update extract notes and highlights for store the page value instead of page_index
 */
const prompts = require("prompts");
const { Pool } = require("pg");
const updateExtractNote = require("./updateExtractNote");
const updateExtractHighlight = require("./updateExtractHighlight");
const updateExtractPageJoin = require("./updateExtractPageJoin");

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

	const client = await pool.connect();
	await client.query("BEGIN");
	try {
		await updateExtractNote(client.query.bind(client));
		await updateExtractHighlight(client.query.bind(client));
		await updateExtractPageJoin(client.query.bind(client));
		await client.query("COMMIT");
		console.log("Success");
	} catch (e) {
		await client.query("ROLLBACK");
		console.log("Fail: ", e);
	} finally {
		client.release();
	}
	process.exit(0);
})();
