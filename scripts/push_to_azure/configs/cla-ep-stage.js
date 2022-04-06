// Configuration for pushing to CLA EP Stage
module.exports = {
	gitUri: "git@github.com:TheCopyrightLicensingAgencyLtd/cla-education-platform.git",
	gitBranch: "dev",
	publicWebAppRunConfigName: "cla-ep",
	publicWebAppRunScript: "stage-azure",
	azureEmail: "azure-staging-account@tvf.co.uk",
	azureContainerRegistry: "occclacontainerregistry",
	controllerName: "Controller",
	controllerDockerTag: "controller",
	isControllerTypescript: false,
};