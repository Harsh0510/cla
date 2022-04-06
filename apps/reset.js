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
	console.log(`
Clear out all docker containers and folders so a completely clean environment can be built.

Usage: node ${process.argv[1]}
`.trim());
}

if (process.argv[2] === '--help' || process.argv[2] === '-h') {
	showHelp();
	process.exit(0);
}

function delRecursive(type, name) {
	spawnSync(
		'find',
		[
			__dirname,
			'-type', type,
			'-name', name,
			'-exec', 'rm', '-rf', '{}', ';',
		]
	);
}

function deleteDockerContainers() {
	const ret = childProcess.execSync('docker ps -a');
	const lines = ret.toString().split(/[\r\n]+/g);
	const dockerIds = [];
	for (const line of lines) {
		const values = line.split(/\s+/g);
		if (values[0] === 'CONTAINER') {
			continue;
		}
		if (values.length < 2) {
			continue;
		}
		if (line.indexOf('_cla_') >= 0) {
			dockerIds.push(values[0]);
		}
	}
	if (dockerIds.length > 0) {
		const cmd = 'docker container rm --force ' + dockerIds.join(' ');
		childProcess.execSync(cmd);
	}
}

function deleteDockerImages() {
	const ret = childProcess.execSync('docker image ls -a');
	const lines = ret.toString().split(/[\r\n]+/g);
	const dockerIds = [];
	for (const line of lines) {
		const values = line.split(/\s+/g);
		if (values[0] === 'REPOSITORY') {
			continue;
		}
		if (values.length < 3) {
			continue;
		}
		if (line.indexOf('_cla_') >= 0) {
			dockerIds.push(values[2]);
		}
	}
	if (dockerIds.length > 0) {
		const cmd = 'docker image rm --force ' + dockerIds.join(' ');
		childProcess.execSync(cmd);
	}
}

function deletePublicAssets() {
	childProcess.execSync(`rm -rf ${path.join(__dirname, 'PublicWebApp', 'public')}`);
}

ensureNodeVersion.node(16);
ensureNodeVersion.npm(8);

deleteDockerContainers();
deleteDockerImages();
deletePublicAssets();
childProcess.execSync(`rm -rf ${path.join(__dirname, `BornDigitalApiController`, `app`, `dist`)}`);

delRecursive('d', 'node_modules');
delRecursive('f', 'error.log');
delRecursive('d', '.logs');
delRecursive('d', 'db_data');
