#!/bin/bash

[ -d /opt/devops ] && cd /opt/devops

# let's try renaming CommonJs module to steer bundle to use ESM (.mjs) only
find node_modules -name xterm.js -exec mv -v {} {}-old  \;

# flush any transition public/files for download
rm -fv public/files/*

NODE_VERSION=lts/iron NODE_ENV=production .nvm/nvm-exec npm run build

umask 002
export NITRO_SSL_CERT="`cat /etc/pki/tls/certs/hcie-san.crt /etc/pki/tls/certs/hcie-san.int`"
export NITRO_SSL_KEY="`cat /etc/pki/tls/private/hcie-san.key`"
PORT=6500 .nvm/nvm-exec node .output/server/index.mjs
