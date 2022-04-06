// Configuration for pushing to CLA EP Stage
module.exports = {
	gitUri: "https://gitlab.com/tvf_projects/occ/cla/education-platform/education-platform-website.git",
	gitBranch: "master",
	publicWebAppRunConfigName: "canada-ep",
	publicWebAppRunScript: "stage-azure",
	azureEmail: "azure-cla-canada-staging@tvf.co.uk",
	azureContainerRegistry: "occclaepcanadacontainerregistry",
	controllerName: "Controller",
	controllerDockerTag: "controller",
	isControllerTypescript: false,
};