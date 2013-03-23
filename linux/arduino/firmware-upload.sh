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
echo Serial port settings 1>&2
/opt/openrov/linux/reset.sh 1>&2 || error_exit "$LINENO:"
# ino upload -m atmega328 -p /dev/ttyO1 1>&2 
#ino build 1>&2
/opt/openrov/linux/setuart.sh 1>&2 || error_exit "$LINENO:"
COUNTER=0
DELAY=0
OUTPUT=`ino upload -m atmega328 -p /dev/ttyO1 2>&1`
while [ $COUNTER -lt 10 ]; do 
#OUTPUT=`sudo avrdude -c arduino -D -vvvv -i $DELAY -P /dev/ttyO1 -p m328p -U flash:w:.build/atmega328/firmware.hex 2>&1`
	#sleep 1
        echo "high" > /sys/class/gpio/gpio32/direction
	sudo /opt/openrov/linux/setuart.sh &
	#/opt/openrov/linux/reset.sh 1>&2
	# sleep $COUNTER
        echo "low" > /sys/class/gpio/gpio32/direction
        echo $OUTPUT  |  grep "bytes of flash verified"
	if [ $? -eq 0 ] 
		then
                        echo "high" > /sys/class/gpio/gpio32/direction
			echo upload successfull! 1>&2
			echo $OUTPUT 1>&2
			exit 0
		fi
	COUNTER=`expr $COUNTER + 1`
        DELAY=`expr $DELAY + 50`
	echo upload failed, trying again. 1>&2
	echo $OUTPUT 1>&2
	sudo /opt/openrov/linux/reset.sh 1>&2
	sleep 5
done
error_exit "Failed to upload after numerous tries. Aborting."
