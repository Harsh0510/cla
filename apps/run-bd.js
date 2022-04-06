// Bring up the Born Digital API Docker containers - not required for EP

const path = require('path');
const fs = require("fs");
const childProcess = require('child_process');

function spawnSync(cmd, args) {
	return childProcess.spawnSync(cmd, args, {
		cwd: __dirname,
		stdio: 'inherit',
	});
}

function showHelp() {
	const str = 'node ' + process.argv[1];
	console.log(`
Run a Docker Compose command on all Docker instances at the same time

This primarily exists because it's extremely inconvenient to have to type
'docker-compose -f file1 -f file2 -f file3 -f file4 up' every single time
you want to bring up all the Docker instances.
Until Docker allow ìncluding docker-compose files from other docker-compose
files, a wrapper script will be necessary.

Usage: ${str} [command]
Example: ${str} up

This is equivalent to:
docker-compose -f app1 -f app2 -f app3 -f app4 -f app5 up
	`.trim());
}

if (!process.argv[2]) {
	showHelp();
	process.exit(1);
}

if (process.argv[2] === '--help' || process.argv[2] === '-h') {
	showHelp();
	process.exit(0);
}

if (!fs.existsSync(path.join(__dirname, "BornDigitalApiController", "app", "dist")) || !fs.existsSync(path.join(__dirname, "BornDigitalApiController", "app", "node_modules"))) {
	const dir = path.join(__dirname, "BornDigitalApiController", "app");
	childProcess.execSync("npm i", { cwd: dir });
	childProcess.execSync("npx tsc", { cwd: dir });
}

// Bring up all docker boxes.
// NB: The first docker-compose file MUST be one directory above all the others!
// See: https://github.com/docker/compose/issues/3568#issuecomment-279509578
const args = [
	'-f', path.join(__dirname, 'docker-compose.yml'),
	'-f', path.join(__dirname, 'ApplicationModel', 'docker-compose.yml'),
	'-f', path.join(__dirname, 'BornDigitalApiController', 'docker-compose.yml'),
];

const overrideComposeFile = path.join(__dirname, "docker-compose.env.yml");

if (fs.existsSync(overrideComposeFile)) {
	args.push('-f', overrideComposeFile);
}

spawnSync('docker-compose', args.concat(process.argv.slice(2)));
