/**
 * common function for build the Multi Insert statement for multile rows into the table
 * @param {string} tableName
 * @param {string[]} fields
 * @param {any[]} data
 * @param {string | null} onConflict String with conflict statement
 */
function getInsertQueryObject2(tableName, fields, data, onConflict = "") {
	if (data.length) {
		let insertStatement = `INSERT INTO ${tableName} (${fields.join(", ")}) VALUES `;
		let conflictStatement = onConflict || "";
		const params = [];
		const chunks = [];

		for (const row of data) {
			const valueClause = [];
			for (const field of fields) {
				if (Object.prototype.hasOwnProperty.call(row, field)) {
					const idx = params.push(row[field]);
					valueClause.push(`$${idx}`);
				} else {
					valueClause.push("DEFAULT");
				}
			}
			chunks.push(`(${valueClause.join(", ")})`);
		}

		return {
			text: insertStatement + chunks.join(", ") + " " + conflictStatement,
			values: params,
		};
	}
	return null;
}

module.exports = getInsertQueryObject2;
