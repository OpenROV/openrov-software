#!/bin/sh

BUILDDIR=`mktemp -d`
ZIP=zip
PWD=`pwd`
ARDUINOFILE=$1

echo unpack: build dir is $BUILDDIR 1>&2
cd $BUILDDIR
/usr/local/bin/ino init  1>&2 
rm src/*.ino

cd $BUILDDIR/src

filename=$(basename "$1")
extension="${filename##*.}"
filename="${filename%.*}"

EXTENSION=`echo $extension | awk '{print tolower($0)}'`

if test "$EXTENSION" = "zip" 
then
	unzip $ARDUINOFILE  1>&2 	
	echo unziped $ARDUINOFILE in `pwd` 1>&2
fi
if test "$EXTENSION" = "gz"
then
	tar zxf $ARDUINOFILE 1>&2
	echo un-tared $ARDUINOFILE in `pwd` 1>&2
fi
echo $BUILDDIR

exit 0
