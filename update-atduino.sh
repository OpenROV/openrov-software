#!/bin/sh

TEMPDIR=`mktemp -d`
DIR="`dirname \"$0\"`"
cd $DIR
DIR=`pwd`

echo Stopping OpenROV Cockpit
/etc/init.d/openrov stop

tar zcf $TEMPDIR/openrov.tar.gz $DIR/arduino/OpenROV

echo Installing firmware
sudo $DIR/linux/arduino/firmware-install.sh $TEMPDIR/openrov.tar.gz

echo starting OpenROV Cockpit
/etc/init.d/openrov start