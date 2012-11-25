#!/bin/sh

sudo /etc/init.d/openrov stop
sudo git pull origin master
sudo /etc/init.d/openrov start
