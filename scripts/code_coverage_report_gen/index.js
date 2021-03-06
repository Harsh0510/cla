const path = require("path");
const { spawn, execSync } = require("child_process");
const fs = require("fs-extra");
const glob = require("glob");

const run = (cmd, args, opts) => new Promise((resolve, reject) => {
	const child = spawn(cmd, args, opts);
	child.stdout.pipe(process.stdout);
	child.stderr.pipe(process.stderr);
	child.on('exit', code => {
		if (code === 0) {
			resolve();
		} else {
			reject(code);
		}
	});
});

const APPS_BASE_DIR = path.join(__dirname, "..", "..", "apps");
const COVERAGE_BASE_DIR = path.join(__dirname, "..", "..", "coverage_reports");

const removeDateInFile = async (filePath) => {
	const contents = await fs.readFile(filePath);
	if (!contents) {
		return;
	}
	const contentsStr = contents.toString();
	if (!contentsStr) {
		return;
	}
	const replaced = contentsStr.replace(/(<div class=['"]footer [\s\S].+?>)[\s\S]+?(<\/div>)/, '$1Code coverage generated by istanbul at [DATE REMOVED]$2');
	await fs.writeFile(filePath, replaced);
};

const globAsync = (...args) => new Promise((resolve, reject) => {
	glob(...args, (err, matches) => {
		if (err) {
			reject(err);
		} else {
			resolve(matches);
		}
	});
});

const runTests = async (folder) => {
	const appDir = path.join(APPS_BASE_DIR, folder, "app");
	const coverageDir = path.join(COVERAGE_BASE_DIR, folder);
	console.log("Executing unit tests for " + folder + '. Please be patient, this may take a while!');
	await run("npm", ["run", "test"], {cwd: appDir});
	console.log("Unit tests for " + folder + " successfully executed.");
	console.log("Removing old coverage directory (if it exists)...");
	await fs.remove(coverageDir);
	console.log("Copying new coverage data to: " + coverageDir);
	await fs.move(path.join(appDir, "coverage", "lcov-report"), coverageDir);
	console.log("Removing timestamp from coverage files to increase build reproducibility...");
	const htmlFiles = await globAsync(path.join(coverageDir, "**/*.html"));
	for (const htmlFile of htmlFiles) {
		await removeDateInFile(htmlFile);
	}
	console.log("Generating metadata file...");
	const now = new Date().toUTCString();
	const commitHash = execSync(`git log --pretty=format:'%H' -n 1`, {cwd: APPS_BASE_DIR}).toString();
	await fs.outputFile(path.join(COVERAGE_BASE_DIR, folder + ".metadata.txt"), `Last run: ${now}\nCommit hash of last run: ${commitHash}\n`);
	console.log("SUCCESS for: " + folder);
};

(async () => {
	await runTests("PublicWebApp");
	await runTests("Controller");
})();