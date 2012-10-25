#!/bin/sh

cd $1

sudo sh /opt/openrov/linux/reset.sh && ino upload -m atmega328 -p /dev/ttyO1 1>&2 

exit 0
