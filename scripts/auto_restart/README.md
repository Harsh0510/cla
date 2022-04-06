# Azure Auto-Restart

This script basically regularly pings the Controller /public/ping endpoint.

If it doesn't get a successful response, it restarts the Controller.

## Details

The script is on the occclascheduledtasks VM on the Stage environment (IP: `51.140.61.37`). Only `akazim` has access to this machine using the regular SSH key.

The location of the script is at `/root/azure-auto-restart`.

It's basically a simple NodeJS script. PM2 is used to make sure the script is restarted if it dies for some reason.

There's a Dockerfile in this directory, but it's not set up as a Dockerbox on occscheduledtasks. Instead the VM just has NodeJS and PM2 installed.

The Dockerfile allows you to containerise the application if you needed though.

If you ever need to reinstall the application on a VM, follow the manual installation steps below.

The script pings the 'ping' endpoint roughly once a minute. If it doesn't get the expected response, it tries pinging repeatedly (using exponential backoff) for up to 5 minutes.

If there is still no response after 5 minutes, the Controller is restarted. It then waits 10 minutes until it resumes the pings (in case it takes a while for the application to start serving requests again following the restart).

The script requires a bunch of variables (DB credentials, API endpoints, Azure credentials, etc.). See the `env.example` file for more information.

## Submitting changes

- Copy the contents of /src/ to /root/azure-auto-restart/auto_restart/src on the target VM.
- Navigate to /root/azure-auto-restart/auto_restart/src
- Run `pm2 restart all` command.

## Manual installation

- Copy the contents of /src/ to /app on the target VM.
- Copy the run.sh file to the target VM.
- Execute all commands in the run.sh file EXCEPT the last `pm2 start` command.
- Copy the 'env.example' file to '/etc/.cla-ep-auto-restart.env.stage' on the remote and fill it out with the STAGE details.
- Copy the 'env.example' file to '/etc/.cla-ep-auto-restart.env.production' on the remote and fill it out with the PRODUCTION details.
- Make sure both configuration files are only readable by root (they contain sensitive information).
- Execute `pm2 start /app/pm2.config.js` (don't include the `--no-daemon` argument).

