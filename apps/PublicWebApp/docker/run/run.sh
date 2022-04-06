#!/usr/bin/env bash

DEBIAN_FRONTEND=noninteractive apt update
DEBIAN_FRONTEND=noninteractive apt install -y curl gnupg nano openssh-server
mkdir /run/sshd
/usr/sbin/sshd
mkdir -p /var/log/nginx
curl -sL https://deb.nodesource.com/setup_16.x  | bash -
DEBIAN_FRONTEND=noninteractive apt install -y nodejs
cd /server
npm i
npm install pm2 -g
pm2 start /server/pm2.config.js
node /etc/nginx/conf.d/default.conf.template.js > /etc/nginx/conf.d/default.conf
openresty -g 'daemon off;'
