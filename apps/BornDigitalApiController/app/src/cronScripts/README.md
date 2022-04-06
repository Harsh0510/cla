These scripts are meant to be executed _within_ the `BornDigitalApiController` docker container as part of a cronjob within the container.

They do not execute in response to a HTTP request, and they are not started or otherwise controlled by pm2.

The reason we put these scripts here instead of the top level `scripts` directory is because the top-level `scripts` directory is for scripts that execute on the host (i.e. outside the BornDigitalApiController docker container).

## Hacking

Add a new script by creating a directory adjacent to this file and adding a typescript file called `index.ts` in there. This will be the entry file for your script.

Then add a script like this to a file named `crontab-YYYYYY.sh` adjacent to your `index.ts` file:

```sh
#!/bin/sh

/usr/local/bin/node /app/dist/cronScripts/XXXXXXXXXXXX/index.js
```

Replace `XXXXXXXX` with the name of your script's directory.

`YYYYYYY` should be one of `15min`, `daily`, `hourly`, `weekly` or `monthly`.

You'll then need to execute the following inside the BornDigitalApiController docker container:

	$ node /app/dist/cronScripts/initCron.js

