#!/bin/bash

# abort on errors
set -e

# building artefact
[ -d dist ] && rm -r dist
npm run build

# deploying to server
rsync -e "ssh -p 8022" -av --delete dist/ app@agitsol.com:/srv/www/openmfe.lxg.de/
