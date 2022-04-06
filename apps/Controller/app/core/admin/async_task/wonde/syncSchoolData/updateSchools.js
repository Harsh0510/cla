const { getLatestSchools } = require("../../../../../common/wonde/wonde.js");
const consoleLog = require("../../../../../common/consoleLog");
const wait = require("../../../../../common/wait");
const buildInsertStatement = require("./buildInsertStatement");
const { getFilteredRecords, getExcludedWondeIdentifiers } = require("./getFilteredRecords");
const smartUpsert = require("../common/smartUpsert");

const defaultSettings = {
	disable_filtering: false,
	page_range: null,
	only_approved: false,
};

const makeSettings = (rawOpts) => {
	const settings = Object.assign({}, defaultSettings, rawOpts || {});
	if (!(settings.page_range && Array.isArray(settings.page_range) && settings.page_range.length === 2)) {
		settings.page_range = [1, 1000000];
	}
	settings.page_range[0] = Math.max(1, parseInt(settings.page_range[0], 10));
	settings.page_range[1] = Math.max(settings.page_range[0], parseInt(settings.page_range[1], 10));
	settings.disable_filtering = !!settings.disable_filtering;
	settings.only_approved = !!settings.only_approved;
	return settings;
};

module.exports = async (querier, lastExecuted, opts) => {
	const settings = makeSettings(opts);
	let excludedWondeIdentifiers;
	if (settings.disable_filtering) {
		excludedWondeIdentifiers = new Set();
	} else {
		excludedWondeIdentifiers = await getExcludedWondeIdentifiers(querier);
	}

	let currPage = settings.page_range[0];
	while (true) {
		consoleLog("syncWondeSchoolData", "getLatestSchools", currPage);
		/**
		 * Fetch one page at a time to preserve memory.
		 * Some API calls return 40k+ objects, which can easily exhaust memory on resource-constrained cloud servers.
		 */
		const rawSchoolData = await getLatestSchools(lastExecuted, currPage, settings.only_approved);
		const wondeSchoolsData = settings.disable_filtering ? rawSchoolData.data : getFilteredRecords(excludedWondeIdentifiers, rawSchoolData.data);
		if (wondeSchoolsData.length) {
			const values = [];
			const binds = [];

			for (const school of wondeSchoolsData) {
				school.identifier = school.urn ? `/${school.urn}/` : null; //Setting the identifier value based on gsg<null>/dfe<wondeSchool.urn>/seed<null>
				if (school.urn) {
					values.push(`($${binds.push(school.id.toString())}::text, $${binds.push(school.urn.toString())}::text)`);
				}
			}

			// ONLY update the wonde_identifier in this call.
			// Other field updates must take place AFTER this one!
			if (values.length) {
				/**
				 * DFEs may be duplicated in our local database due to bad identifier values, even though they're meant to be unique.
				 * So we can't just do UPDATE school SET wonde_identifier = IDENTIFIER WHERE dfe = XXX, because the wonde_identifier
				 * field is unique.
				 * We have to instead jump through some hoops to only update the FIRST row every set of of duplicated DFEs, hence
				 * the annoying 'school_first' subtable.
				 */
				await querier(
					`
					WITH school_first AS (
						SELECT
							id,
							row_number() OVER (PARTITION BY dfe ORDER BY id ASC) AS row_number
						FROM
							school
					)
					UPDATE
						school 
					SET 
						wonde_identifier = v.wonde_identifier,
						date_edited = NOW()
					FROM 
						(VALUES ${values.join(", ")})
							AS v(wonde_identifier, dfe),
						school_first AS sf
					WHERE 
						school.dfe = v.dfe
						AND school.wonde_identifier IS NULL
						AND school.dfe IS NOT NULL
						AND school.id = sf.id
						AND sf.row_number = 1
						AND v.wonde_identifier NOT IN (SELECT wonde_identifier FROM school WHERE wonde_identifier IS NOT NULL)
				`,
					binds
				);
			}

			await smartUpsert(querier, wondeSchoolsData, buildInsertStatement);
		}
		if (!rawSchoolData.has_more) {
			break;
		}
		if (currPage >= settings.page_range[1]) {
			break;
		}
		currPage++;
		await wait(100);
	}
};
