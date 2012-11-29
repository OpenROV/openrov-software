#!/bin/sh

TEMPDIR=`mktemp -d`
DIR="`dirname \"$0\"`"
cd $DIR
DIR=`pwd`

tar zcf $TEMPDIR/openrov.tar.gz $DIR/arduino/OpenROV
sudo $DIR/linux/arduino/firmware-install.sh $TEMPDIR/openrov.tar.gz