#!/bin/sh

cd $1

ino build -m atmega328  1>&2 

echo $1
exit 0
