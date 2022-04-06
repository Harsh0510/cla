const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const childProcess = require('child_process');
const execSync = childProcess.execSync;

const clc = require("cli-color");
const moment = require('moment');

const ensureNodeVersion = require("../../lib/misc/ensureNodeVersion");

const availableConfigs = fs
	.readdirSync(path.join(__dirname, "configs"))
	.filter(item => path.parse(item).name.indexOf("example") === -1)
	.map(item => path.parse(item).name)
	;

const extraOptions = (() => {
	const configKeys = [
		"gitUri",
		"gitBranch",
		"publicWebAppRunConfigName",
		"publicWebAppRunScript",
		"azureEmail",
		"azureContainerRegistry",
	];
	const ret = {};
	for (const ck of configKeys) {
		ret[ck] = {
			type: "string",
			description: "Override the " + ck + " setting from the configuration file",
		};
	}
	return ret;
})();

const argv = require('yargs')
	.usage(`Usage: $0 -c [string]`)
	.option("config", {
		alias: "c",
		type: "string",
		description: `Path to config file relative to 'configs' directory (one of: ${availableConfigs.join(", ")})`,
	})
	.options(extraOptions)
	.demandOption(['c'])
	.argv;

const buf = Buffer.alloc(16);
const rand = crypto.randomFillSync(buf).toString('hex');
const dir = path.join(os.tmpdir(), `cla-${argv.c}-${rand}`);

function exec(cmd, cwd) {
	return execSync(
		cmd,
		{
			cwd: cwd || dir,
			stdio: 'inherit',
		}
	);
}

function log(msg) {
	console.log(clc.cyanBright.bold(`>>> ${msg}`));
}

function azureLogin() {
	return new Promise((resolve, reject) => {
		childProcess.exec("az login", (err, output) => {
			if (err) {
				reject(err);
				return;
			}
			// Because `az login` stupidly SOMETIMES (not always...) returns text before OR after the JSON output
			output = output.trim();
			const idx1 = output.indexOf("[");
			const idx2 = output.lastIndexOf("]");
			let json;
			if ((idx1 >= 0) && (idx2 >= 0)) {
				json = JSON.parse(output.slice(idx1, idx2 + 1));
			} else {
				json = JSON.parse(output);
			}
			resolve(json[0].user.name);
		});
	});
}

function validateOptions(opts) {
	const required = [
		"gitUri",
		"gitBranch",
		"azureEmail",
		"azureContainerRegistry",
		"controllerName",
		"controllerDockerTag",
		"isControllerTypescript",
	];
	for (const req of required) {
		if (!opts[req]) {
			throw new Error(`'${req}' is required`);
		}
	}
}

async function run(configPath, extraArgs) {
	ensureNodeVersion.node(16);
	ensureNodeVersion.npm(8);

	const opts = require(path.resolve(path.join(__dirname, "configs"), configPath));
	Object.assign(opts, extraArgs || {});
	delete opts["_"];
	delete opts["$0"];
	delete opts["c"];
	delete opts["config"];
	try {
		validateOptions(opts);
	} catch (e) {
		console.error(e.message);
		process.exit(1);
	}

	const isPushingFrontEnd = opts.publicWebAppRunConfigName && opts.publicWebAppRunScript;

	log(`Building for ${configPath} (${opts.azureEmail} from branch ${opts.gitBranch}). You may be prompted to enter credentials at various points throughout the process...`);

	{
		log(`Creating tmp working directory at '${dir}'...`);
		fs.mkdirSync(dir);
	}

	{
		log(`Cloning branch ${opts.gitBranch} from ${opts.gitUri} - you may be prompted to enter your credentials...`);
		exec(`git clone --depth 1 -b ${opts.gitBranch} ${opts.gitUri} .`, dir);
	}

	{
		log(`Installing NPM modules for ${opts.controllerName}...`);
		exec(`npm i`, path.join(dir, 'apps', opts.controllerName, 'app'));
	}

	if (opts.isControllerTypescript) {
		log(`Building ${opts.controllerName}...`);
		exec(`npx tsc`, path.join(dir, 'apps', opts.controllerName, 'app'));
	}

	if (isPushingFrontEnd) {
		{
			log(`Installing NPM modules for PublicWebApp...`);
			exec(`npm i`, path.join(dir, 'apps', 'PublicWebApp', 'app'));
		}

		{
			log(`Building PublicWebApp...`);
			exec(`node ${path.join(dir, "apps", "PublicWebApp", "app", "build.js")} ${opts.publicWebAppRunConfigName} ${opts.publicWebAppRunScript}`, path.join(dir, 'apps', 'PublicWebApp', 'app'));
		}
	}

	{
		log(`Copy push meta-data to 'release' file...`);
		const dt = moment().toISOString();
		const commitHash = execSync(`git log --pretty=format:'%H' -n 1`, { cwd: dir }).toString();
		const str = dt + '\n' + commitHash + '\n' + opts.gitUri + '\n' + opts.gitBranch + '\n';
		fs.writeFileSync(path.join(dir, `apps/${opts.controllerName}/app/.release`), str);
		// TODO: add the .release file to PublicWebApp too, but only once we've ensured it's not publicly accessible!
	}

	{
		log(`Logging in to Azure. Will open a browser prompt. Make sure you log in as: ${opts.azureEmail}`);
		const user = await azureLogin();
		if (user !== opts.azureEmail) {
			console.error(`You have not logged in as: ${opts.azureEmail}`);
			process.exit(1);
		}
	}

	{
		log(`Logging in to Azure Container Registry (${opts.azureContainerRegistry})...`);
		exec(`az acr login -n ${opts.azureContainerRegistry}`);
	}

	if (isPushingFrontEnd) {
		log(`Building PublicWebApp Docker container...`);
		exec(`docker build -f Dockerfile_azure -t ${opts.azureContainerRegistry}.azurecr.io/public_web_app:latest .`, path.join(dir, 'apps', 'PublicWebApp'));
	}

	{
		log(`Building ${opts.controllerName} Docker container (tag: ${opts.controllerDockerTag})...`);
		exec(`docker build -f Dockerfile_azure -t ${opts.azureContainerRegistry}.azurecr.io/${opts.controllerDockerTag}:latest .`, path.join(dir, 'apps', opts.controllerName));
	}

	if (isPushingFrontEnd) {
		log(`Pushing PublicWebApp Docker container to Azure...`);
		exec(`docker push ${opts.azureContainerRegistry}.azurecr.io/public_web_app:latest`);
	}

	{
		log(`Pushing ${opts.controllerName} Docker container to Azure (tag: ${opts.controllerDockerTag})...`);
		exec(`docker push ${opts.azureContainerRegistry}.azurecr.io/${opts.controllerDockerTag}:latest`);
	}

	{
		log(`Deleting tmp directory at '${dir}'...`);
		exec(`rm -rf '${dir}'`);
	}

	log(`Success! It may take a few minutes until the changes are publicly visible on ${opts.azureEmail}.`);
}

(async () => {
	await run(argv.c, argv);
})();
