import pg from "pg";
pg.types.setTypeParser(20, BigInt);

export default new pg.Pool({
	user: process.env["BDAPI_AM_DB_USER"],
	host: process.env["BDAPI_AM_DB_HOST"],
	database: process.env["BDAPI_AM_DB_DB"],
	password: process.env["BDAPI_AM_DB_PASS"],
	port: parseInt(process.env["BDAPI_AM_DB_PORT"] || "0", 10) || 5432,
	ssl: !!process.env["BDAPI_AM_DB_SSL"],
});
