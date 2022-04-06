const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const ensureNodeVersion = require("../lib/misc/ensureNodeVersion");

function spawnSync(cmd, args, cwd) {
	return childProcess.spawnSync(cmd, args, {
		cwd: cwd || __dirname,
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
	`.trim())
}

if (!process.argv[2]) {
	showHelp();
	process.exit(1);
}

if (process.argv[2] === '--help' || process.argv[2] === '-h') {
	showHelp();
	process.exit(0);
}

ensureNodeVersion.node(16);
ensureNodeVersion.npm(8);

// Install Controller NodeJS modules if necessary.
// @todo This should really be done from within the docker box because host and docker platform may differ.
{
	const dir = path.join(__dirname, 'Controller', 'app');
	if (!fs.existsSync(path.join(dir, 'node_modules'))) {
		spawnSync('npm', ['i'], dir);
	}
}

// Install PublicWebApp NodeJS modules if necessary.
// @todo This should really be done from within the docker box because host and docker platform may differ.
{
	const dir = path.join(__dirname, 'PublicWebApp', 'app');
	if (!fs.existsSync(path.join(dir, 'node_modules'))) {
		spawnSync('npm', ['i'], dir);
		spawnSync('node', [ path.join(dir, "build.js"), "cla-ep", 'dev-azure'], dir);
	}
}

// Bring up all docker boxes.
// NB: The first docker-compose file MUST be one directory above all the others!
// See: https://github.com/docker/compose/issues/3568#issuecomment-279509578
const args = [
	'-f', path.join(__dirname, 'docker-compose.yml'),
	'-f', path.join(__dirname, 'ApplicationModel', 'docker-compose.yml'),
	'-f', path.join(__dirname, 'Controller', 'docker-compose.yml'),
	'-f', path.join(__dirname, 'PublicWebApp', 'docker-compose.yml'),
	'-f', path.join(__dirname, 'SessionModel', 'docker-compose.yml'),
].concat(process.argv.slice(2));

spawnSync('docker-compose', args);