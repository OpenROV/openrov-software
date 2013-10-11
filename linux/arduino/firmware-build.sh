#!/bin/sh

# I put a variable in my scripts named PROGNAME which
# holds the name of the program being run.  You can get this
# value from the first item on the command line ($0).

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

cd $1/src || error_exit "$LINENO: Cannot change directory! Aborting"

HASH=`find -type f -print0 | sort -z | xargs -0 sha1sum | sha1sum `

cd $1 || error_exit "$LINENO: Cannot change directory! Aborting"

mv $1/src/Device.cpp $1/src/Device.cpp.template

sed 's/CUSTOM_BUILD/'"$HASH"'/g' $1/src/Device.cpp.template > $1/src/Device.cpp

rm $1/src/Device.cpp.template

#ino build -m mega2560  1>&2 || error_exit "$LINENO: Compile of the Arduino image failed."
echo $BUILD_ATMEGA_CODE  1>&2 || error_exit "$LINENO: Compile of the Arduino image failed."

echo $1
exit 0
