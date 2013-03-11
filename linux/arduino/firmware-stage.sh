#!/bin/sh

BUILDDIR=`mktemp -d`
ZIP=zip
PWD=`pwd`
ARDUINOFILE=$1

echo staging: build dir is $BUILDDIR 1>&2
cd $BUILDDIR
/usr/local/bin/ino init  1>&2 
rm src/*.ino

cd $BUILDDIR/src

cp /opt/openrov/arduino/OpenROV/* $BUILDDIR/src
echo staged src in to build folder 1>&2

EXTENSION=`echo $extension | awk '{print tolower($0)}'`

echo $BUILDDIR

exit 0
