#!/bin/sh

cd $1
#the first time you call 'ino upload' it has to configure itself. That takes longer and interferes with the reset. therefore we start it before hand and let it fail.
echo Setting up uploader 1>&2
ino upload -m atmega328 -p /dev/ttyO1 1>&2 

COUNTER=0
while [ $COUNTER -lt 10 ]; do 
	sleep 1
	sudo /opt/openrov/linux/reset.sh &
	#ino upload -m atmega328 -p /dev/ttyO1 2>&1 |  grep "avrdude: safemode: Fuses OK" 
	OUTPUT=`ino upload -m atmega328 -p /dev/ttyO1 2>&1`
	echo $OUTPUT  |  grep "bytes of flash verified"
	if [ $? -eq 0 ] 
		then 
			echo upload successfull! 1>&2
			echo $OUTPUT 1>&2
			exit 0
		fi
	COUNTER=`expr $COUNTER + 1`
	echo upload failed, trying again. 1>&2
	echo $OUTPUT 1>&2
	sleep 2
done

	cat output.log 1>&2
exit 0
