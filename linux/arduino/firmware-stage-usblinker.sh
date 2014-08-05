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

echo staging: build dir is $BUILDDIR 1>&2
cd $BUILDDIR || error_exit "Unable to change directory"
/usr/local/bin/ino init  1>&2  || error_exit "Failed to initialize the Arduino project directory. Aborting"
rm src/*.ino || error_exit "Cleaning excess project files failed. Aborting"

cd $BUILDDIR/src || error_exit "Unable to change to src folder"

cp /opt/openrov/arduino/ArduinoUSBLinker/* $BUILDDIR/src || error_exit "Copying files from the github src folder to the temp folder failed.  Aborting"
echo staged src in to build folder 1>&2 

EXTENSION=`echo $extension | awk '{print tolower($0)}'`

echo $BUILDDIR

exit 0
