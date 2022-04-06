const schoolUpdatableFields = require("../../../../../common/wonde/schoolUpdatableFields");

const onConflictUpdateSql = schoolUpdatableFields.map((f) => `${f} = EXCLUDED.${f}`).join(", ");

const fieldKeySet = [
	{
		wonde_field_name: "id",
		local_field_name: "wonde_identifier",
	},
	{
		wonde_field_name: "name",
		local_field_name: "name",
	},
	{
		wonde_field_name: "urn",
		local_field_name: "dfe",
	},
	{
		wonde_field_name: "la_code",
		local_field_name: "la_code",
	},
	{
		wonde_field_name: "mis",
		local_field_name: "mis",
	},
	{
		wonde_field_name: "address_line_1",
		local_field_name: "address1",
	},
	{
		wonde_field_name: "address_line_2",
		local_field_name: "address2",
	},
	{
		wonde_field_name: "address_town",
		local_field_name: "city",
	},
	{
		wonde_field_name: "address_postcode",
		local_field_name: "post_code",
	},
	{
		wonde_field_name: "school_level",
		local_field_name: "school_level",
	},
	{
		wonde_field_name: "identifier",
		local_field_name: "identifier",
	},
	{
		wonde_field_name: "territory",
		local_field_name: "territory",
	},
];

module.exports = function (rows) {
	const insert = `INSERT INTO school (${fieldKeySet.map((f) => f.local_field_name).join(",")}) VALUES `;
	const onConflict = ` ON CONFLICT (wonde_identifier) DO UPDATE SET ${onConflictUpdateSql}, date_edited = NOW()`;

	//comming from the rows data
	const fields = fieldKeySet.map((f) => f.wonde_field_name);
	const params = [];
	const chunks = [];
	for (const row of rows) {
		const valueClause = [];
		for (const field of fields) {
			const idx = params.push(row[field]);
			valueClause.push(`$${idx}`);
		}
		chunks.push(`(${valueClause.join(", ")})`);
	}
	return {
		query: insert + chunks.join(", ") + onConflict,
		binds: params,
	};
};
