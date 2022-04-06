module.exports = {
	// URI of the git repository that will be cloned and pushed
	gitUri: "git@github.com:TheCopyrightLicensingAgencyLtd/cla-education-platform.git",

	// Branch name of the git repository that will be cloned and pushed
	gitBranch: "dev",

	// The config name used as part of the PublicWebApp build before pushing
	// Final command will be: node build.js ${publicWebAppRunConfigName} ${publicWebAppRunScript}
	publicWebAppRunConfigName: "cla-ep",

	// The command that will be executed as part of the PublicWebApp build before pushing
	// Final command will be: node build.js ${publicWebAppRunConfigName} ${publicWebAppRunScript}
	publicWebAppRunScript: "stage-azure",

	// Azure email address of the account containing the Docker container registry
	azureEmail: "azure-staging-account@tvf.co.uk",

	// Name of the Azure container registry within the azureEmail account
	azureContainerRegistry: "occclacontainerregistry",

	// Name of the 'Controller' directory - typically just "Controller"
	controllerName: "Controller",

	// Name of the Docker tag for the Controller app on Azure
	controllerDockerTag: "controller",

	// Is the Controller written in typescript?
	// If TRUE, then `npx tsc` will be executed in apps/<controllerName>/app
	isControllerTypescript: false,
};