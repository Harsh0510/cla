const fs = require("fs");

const glob = require("glob");
const xlsx = require("xlsx");

const files = glob.sync("log-result__*.json");

const allResults = [];

for (const file of files) {
	if (file.match(/__all\.json$/)) {
		continue;
	}
	const data = JSON.parse(fs.readFileSync(file));
	allResults.push(data);
}

const wb = xlsx.utils.book_new();

{
	const failurePoints = [];
	for (const result of allResults) {
		const best = result.results.sort((a, b) => b.rps - a.rps)[0];
		failurePoints.push({
			"Endpoint": result.description,
			"Best RPS": Math.floor(best.rps),
		});
	}
	xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(failurePoints), "Summary");
}

{
	const correlations = [];
	for (const result of allResults) {
		correlations.push({
			"RPS": result.description,
			"Median Response Time": "",
			"99th percentile Response Time": "",
			"99.9th percentile Response Time": "",
			"Num Failures": "",
		});
		for (const pair of result.results) {
			correlations.push({
				"RPS": pair.rps,
				"Median Response Time": pair.median,
				"99th percentile Response Time": pair.percentiles["99"],
				"99.9th percentile Response Time": pair.percentiles["99.9"],
				"Num Failures": pair.num_failures,
			});
		}
		correlations.push({});
	}
	xlsx.utils.book_append_sheet(wb, xlsx.utils.json_to_sheet(correlations), "Correlations");
}

xlsx.writeFile(wb, "results.xlsx");
