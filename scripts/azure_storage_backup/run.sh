#!/usr/bin/env bash

DEBIAN_FRONTEND=noninteractive apt update
DEBIAN_FRONTEND=noninteractive apt install -y curl gnupg nano cron
curl -sL https://deb.nodesource.com/setup_14.x  | bash -
DEBIAN_FRONTEND=noninteractive apt install -y nodejs
cd /app
npm i

# Execute every day at 0119
# Replace '/app/.env.production' with the location of the env file containing Azure Storage connection strings (not SAS tokens - connection strings)
echo '19 1 * * * root node --max-old-space-size=2560 /app/index.js /app/.env.production >> /root/azure-backup.log 2>&1' >> /etc/crontab

tail -f /dev/null
