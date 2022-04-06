#!/usr/bin/env sh

apk update
apk add --no-cache file ghostscript imagemagick bash openssl nano wget curl ca-certificates
cd /app
npm i
npm install -g pm2
pm2 install pm2-logrotate
node /app/dist/cronScripts/initCron.js
crond
pm2 start /app/pm2.config.js --no-daemon
