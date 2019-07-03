#!/bin/bash

git checkout master && git pull origin master && git merge develop && git push origin master

ssh ubuntu@service.coincare.me 'bash -s' < deploy/remote_run.sh

git checkout develop
