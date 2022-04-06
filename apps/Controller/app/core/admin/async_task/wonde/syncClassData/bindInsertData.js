const tvfUtil = require("#tvf-util");
const classUpdatableFields = require("../../../../../common/wonde/classUpdatableFields");

const onConflictUpdateSql = classUpdatableFields.map((f) => `${f} = EXCLUDED.${f}`).join(", ");

module.exports = async (wondeClasses, localSchoolDbId) => {
	let values = [];
	let binds = [];
	const fields = ["title", "year_group", "school_id", "oid", "wonde_identifier", "wonde_mis_id", "creator_id"];
	for (const wondeClass of wondeClasses) {
		const oid = await tvfUtil.generateObjectIdentifier();
		values.push(`(
			$${binds.push(wondeClass.title || "Wonde Class " + wondeClass.id)},
			$${binds.push(wondeClass.year_group)},
			$${binds.push(localSchoolDbId)},
			$${binds.push(oid)},
			$${binds.push(wondeClass.id)},
			$${binds.push(wondeClass.mis_id)},
			0
		)`);
	}
	const query = `
		INSERT INTO
			course
			(
				${fields.join(", ")}
			)
		VALUES
			${values.join(", ")}
		ON CONFLICT
			(wonde_identifier)
			WHERE archive_date IS NULL
		DO UPDATE SET
			${onConflictUpdateSql},
			date_edited = NOW()
	`;
	return { query: query, binds: binds };
};
