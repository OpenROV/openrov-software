#!/bin/sh

sudo /etc/init.d/openrov stop
sudo git pull origin master
sudo /opt/node/bin/npm install
sudo /etc/init.d/openrov start
