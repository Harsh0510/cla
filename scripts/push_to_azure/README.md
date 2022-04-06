# Push to Azure

NodeJS script to push changes to Stage and to Production.

## Usage

Push to CLA EP Stage:

	$ node index.js -c cla-ep-stage

Push to CLA EP Live:

	$ node index.js -c cla-ep-live --gitBranch BRANCH_NAME

Push to Canada Stage:

	$ node index.js -c cla-ep-canada-stage

The '-c' option refers to a configuration file in the 'configs' directory. You can override any option from the configuration by passing an identically named command line argument. E.g. you can override 'gitBranch' by passing '--gitBranch my_custom_branch'.

Make sure all changes are pushed to the git repository/branch specified in the configuration file or command line first.

You may be prompted to enter credentials at various points throughout the process - e.g. to log in to the CLA Github, to log in to Azure, etc.

Azure credentials can be found in the TVF Passwords document.

Do not run more than one instance of the script at once. Wait until one script finishes (or terminate it) before trying to run it again.

## How it works

The script first clones a fresh copy of whatever git repo/branch was specified in the configuration file into a new temp directory.

It then builds the project (from the new temp directory) and pushes to Azure.

Only the fresh clone in the temp directory is ever touched.

The script also places a `.release` file at `/app/.release` directory on the `Controller` Docker instance on Azure which contains information on the most recent push. E.g.

```sh
865a4f19f76e:/app# cat /app/.release 
2019-09-10T11:06:57.957Z
a51556aaf98cc91be7d3567e31346e86cb887d8e
git@github.com:TheCopyrightLicensingAgencyLtd/cla-education-platform.git
release20190910
```

- The first line is the date/time of the last push.
- The next line is the Git commit hash of the codebase that was pushed.
- The next line is the URI to the git repository.
- The nest line is the name of the git branch.