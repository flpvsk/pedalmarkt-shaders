#!/bin/bash
set - e
source .env.local

rsync \
  --archive --compress --progress --delete --delete-excluded \
  --exclude .DS_Store --exclude .git --exclude pi \
  . $SERVER_USER@$SERVER:projects/pedalmarkt-shaders/
