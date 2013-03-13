#!/bin/sh

PROGNAME=$(basename $0)

error_exit ()
{

#	----------------------------------------------------------------
#	Function for exit due to fatal program error
#		Accepts 1 argument:
#			string containing descriptive error message
#	----------------------------------------------------------------


	echo "${PROGNAME}: ${1:-"Unknown Error"}" 1>&2
	exit 1
}

BUILDDIR=`mktemp -d`
ZIP=zip
PWD=`pwd`
ARDUINOFILE=$1

echo unpack: build dir is $BUILDDIR 1>&2
cd $BUILDDIR || error_exit "Changing to temp folder.  Aborting" 
/usr/local/bin/ino init  1>&2  || error_exit "Initing ino project directory failed! Aborting"
rm src/*.ino || error_exit "Failed to clean excess ino project files! Aborting"

cd $BUILDDIR/src || error_exit "Changing to src folder! Aborting"

filename=$(basename "$1")
extension="${filename##*.}"
filename="${filename%.*}"

EXTENSION=`echo $extension | awk '{print tolower($0)}'`

if test "$EXTENSION" = "zip" 
then
	unzip $ARDUINOFILE  1>&2 || error_exit "Failed to unzip the archive" 
	echo unziped $ARDUINOFILE in `pwd` 1>&2
fi
if test "$EXTENSION" = "gz"
then
	tar zxf $ARDUINOFILE 1>&2 || error_exit "Failed to untar the archive! Aborting"
	echo un-tared $ARDUINOFILE in `pwd` 1>&2
fi
echo $BUILDDIR

exit 0
