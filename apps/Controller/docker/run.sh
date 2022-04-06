#!/usr/bin/env sh

apk update
apk add --no-cache ghostscript imagemagick pngquant bash openssl nano wget curl ca-certificates font-noto
/usr/sbin/sshd
cd /app
npm i
npm install -g pm2@~5.2.0
pm2 install pm2-logrotate
pm2 start /app/pm2.config.js --no-daemon