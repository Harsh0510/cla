// @todo Make this run `npm install` if node_modules does not exist.
const fs = require('fs');
const path = require('path');
const spawnSync = require('child_process').spawnSync;

// Install NPM modules if they not exist.

const applicationsWithTests = [
	'Controller',
	'PublicWebApp',
];

for (const awt of applicationsWithTests) {
	const dir = path.join(__dirname, awt, 'app');
	if (!fs.existsSync(path.join(dir, 'node_modules'))) {
		console.log('Node modules not found in directory (' + dir + '). Installing now...');
		spawnSync('npm', ['install'], {
			cwd: dir,
			stdio: 'inherit',
		});
	}
	const ret = spawnSync('npm', ['test'], {
		cwd: dir,
		stdio: 'inherit'
	});
	if (ret.status !== 0) {
		process.exit(ret.status);
	}
}
