#!/bin/sh
#
npm outdated
git checkout HEAD -- package.json package-lock.json
rm -rf node_modules
npm install
npm outdated
