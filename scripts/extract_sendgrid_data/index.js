/**This can be change*/
const EMAIL_SENT_TIME_FRAME_SINCE = "2021-10-05 00:00:00.00+00";
const REGISTRATION_TIME_FRAME_SINCE = "2021-09-23 00:00:00.00+00";

/**This can not be change */
const fs = require("fs");
const prompts = require("prompts");
const { Pool } = require("pg");
const date = require("../../apps/Controller/app/common/date");
const getMapRegistrationCountBySchoolId = require("./getMapRegistrationCountBySchoolId");
const generateExcelFile = require("./generateExcelFile");
const getMapEmailCountsBySchoolId = require("./getMapEmailCountsBySchoolId");

const EMAIL_ACTIVITY_LOG_FIRST_CATEGORY_SET_PASSWORD = "activate";
const EMAIL_ACTIVITY_LOG_EVENT_TYPE_DELIVERED = ["delivered"];
const EMAIL_ACTIVITY_LOG_EVENT_TYPE_OPEN = ["open", "opened"];
const EMAIL_ACTIVITY_LOG_EVENT_TYPE_CLICK = ["click", "clicked"];
const EMAIL_ACTIVITY_LOG_EVENT_TYPE_CLICK_URL = "/auth/activate/";

const getSchoolCampaignSegments = () => {
	let data;
	try {
		data = fs.readFileSync(__dirname + "/segments.json");
	} catch (e) {
		return Object.create(null);
	}
	data = JSON.parse(data.toString());
	const ret = Object.create(null);
	for (const row of data) {
		ret[row[0].trim()] = row[1].trim();
	}
	return ret;
};

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

	const segmentsByWondeIdentifier = getSchoolCampaignSegments();

	const wondeSchoolData = await pool.query(`
			SELECT
				id AS school_id,
				name AS school_name,
				wonde_identifier AS wonde_identifier
			FROM
				school
			WHERE
				wonde_identifier IS NOT NULL
				AND wonde_approved = TRUE
			ORDER BY
				school.id ASC
		`);

	const querier = pool.query.bind(pool);
	const mapEmailSentCountBySchoolId = await getMapEmailCountsBySchoolId(querier, {
		firstCategory: EMAIL_ACTIVITY_LOG_FIRST_CATEGORY_SET_PASSWORD,
		dateInserted: EMAIL_SENT_TIME_FRAME_SINCE,
	});

	const mapEmailDeliveredCountBySchoolId = await getMapEmailCountsBySchoolId(querier, {
		firstCategory: EMAIL_ACTIVITY_LOG_FIRST_CATEGORY_SET_PASSWORD,
		dateInserted: EMAIL_SENT_TIME_FRAME_SINCE,
		eventTypes: EMAIL_ACTIVITY_LOG_EVENT_TYPE_DELIVERED,
	});

	const mapEmailOpenedCountBySchoolId = await getMapEmailCountsBySchoolId(querier, {
		firstCategory: EMAIL_ACTIVITY_LOG_FIRST_CATEGORY_SET_PASSWORD,
		dateInserted: EMAIL_SENT_TIME_FRAME_SINCE,
		eventTypes: EMAIL_ACTIVITY_LOG_EVENT_TYPE_OPEN,
	});

	const mapEmailClickCountBySchoolId = await getMapEmailCountsBySchoolId(querier, {
		firstCategory: EMAIL_ACTIVITY_LOG_FIRST_CATEGORY_SET_PASSWORD,
		dateInserted: EMAIL_SENT_TIME_FRAME_SINCE,
		eventTypes: EMAIL_ACTIVITY_LOG_EVENT_TYPE_CLICK,
		url: EMAIL_ACTIVITY_LOG_EVENT_TYPE_CLICK_URL,
	});

	const mapRegistrationCountBySchoolId = await getMapRegistrationCountBySchoolId(querier, REGISTRATION_TIME_FRAME_SINCE);

	const emailSentSinceDateNiceFormat = date.rawToNiceDateForExcel(EMAIL_SENT_TIME_FRAME_SINCE, "D/MM/YYYY");
	const registrationSinceDateNiceFormat = date.rawToNiceDateForExcel(REGISTRATION_TIME_FRAME_SINCE, "DD/MM/YY");
	
	const extractSendgridData = wondeSchoolData.rows.map(school => {
		const ret = {};
		ret["School_Name"] = school.school_name;
		ret["Wonde ID"] = school.wonde_identifier;
		ret["Campaign segment"] = segmentsByWondeIdentifier[school.wonde_identifier] || "";
		ret[`Number of emails* sent since ${emailSentSinceDateNiceFormat}`] = mapEmailSentCountBySchoolId[school.school_id] || 0;
		ret["Number of emails* delivered"] = mapEmailDeliveredCountBySchoolId[school.school_id] || 0;
		ret["Number of emails* opened"] = mapEmailOpenedCountBySchoolId[school.school_id] || 0;
		ret["Number of emails* with link clicks (PW CTA)"] = mapEmailClickCountBySchoolId[school.school_id] || 0;
		ret[`Number of registrations (PW set) since ${registrationSinceDateNiceFormat}**`] =
			mapRegistrationCountBySchoolId[school.school_id] || 0;
		return ret;
	});

	generateExcelFile(extractSendgridData, "out.xlsx");
	console.log("Successfully generated excel file.");

	process.exit(0);
})();
