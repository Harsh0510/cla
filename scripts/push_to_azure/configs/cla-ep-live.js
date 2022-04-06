// Configuration for pushing to CLA EP Live
// You are required to manually provide --gitBranch when pushing to Azure
module.exports = {
	gitUri: "git@github.com:TheCopyrightLicensingAgencyLtd/cla-education-platform.git",
	publicWebAppRunConfigName: "cla-ep",
	publicWebAppRunScript: "live-azure",
	azureEmail: "azure-production-account@tvf.co.uk",
	azureContainerRegistry: "occclaproductioncontainerregistry",
	controllerName: "Controller",
	controllerDockerTag: "controller",
	isControllerTypescript: false,
};