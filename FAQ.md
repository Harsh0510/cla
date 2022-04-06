# Frequently Asked Questions

This contains a list of assorted technical frequently asked questions. This FAQ is targeted exclusively at developers.

## How can I set up the project?

First, make sure you're on a recent Linux or OSX machine and have Docker and NodeJS 10+ installed.

You can then spin up all the docker instances for all Applications as follows:

	$ cd /path/to/this/directory/apps/
	$ node run.js up

It will take a few minutes to configure everything, especially if it's the first time.

Check that the containers are running by executing `docker ps` in a separate terminal - you should see a number of containers starting with `apps_`.

## A number of NodeJS scripts use the `child_process` package. Why?

The `child_process` module is a built-in NodeJS module that allows running a process from within NodeJS. For more details about the `child_process.spawnSync` function, which is often used by the application, [click here](https://nodejs.org/api/child_process.html#child_process_synchronous_process_creation).

As an example, consider the `apps/run.js` file:

- It needs to execute `node apps/init.js` if the project hasn't been initialized. It uses `spawnSync` to execute this command.
- It needs to execute `npm i` to install NodeJS packages - `spawnSync` is used here as well.
- It needs to finally execute `docker-compose [lots of arguments]` to actually bring up all the docker boxes. Again, `spawnSync` is used here.

## The `lib/tvf-app/package.json` file contains a `publishConfig` block. Why?

NPM allows you to set a custom repository. Instead of publishing the modules in `lib` to the public NPM registry (which would be bad), they're published to the CLA Artifactory repository.

## What is the purpose of `apps/init.js`?

It's a NodeJS script. It's typically not run explicitly, but is executed as part of `apps/run.js`.

This script is responsible for installing the common npm modules in `lib`.

You could execute it explicitly by running the following command:

	$ node /path/to/this/directory/apps/init.js

It's only necessary to execute it explicitly if you change the files in `lib`, which rarely happens.

Note that the `apps/init.js` file is well-commented, so it's worth browsing the comments for a more detailed understanding of what this script does.

## I've made a change to a file in the `lib` directory but my change isn't showing up. Help!

If you change a source file in `lib`, you need to execute `node apps/init.js` to copy the changes over.

## What is a 'tarball'?

It's basically a collection of one or more files and/or directories that have been combined into a single file. Think of it like a ZIP file, except without any compression.

It's often used on Linux or OSX machines.

## What does `apps/reset.js` do?

This script performs a *complete* reset of the application. It deletes all docker instances, `node_modules` folders, database contents, everything.

You probably don't want to run this (you probably want `apps/run.js`), but it's useful to run this command occasionally to make sure you're not relying on old NPM modules.

How to execute:

	$ node /path/to/this/directory/apps/reset.js

## What is Docker?

Docker is a popular container management and imaging platform that allows you to quickly work with containers. Docker is (very, very roughly) lightweight virtual machines.

## Why is Docker used?

For similar reasons that virtual machines are used. Some reasons:

- Docker ensures that all developers working on the platform have exactly the same environment.
- It ensures that the Stage/Production environments exactly match the local environments.
- It doesn't pollute your host machine with installations of software (e.g. pm2, nginx, postgres, nodejs) - it's all contained within the docker box.

## What is a Dockerfile?

The Dockerfile is a YAML document which contains all the configuration settings Docker needs to be able to assemble and build an image.

1 Dockerfile = 1 Docker image

Each component in `apps` has its own Dockerfile because each is a separate Docker image.

Consider the `apps/ApplicationModel/Dockerfile` for instance:

```
FROM postgres:10.5

COPY ./docker/run.sh /docker-entrypoint-initdb.d/db_init.sh
RUN chmod +x /docker-entrypoint-initdb.d/db_init.sh

CMD [ "postgres" ]
```

This basically says:

1. This image is based on the postgres 10.5 image from the Docker public image repository (https://hub.docker.com/_/postgres).
2. Copy the `./docker/run.sh` file on the host to `/docker-entrypoint-initdb.d/db_init.sh` in the container.
3. Execute the command `chmod +x /docker-entrypoint-initdb.d/db_init.sh` in the container (to make the script we just copied in (2) executable).
4. When the container loads, execute the `postgres` command. This loads the database.

## What does the docker-compose.yml file do?

Docker Compose is a tool for defining and running multi-container Docker applications. With Compose, you use a YAML file to configure your application's services. Then, with a single command, you create and start all the services from your configuration.

Since the application is composed of multiple containers, we use Docker Compose to manage them.

Docker Compose expects one or more `docker-compose.yml` configuration files.

In general, using Compose involves the following:
- Define your app's environment with a `Dockerfile` so it can be reproduced anywhere.
- Define the services that make up your app in `docker-compose.yml` so they can be run together in an isolated environment.
- Run `docker-compose up` in the same directory as the `docker-compose.yml` file.

Docker Compose then starts and runs your entire app.

For more details [click here](https://docs.docker.com/compose/).

Note that you should not be running the `docker-compose` command for this project unless you really know what you're doing - use the `apps/run.js` script instead.

## Docker Compose seems to require network details to be specified in the `docker-compose.yml` file, but it's not specified. Doesn't that break things?

No. If network details aren't explicitly provided, then Docker Compose will revert to sensible defaults. It should all 'just work' unless your host is configured weirdly.

## What is pm2?

Pm2 is a NodeJS process manager. It manages the following:

- Spinning up multiple instances of the process(es) you tell pm2 to manage - typically it spins up one process per CPU thread.
- Automatically restarting a process if it crashes.
- Routing all application console logging (stdout) and console errors (stderr) to files.
- With the pm2-logrotate module, it handles rotating logs so no individual log file gets too big.

Pm2 requires a configuration file - this is what `apps/Controller/app/pm2.config.js` is for.

For more information, see: http://pm2.keymetrics.io/

## What is `apps/PublicWebApp/server` for?

See `apps/PublicWebApp/server/README.md`.

## How can we identify requests from Facebook and Twitter?

See `apps/PublicWebApp/server/README.md`.

## How does one Docker instances connect with another?

Docker allows you to define custom hostnames for each Docker container. E.g. the hostname for the `Controller` component is `cla_controller` (defined in `apps/Controller/docker-compose.yml`). Docker containers can be accessed via these hostnames. We also pass the hostnames as environment variables into the other Docker containers that need them. For example, `Controller` needs to access the `ApplicationModel` and so we pass the following environment variable into the `Controller` container (also defined in `apps/Controller/docker-compose.yml`):

```
CLA_AM_DB_HOST: cla_application_model
```

## How does the database data in `ApplicationModel` and `SessionModel` persist even after deleting and restarting the Docker containers?

For `ApplicationModel`, we map the `apps/ApplicationModel/db_data` directory on the host to `/var/lib/postgresql/data` in the container. When the container goes down, the host directory is kept. When the container starts up again, the existing host directory is just mapped to the container again. This mapping is defined in `apps/ApplicationModel/docker-compose.yml`.

A similar thing is done for `SessionModel`.

[Read more here.](https://docs.docker.com/samples/library/postgres/)

## How are the postgres database user, password and database name defined?

By defining certain environment variables. The `postgres:10.5` image on which the ApplicationModel container is based allows you to define certain environment variables. We define those environment variables in `apps/ApplicationModel/docker-compose.yml`. Specifically, we define the following environment variables:

```
POSTGRES_PASSWORD: cla_am_pass
POSTGRES_DB: cla_am_db
POSTGRES_USER: cla_am_user
```

We do a similar thing for the SessionModel.

[Click here](https://docs.docker.com/samples/library/postgres/) for more information.

## What's the relevance of the '19000:5432' line in `apps/ApplicationModel/docker-compose.yml`?

This is standard Docker Compose syntax for mapping a port on the host to a port in the container. Port 5432 is the default port on which postgres listens. We map port 19000 on the host to port 5432 in the container so that we can access the ApplicationModel database on port 19000 on the host.

## In the `apps/ApplicationModel/docker-compose.yml` file, does the `build : ApplicationModel` line indicate that the whole application should be built?

The `apps/ApplicationModel/docker-compose.yml` file only contains the build instructions for the ApplicationModel component. It's only relevant for building the ApplicationModel component, not the whole application.
 
## What is `apps/PublicWebApp/app/__mocks__` for?

This folder contains mocks that are used for all unit tests. This folder is not used for the main user-facing application - only for unit tests.

Some application javascript files in `apps/PublicWebApp/app/src` import CSS and SVG files. Since these are irrelevant for unit testing, we just define simple mocks for them.

The mocks are registered in the `jest -> moduleNameMapper` property in `apps/PublicWebApp/app/package.json`. Jest looks at this property when running unit tests.

## What does the `jest -> setupTestFrameworkScriptFile` property in `apps/PublicWebApp/app/package.json` do?

The file referenced by this property is automatically included by the Enzyme test runner. The file should not be included manually.

## How is user session data expired?

Session data is stored in the SessionModel database. Each user's session data is associated with a unique session token in that database, which identifies that particular session. This session token is passed to the browser via the `X-SESSID` HTTP response header for every request. The browser stores this token in `localStorage`, and includes it in a `X-SESSID` HTTP request header on every API request to the `Controller`. This allows the `Controller` to 'know' who the user is.

When a user logs out on the front-end, the session token is simply cleared from `localStorage`. No explicit 'logout' requests are made to the `Controller` - logging out is purely a client-side activity. Since the browser doesn't have the session token anymore, it can't send it to the server via the `X-SESSID` header, and so the server forgets who the user is. In effect, the user is logged out. When they log in again later, a fresh session (with a new token) is created and saved into the SessionModel database.

Of course it's necessary to purge expired session data from the database. The `apps/Controller/app/core/auth/common/insertSessionData.js` file contains code that deletes old session data after every few hundred inserts. This keeps the session table from getting too big.

## Why is nginx used in `apps/PublicWebApp`?

Nginx is a web server, like Apache or IIS.

At least historically, nginx processed high amounts of traffic and SSL handshakes more efficiently than NodeJS. This is why we're using it - for performance.

## What does `apt update` do in run.sh files?

The command `apt update` is used in a number of places, such as `apps/PublicWebApp/docker/run/run.sh`. This is a standard command on many Linux distributions which fetches information about the latest versions of packages and their dependencies from all your configured package repositories. It doesn't actually upgrade anything though - `apt upgrade` is the command which actually downloads and upgrades any packages that have newer versions than the ones installed on your machine.

Some Linux distributions have different commands that do a similar thing. The `apps/Controller/docker/run.sh` file is a script that runs on an Docker container that runs Alpine Linux. On Alpine Linux, the equivalent commands to update and upgrade packages are `apk update` and `apk upgrade`.

## What does `DEBIAN_FRONTEND=noninteractive` do in the run.sh files?

Docker container setup needs to be completely headless - there should be no prompts or confirmation requests. Some Linux commands check whether the `DEBIAN_FRONTEND` environment variable has the value `noninteractive` and, if so, do not display any prompts. We therefore set this environment variable before running any command which might conceivably display a prompt - like `apt install`.

We also pass the `-y` switch to `apt install` for the same reason. The `-y` switch means 'say yes to everything', so any prompts that might slip through are automatically answered.

For more information [click here](https://linuxhint.com/debian_frontend_noninteractive/).

## What is GnuPG?

Some `run.sh` files install the `gnupg` package (e.g. `apps/PublicWebApp/docker/run/run.sh`). GnuPG (or GPG) is an implementation of an encryption technique for securing communications between two endpoints. It's very roughly like SSL.

This package is installed because other packages depend on it.

## What is curl?

Some `run.sh` files install the `curl` package (e.g. `apps/PublicWebApp/docker/run/run.sh`). We use curl to download files from the internet as part of the Docker container setup process. Curl can be used for a lot, lot more than simply downloading files from the internet, but this is all we use it for.

## What is the top-level `lib` folder?

This folder contains bespoke NodeJS modules that are used by multiple components.

## What is `lib/tvf-app`?

It's a lightweight wrapper around the KoaJS library that makes it easy to do common things like:

- Perform queries on the ApplicationModel and SessionModel databases.
- Fetch session data.
- Get the remote client IP.
- Registering API endpoints (routes).

It also automatically handles:

- Setting up CORS correctly.
- Initializing database connections.
- Guarding against CSRF attacks.
- Setting the correct HTTP Content-Type repsonse headers.
- Error logging.

## What is `lib/tvf-ensure`

This module is a collection of functions for validating request parameters and throwing relevant, consistent messages if validation fails.

## What is `lib/tvf-util`?

A collection of miscellaneous utility functions used throughout the application.

## What is the purpose of `apps/Controller/ssh_setup.sh` and `apps/Controller/sshd_config`?

These files are needed to configure an SSH server in the Docker container. This allows you to SSH directly into the running Stage and Production Docker containers.

If you're only developing locally, these files aren't used and can be safely ignored.

See `https://docs.microsoft.com/en-us/azure/app-service/containers/configure-custom-container#enable-ssh` for more detail.

## What is the purpose of `apps/Controller/Dockerfile_azure`?

This is a separate Dockerfile that's used to build the container for Azure.

Azure doesn't currently have very good Docker Compose support, so we basically have to copy some of the commands from the `docker-compose.yml` file into the `Dockerfile_azure` file.

Hopefully someday Azure's Docker Compose support will improve and we can remove `Dockerfile_azure`.

If you're only developing locally, this file isn't used and can be safely ignored.

## What is the use of the `apps/Controller/app/core/admin/azure` directory?

This is executed on Azure. See `apps/Controller/app/core/admin/azure/README.md` for more detail.

If you're only developing locally, this entire directory isn't used and can be safely ignored.

## What is `apps/Controller/app/core/admin/lib` used for?

This directory contains common functionality used in multiple files in the `apps/Controller/app/core/admin` folder.

## What is `apps/Controller/app/core/admin/parseUploads` used for?

The primary purpose of this folder is to provide functions for parsing incoming ONIX XML files (asset meta-data files) and storing the extracted metadata to the database.

## How can I configure and test emails?

Create the following file if it doesn't already exist: `apps/Controller/app/core/auth/_private_info.js`

You should add the following to this file:

```js
process.env.SMTP_EMAIL_USERNAME = 'username for your smtp server of choice';
process.env.SMTP_EMAIL_PASSWORD = 'password for your smtp server of choice';
process.env.SMTP_EMAIL_HOST = 'host for your smtp server of choice';

// this is optional, but recommended
process.env.SEND_ALL_EMAILS_TO = 'enter an email address to send all emails to (useful for testing)';

// this is optional, but recommended
process.env.SEND_ALL_EMAILS_FROM = 'enter the email address all emails will be sent from';
```

You'll now need to restart the `Controller` component so the file is noticed. Do this as follows:

1. Open a new terminal.
2. Run `docker exec -it apps_cla_controller_1 /bin/bash` to log in to the Controller docker box.
3. Run `pm2 restart all`.

Don't worry about accidentally committing the `_private_info.js` file to git - it's gitignored.

## What is the purpose of `apps/Controller/app/pm2.config.js`?

Pm2 is a NodeJS process manager. `pm2.config.js` files are pm2 configuration files.

## Some routes in `apps/Controller/app` accept a `sendEmail` parameter (e.g. apps/Controller/app/core/auth/login.js) but some don't. Why? How?

Some routes need additional arguments to work correctly - e.g. the login route needs the ability to send an email if a potentially malcious login attempt is detected.

Additional parameters are passed in the `routes.js` file - e.g. `apps/Controller/app/core/auth/routes.js`.

## How can the modules in `/lib` be modified?

See: `lib/README.md`

## How can new Education Platform users be created?

There are several ways a new user can be created:

### Via a School Admin or CLA Admin

Users can be created on the website itself by school admins or CLA admins:

1. School Admin or CLA Admin logs in to the website.
2. Admin navigates to the administration area for managing users.
3. New user is created.
4. An automated email is sent to the newly created user with an activation token that expires after three days.
5. New user follows the link the automated email to verify that their email address exists and to set their password.
6. New user can now log in to the platform.

The Admin never sees or sets the new user's password.

### Via self-registration

A user can register for the website themselves:

1. New user fills out and submits the registration form on the Education Platform website. The user has to select their school as part of the registration form from a dropdown - this is required.
2. New user receives an automated email address asking them to click a link to verify their email address. The link contains a token with an expiry date.
3. New user follows the link to verify that their email address exists. They do *not* enter a password at this stage and they don't have access to the website yet! They've merely confirmed that their email address exists.
4. Once the user's email address is validated (and only from this point), the new user appears in the 'Registration Queue' section for School Admins which belong to that school (as selected by the user when they registered).
5. The School Admin can choose to Approve the user, Block the user, or resend the verification email. Let's say the School Admin approves the user.
6. The new user is sent another automated email with a link that prompts them to set their initial password. A token with an expiry date is also involved at this stage.
7. The new user follows the link and sets their initial password.
8. The new user can now log in to the website.

The Admin never sees or sets the new user's password.

### Via the `scripts/generate_users` script

See the README at: `scripts/generate_users/README.md`

## What is the `apps/Controller/app/core/auth/GeoLite2-Country.mmdb` file? How do I open it?

This file is used by the `maxmind` NodeJS module for IP geolocation.

This is used to determine whether a user has logged in from another country recently and, if so, send a warning email to the user.
See `apps/Controller/app/core/auth/common/sendLoginSecurityEmail.js` for the warning email.

MMDB files can be freely downloaded from `https://dev.maxmind.com/geoip/geoip2/geolite2/` and are regularly updated.

MMDB files are binary files - they can't be opened by a normal text editor.

## Where are the error logs?

Error logs for the `Controller` component are placed in the following directory: `apps/Controller/.logs`

## What is the purpose of the `apps/Controller/app/core/admin` folder?

Routes and functionality for endpoints which require CLA Admin privileges is placed here.

## What is the purpose of the `apps/Controller/app/core/public` folder?

Routes and functionality for endpoints which do not require CLA Admin privileges is placed here.

## What is the purpose of the `apps/Controller/app/core/search` directory?

Routes and functionality related to asset searching is placed here.

## How are assets/books uploaded to the platform?

See: `documentation/asset_upload_process/README.md`

## What is the `core-js` javascript package used for?

The `core-js` module provides polyfills for older browsers (mostly IE11). It's necessary to ensure the front-end works in IE11 and other older browsers that we still support.

## What is the purpose of the `apps/SessionModel` directory?

See: `apps/SessionModel/README.md`

## What is the purpose of the `/SSIS` directory?

This directory is not used by the OCC (development team) and should not be touched. It was used to obtain an initial list of schools to upload to the platform just before it was initially launched.

## The `PublicWebApp/app/package.json` file contains `babel-core`, `babel-loader` packages. Why?

Babel converts ('transpiles') modern javascript into ES5 javascript that's understood by the supported browsers (namely IE11).

For example, the ReactJS library requires very modern javascript features (classes, etc.) for cleaner, simpler and more readable code. Some older browsers unfortunately do not understand these features. Babel 'converts' the modern features into older features that are understood by these browsers.

See [https://babeljs.io/](https://babeljs.io/) for more details.

## The `PublicWebApp/app/package.json` file contains `webpack`, `webpack-cli`, `html-webpack-plugin` packages. Why?

Webpack is a module bundler. Its main purpose is to bundle JavaScript files for usage in a browser, but it is also capable of transforming, bundling, or packaging for css, embedding small images, and so on.

See [https://webpack.js.org/](https://webpack.js.org/) for more details.

## What is the purpose of the `scripts/push_to_azure` folder?

This is a NodeJS script to push changes to Stage and to Production.
See the README file at `documentation/push_to_azure/README.md` for documentation.

## How are assets uploaded to Azure?

Please see the README file located at `documentation/asset_upload_process/README.md` for detailed documentation.

### Why use `React.lazy` in `PublicWebApp/app/src/App.js`?

The React.lazy function lets you render a dynamic import as a regular component.

React.lazy takes a function that must call a dynamic import(). This must return a Promise which resolves to a module with a default export containing a React component.

We use this because it means we don't have to load *all* the React components in the entire application in one go - the components are split into multiple javascript files, and only the javascript files containing the components relevant to rendering the page will be imported.

See [https://reactjs.org/docs/code-splitting.html#reactlazy](https://reactjs.org/docs/code-splitting.html#reactlazy) for more details.

### Why use `React.PureComponent` in `PublicWebApp/app/src/App.js`?

`React.PureComponent` is similar to React.Component. The difference between them is that React.Component doesn’t implement shouldComponentUpdate(), but `React.PureComponent` implements it with a shallow prop and state comparison.

If your React component’s render() function renders the same result given the same props and state, you can use React.PureComponent for a performance boost in some cases.

See [https://reactjs.org/docs/react-api.html#reactpurecomponent](https://reactjs.org/docs/react-api.html#reactpurecomponent) for more details.

### What is the `asyncRunner` parameter in the `routes.js` files?

See `apps/Controller/app/common/asyncTaskRunner/README.md`.
