const childProcess = require("child_process");
const execSync = childProcess.execSync;

function err(msg) {
	console.error(">>> ERROR: " + msg);
}

const parseSemverString = (str) => {
	if (str[0].toLowerCase() === 'v') {
		str = str.slice(1);
	}
	const parts = str.split('.');
	if (parts.length !== 3) {
		return null;
	}
	const major = parseInt(parts[0], 10);
	if (isNaN(major)) {
		return null;
	}
	const minor = parseInt(parts[1], 10);
	if (isNaN(minor)) {
		return null;
	}
	const patch = parseInt(parts[2], 10);
	if (isNaN(patch)) {
		return null;
	}
	return { major, minor, patch };
};

const ensureCmdVersion = (name, cmd, version) => {
	let res;
	try {
		res = execSync(cmd).toString().trim();
	} catch (e) {
		err("cannot find '" + name + "'");
		process.exit(1);
	}
	const sv = parseSemverString(res);
	if (!sv) {
		err("could not parse '" + name + "' semver string");
		process.exit(1);
	}
	if (sv.major !== version) {
		err(name + " " + version + " required, but '" + res + "' installed");
		process.exit(1);
	}
};

const ensureNodeJsVersion = (version) => ensureCmdVersion("node", "node -v", version);
const ensureNpmVersion = (version) => ensureCmdVersion("npm", "npm -v", version);

module.exports = {
	node: ensureNodeJsVersion,
	npm: ensureNpmVersion,
};
