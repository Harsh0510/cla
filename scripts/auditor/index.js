const path = require("path");
const exec = require("child_process").execSync;

const base = path.join(__dirname, "..", "..");

const getNpmDirectories = () => {
	const res = exec(`find . -regextype posix-extended -regex '.*/(node_modules|ApplicationModel|SessionModel)/.*' -prune -false -o -name 'package.json'`, {
		cwd: base,
	});
	return res.toString().trim().split("\n").map(p => path.join(base, path.dirname(p)));
};

const npmDirs = getNpmDirectories();
for (const dir of npmDirs) {
	let output;
	let data;
	while (true) {
		try {
			output = exec("npm audit --json", {
				cwd: dir,
			});
		} catch (e) {
			output = e.stdout.toString();
		}
		data = JSON.parse(output.toString().trim());
		if (data.error) {
			if (data.error.code === "EAUDITNOLOCK") {
				exec("npm i", {
					cwd: dir,
				});
				continue;
			}
			throw new Error(output);
		}
		break;
	}
	const relativeDir = path.relative(base, dir);
	console.log("Checking: " + relativeDir);
	const vulnerabilities = data.metadata.vulnerabilities;
	if (vulnerabilities.high || vulnerabilities.critical) {
		process.stdout.write('\n');
		console.log(relativeDir, vulnerabilities);
	}
}
process.stdout.write("\n");