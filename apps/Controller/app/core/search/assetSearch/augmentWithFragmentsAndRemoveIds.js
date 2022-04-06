const escapeHTML = (unsafe) => {
	return unsafe.replace(/[&<>"']/g, (m) => {
		switch (m) {
			case "&":
				return "&amp;";
			case "<":
				return "&lt;";
			case ">":
				return "&lt;";
			case '"':
				return "&quot;";
			default:
				return "&#039;";
		}
	});
};

const MAX_WORDS_EITHER_SIDE = 4;

const getHeadlineHtml = (headline) => {
	const match = headline.match(/^(.*?)\[\[\[(.+?)\]\]\](.*?)$/);
	const beforeWords = match[1].trim().split(/\s+/g);
	const afterWords = match[3].trim().split(/\s+/g);
	let prefix;
	if (beforeWords.length <= MAX_WORDS_EITHER_SIDE) {
		prefix = match[1].trim();
	} else {
		prefix = "..." + beforeWords.slice(-MAX_WORDS_EITHER_SIDE).join(" ").trim();
	}
	if (match[1].match(/\s$/)) {
		prefix += " ";
	}
	let suffix;
	if (afterWords.length <= MAX_WORDS_EITHER_SIDE) {
		suffix = match[3].trim();
	} else {
		suffix = afterWords.slice(0, MAX_WORDS_EITHER_SIDE).join(" ").trim() + "...";
	}
	if (match[3].match(/^\s/)) {
		suffix = " " + suffix;
	}
	return '"' + escapeHTML(prefix) + "<strong>" + escapeHTML(match[2]) + "</strong>" + escapeHTML(suffix) + '"';
};

module.exports = async (querier, results, searchQuery) => {
	const headlineSql = `ts_headline('english', description, plainto_tsquery($1), 'MinWords=24, MaxWords=25, StartSel=[[[, StopSel=]]]')`;
	const frags = (
		await querier(
			`
				SELECT
					asset_id,
					title,
					start_page,
					(
						CASE WHEN
							position(']]]' IN ${headlineSql}) > 0
						THEN
							${headlineSql}
						ELSE
							NULL
						END
					) AS description
				FROM
					asset_fragment
				WHERE
					asset_id IN (${results.map((a) => a.id).join(", ")})
					AND keywords @@ plainto_tsquery($1)
				ORDER BY
					ts_rank_cd(keywords, plainto_tsquery($1)) DESC,
					start_page ASC,
					id DESC
			`,
			[searchQuery]
		)
	).rows;

	const assetsById = Object.create(null);
	for (const result of results) {
		assetsById[result.id] = result;
		delete result.id;
	}
	for (const frag of frags) {
		if (!assetsById[frag.asset_id].fragments) {
			assetsById[frag.asset_id].fragments = [];
		}
		const retFrag = {
			title: frag.title,
			start_page: frag.start_page,
		};
		if (frag.description) {
			retFrag.description = getHeadlineHtml(frag.description);
		}
		assetsById[frag.asset_id].fragments.push(retFrag);
	}
};
