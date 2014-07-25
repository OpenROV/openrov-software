#!/bin/sh

/etc/init.d/cloud9 status
export RESULT=$?
if [ $RESULT = 0 ]; then #running
	exit 0
else
	exit 1
fi
