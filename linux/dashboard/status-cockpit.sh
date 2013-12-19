#!/bin/bash

/etc/init.d/openrov status
export RESULT=$?
if [ $RESULT = 0 ]; then #running
	exit 0

elif [ $RESULT = 3 ]; then
	exit 1
fi
exit 99