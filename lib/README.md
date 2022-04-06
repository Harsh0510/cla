# What is this?

A list of custom node modules containing functionality used by multiple Applications.

Since each Application is independent and could theoretically be deployed to different physical servers, it is necessary to copy these modules into every Application directory. This is what the `apps/init.sh` script does.

These modules will eventually be uploaded to Artifactory.

## Hacking

The process for updating the modules in this folder is as follows:

1. Change the files as necessary.
2. Increment the version string in the `package.json` file(s) inside all the affected modules by following semver best practices (https://semver.org/).
3. Update the following `package.json` files to reference the new version of the libraries:
	A. /apps/Controller/app/package.json
	B. /apps/PublicWebApp/server/package.json
4. Take a database dump of ApplicationModel.
5. Execute the following:
	$ cd /apps
	$ node reset.js
	$ node init.js
	$ node run.js up
6. Restore the database dump.