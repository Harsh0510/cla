#!/usr/bin/env bash

DEBIAN_FRONTEND=noninteractive apt update
DEBIAN_FRONTEND=noninteractive apt install -y curl gnupg nano cron python3 python3-pip
curl -sL https://deb.nodesource.com/setup_14.x  | bash -
DEBIAN_FRONTEND=noninteractive apt install -y nodejs
DEBIAN_FRONTEND=noninteractive pip3 install azure-cli
cd /app
npm i
npm install -g pm2@~4.5.0
pm2 install pm2-logrotate
pm2 start /app/pm2.config.js --no-daemon
