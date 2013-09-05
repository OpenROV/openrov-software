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

cd $1  || error_exit "$LINENO:"

COUNTER=0
while [ $COUNTER -lt 9 ]; do
        echo $COUNTER
        avrdude -P /dev/ttyO1 -c arduino-openrov -b 57600 -D -v -p m328p -U flash:w:.build/uno/firmware.hex 2>&1

	if [ $? -eq 0 ] 
		then
			echo upload successfull! 1>&2
			#echo $OUTPUT 1>&2
			exit 0
		fi
	COUNTER=`expr $COUNTER + 1`
	echo upload failed, trying again. 1>&2
done
error_exit "Failed to upload after numerous tries. Aborting."
