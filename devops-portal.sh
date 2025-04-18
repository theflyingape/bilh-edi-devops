#!/bin/bash

[ -d /opt/devops ] && cd /opt/devops

NODE_VERSION=lts/iron NODE_ENV=production .nvm/nvm-exec npm run build

export NITRO_SSL_CERT="`cat /etc/pki/tls/certs/hcie-san.crt /etc/pki/tls/certs/hcie-san.int`"
export NITRO_SSL_KEY="`cat /etc/pki/tls/private/hcie-san.key`"
PORT=6500 .nvm/nvm-exec node .output/server/index.mjs
