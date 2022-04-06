const arrayChunk = require("../../../../common/arrayChunk");
const pushTask = require("./pushTask");
const fetchSchools = require("./fetchSchools");
const updateSingleSchool = require("./updateSingleSchool");
const updateManySchools = require("./updateManySchools");

const settings = {
	tokenEndpoint: process.env.HWB_SCHOOLS_TOKEN_ENDPOINT,
	clientId: process.env.HWB_SCHOOLS_CLIENT_ID,
	clientSecret: process.env.HWB_SCHOOLS_CLIENT_SECRET,
	schoolApiEndpoint: process.env.HWB_SCHOOLS_DATA_ENDPOINT,
	base64Cert: process.env.HWB_SCHOOLS_BASE64_CERT,
};

module.exports = async function (taskDetails) {
	const pool = taskDetails.getAppDbPool();
	const querier = pool.query.bind(pool);
	try {
		if (!settings.tokenEndpoint) {
			return;
		}
		const schools = await fetchSchools(settings);
		const chunks = arrayChunk(schools, 200);
		for (const chunk of chunks) {
			try {
				await updateManySchools(querier, chunk);
			} catch (e) {
				if (e.message.indexOf("violates unique constraint") < 0) {
					throw e;
				}
				for (const school of chunk) {
					try {
						await updateSingleSchool(querier, school.dfeNumber, school.name);
					} catch (e) {
						console.log(e);
					}
				}
			}
		}
	} finally {
		await taskDetails.deleteSelf();
		await pushTask(taskDetails);
	}
};
