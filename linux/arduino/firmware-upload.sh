#!/bin/sh

cd $1

ino upload -m atmega328 -p /dev/ttyO1 1>&2 

exit 0
