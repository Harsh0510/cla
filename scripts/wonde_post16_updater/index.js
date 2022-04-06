if (!process.env.WONDE_API_TOKEN) {
	console.error("Must set WONDE_API_TOKEN env argument (get this value from PRODUCTION Azure EP)");
	process.exit(1);
}

const fs = require("fs");

const wonde = require("../../apps/Controller/app/common/wonde/wonde");

(async () => {
	console.log("Please be patient, this may take around 15 minutes to execute!");
	const result = await wonde.getDistinctPhasesOfEducation();
	const sqlClauses = [];
	if (Array.isArray(result["16 PLUS"])) {
		for (const record of result["16 PLUS"]) {
			sqlClauses.push(`UPDATE school SET school_level = 'post-16' WHERE wonde_identifier = '${record[0]}';`);
		}
	}
	fs.writeFileSync(__dirname + "/updates.sql", sqlClauses.join("\n") + "\n");
	console.log("DONE! See the adjacent 'updates.sql' file for the SQL queries.");
})();

