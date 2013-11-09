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
#the first time you call 'ino upload' it has to configure itself. That takes longer and interferes with the reset. therefore we start it before hand and let it fail.
echo Setting up uploader 1>&2
#/opt/openrov/linux/reset.sh 1>&2
#ino upload -m atmega328 -p /dev/ttyO1 1>&2 

COUNTER=0
#OUTPUT=`ino upload -p /dev/ttyO1 2>&1`
#OUTPUT=`avrdude -P /dev/ttyO1 -c arduino-openrov -b 57600 -D -vvvv -p m328p -U flash:w: .build/uno/firmware.hex 2>&1`
#setup required environment variables if not already set
. /opt/openrov/linux/orovconfig.sh

while [ $COUNTER -lt 9 ]; do
        echo $COUNTER
        if [UPLOAD_REQUIRES_RESET -eq true]
	then
        	(sleep 0.0$COUNTER && /opt/openrov/linux/reset.sh 1>&2)
	fi
#        avrdude -P /dev/spidev1.0 -c linuxspi -vv -p m2560 -U flash:w:.build/mega2560/firmware.hex 2>&1
        EXITCODE=`$UPLOAD_TO_ATMEGA_COMMAND 1>&2`
#	/opt/openrov/linux/reset.sh 1>&2#
#	sleep 0.4
#        echo $OUTPUT  |  grep "bytes of flash verified"
	if [ $? -eq 0 ] 
		then
			echo upload successfull! 1>&2
			#echo $OUTPUT 1>&2
			exit 0
		fi
	COUNTER=`expr $COUNTER + 1`
	echo upload failed, trying again. 1>&2
#	echo $OUTPUT 1>&2
#	sleep 1
done
error_exit "Failed to upload after numerous tries. Aborting."
