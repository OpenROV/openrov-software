#!/bin/sh

service samba status
export RESULT=$?
if [ $RESULT = 0 ]; then #running
        exit 0
else
        exit 1
fi


