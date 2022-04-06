// Configuration for pushing to CLA Born Digital API Stage
module.exports = {
	gitUri: "git@github.com:TheCopyrightLicensingAgencyLtd/cla-education-platform.git",
	gitBranch: "dev",
	azureEmail: "azure-staging-account@tvf.co.uk",
	azureContainerRegistry: "occclacontainerregistry",
	controllerName: "BornDigitalApiController",
	controllerDockerTag: "bdapi_controller",
	isControllerTypescript: true,
};