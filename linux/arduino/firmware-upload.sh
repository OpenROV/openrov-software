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
echo Setting up uploader 1>&2

COUNTER=0
#setup required environment variables if not already set
. /opt/openrov/cockpit/linux/openrov_config.sh

while [ $COUNTER -lt 9 ]; do
        echo $COUNTER
        if [ "$UPLOAD_REQUIRES_RESET" = "true" ]
	then
        	(sleep 0.0$COUNTER && /opt/openrov/cockpit/linux/reset.sh 1>&2)
	fi
    EXITCODE=`$UPLOAD_TO_ATMEGA_COMMAND 1>&2`
	if [ $? -eq 0 ]
		then
			echo upload successfull! 1>&2
			exit 0
		fi
	COUNTER=`expr $COUNTER + 1`
	echo upload failed, trying again. 1>&2
done
error_exit "Failed to upload after numerous tries. Aborting."
