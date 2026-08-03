#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

rsync -avz --delete --exclude='.env' ./dist/ joe@vps:/var/www/html/liftapi/dist/
rsync -avz ./package.json joe@vps:/var/www/html/liftapi/
