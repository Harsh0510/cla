const moment = require("moment");

const getString = (str) => {
	if (str && typeof str === "string") {
		return str;
	}
	return null;
};

const getBool = (str) => !!str;

const getDate = (timestampMs) => moment(timestampMs).toISOString();

const fields = [
	{
		db_name: "date_created",
		getValue: getDate,
	},
	{
		db_name: "session_identifier",
		getValue: getString,
	},
	{
		db_name: "session_index",
		getValue(raw) {
			return parseInt(raw, 10) || 0;
		},
	},
	{
		db_name: "stage",
		getValue: getString,
	},
	{
		db_name: "sub_stage",
		getValue: getString,
	},
	{
		db_name: "asset_identifier",
		getValue: getString,
	},
	{
		db_name: "high_priority",
		getValue: getBool,
	},
	{
		db_name: "category",
		getValue: getString,
	},
	{
		db_name: "success",
		getValue(value) {
			if (typeof value === "boolean") {
				return value;
			}
			return true;
		},
	},
	{
		db_name: "content",
		getValue: getString,
	},
];

const dbFieldsStr = fields.map((field) => field.db_name).join(", ");

const makeBindsForOne = (item, binds, values) => {
	for (const field of fields) {
		const idx = binds.push(field.getValue(item[field.db_name]));
		values.push("$" + idx);
	}
};

const makeBinds = (items) => {
	const binds = [];
	const values = [];
	for (const item of items) {
		const subValues = [];
		makeBindsForOne(item, binds, subValues);
		values.push("(" + subValues.join(", ") + ")");
	}
	return { binds: binds, values: values.join(", ") };
};

module.exports = async function (params, ctx) {
	ctx.assert(Array.isArray(params.items), 400, "items not provided");
	ctx.assert(params.items.length > 0, 400, "items.length > 0");
	const { binds, values } = makeBinds(params.items);
	await ctx.appDbQuery(
		`
			INSERT INTO
				asset_processing_log
				(${dbFieldsStr})
			VALUES
				${values}
		`,
		binds
	);
	return {};
};
