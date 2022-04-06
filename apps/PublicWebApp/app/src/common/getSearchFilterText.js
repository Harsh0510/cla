/**
 * get singular 'a' or 'an' from the field name
 * @param {number} limit
 * @param {number} offset
 * @param {string} query
 * @param {any[]} selectedFilter Array const [{filter:'Class', values:["test1", "test1"]...
 * 'values' should be an array, however you can alternatively have 'value' field instead of 'values'.
 * You can optionally specify a 'format' function on each filter - should return a string
 * @param {number} unfiltered_count integer
 */
export default function (limit, offset, query, selectedFilter, totalRecords) {
	let showingPages = "Showing ";
	const queryText = query ? `for "${query}"` : "";
	const whereClauses = [];
	if (Array.isArray(selectedFilter)) {
		selectedFilter.forEach((item) => {
			if (Array.isArray(item.values)) {
				if (item.values.length > 0) {
					whereClauses.push(`${item.filter} = "${item.values.join('" OR "')}"`);
				}
			} else if (item.value) {
				let value = item.value;
				if (typeof item.format === "function") {
					value = item.format(value);
				}
				whereClauses.push(`${item.filter} = "${value}"`);
			}
		});
	}
	const whereText = whereClauses.length ? "where " + whereClauses.join(" AND ") : "";

	if (totalRecords == 1) {
		showingPages = showingPages + totalRecords + " result";
	} else if (totalRecords > 1) {
		const showingPagesFrom = offset + 1;
		const showingPagesTo = offset + limit > totalRecords ? totalRecords : offset + limit;
		showingPages = `${showingPages}${showingPagesFrom}-${showingPagesTo} of ${totalRecords} results`;
	} else {
		//showingPages = showingPages + "0 results";
		return "";
	}
	return `${showingPages}${queryText ? " " + queryText : ""}${whereText ? " " + whereText : ""}`;
}
