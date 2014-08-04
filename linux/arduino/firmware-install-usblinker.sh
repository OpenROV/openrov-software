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

DIR="`dirname \"$0\"`"

echo unpacking $1
TMPDIR=`$DIR/firmware-stage-usblinker.sh $1` || error_exit "Staging Firmware Failed! Aborting"
echo unpacked $1 into folder $TMPDIR

echo compilling in $TMPDIR
BUILD=`$DIR/firmware-build.sh $TMPDIR` || error_exit "Building Firmware Failed! Aborting"
echo compilled in $TMPDIR

echo uploading firmware from $TMPDIR
UPLOAD=`$DIR/firmware-upload.sh $TMPDIR`  || error_exit "Uploading Firmware Failed! Aborting"
echo uploaded firmware

echo 0
