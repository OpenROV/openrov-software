#!/bin/sh

BUILDDIR=`mktemp -d`
ZIP=zip
PWD=`pwd`

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
	unzip $1  1>&2 	
fi
echo $BUILDDIR

exit 0
