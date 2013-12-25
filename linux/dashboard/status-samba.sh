#!/bin/sh

STATUS=`status smbd`
if [ "$STATUS" = "smbd stop/waiting" ]; then #stopped
	exit 1
fi
exit 0