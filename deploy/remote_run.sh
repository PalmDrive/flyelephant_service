#!/bin/bash

HOME="/home/ubuntu"
DIR="$HOME/dev/coincare_service"

cd $DIR

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

nvm use 10.12.0

git stash
git pull origin master

# yarn install
yarn stop && yarn start
