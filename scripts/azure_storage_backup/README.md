# Azure Storage Backup

A script which backs up an entire SOURCE Azure Blob Storage account into a container on a completely separate DEST Azure Blob Storage account.

The destination container includes the current date and time and the name of the source storage account. So a destination container name might look like this: `backup-20200529-1722-occcladevstorage`

This script is intended to be executed as a cron job once a day.

All backup containers older than 30 days on the DEST account (which match the pattern above) are automatically deleted.

Note that this package is developed as a docker container, but is actually deployed to an Azure VM on the Stage CLA environment.

- Azure VM name: occclascheduledtasks
- Azure VM IP address: 51.140.61.37 (this may change - check Azure Stage environment for latest IP address)
- Access: 'akazim' and 'smallaev' have sudo access via SSH.

If deploying this package to a VM for the first time, then you'll need to do this:

1. Execute the commands in the `run.sh` file on the target VM. This will install nodejs and the npm modules.
2. Copy the contents of the `src` directory to the VM (but not the node_modules directory).
	- **MAKE SURE** you delete the `.env*` files inside `src` before copying!
3. Create a '.env' file on the VM at `/root/.env` which contains the connection string for the SOURCE blob storage account (what is backed up) and the DESTINATION storage account (where it's backed up to). Check `src/env.example` for an example of what the .env file should look like.
4. Insert any additional crontab lines into the cron file: You'll need a cronjob for each source storage account (with a different env file for each). Different .env files can be passed as command-line arguments:

```
node /app/index.js /path/to/an/.env
node /app/index.js /another/path/.env
node /app/index.js /some/third/path/.env
```

NOTE: Azure backups work at ~80MB/second. So backing up 1TB of content will take 3-4 hours!