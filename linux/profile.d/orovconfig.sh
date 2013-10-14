#!/bin/sh


export ROV_BOARD=`cat /var/run/rov_board`

if test "$ROV_BOARD" = "board25"
then
    export UPLOAD_TO_ATMEGA_COMMAND="avrdude -P /dev/spidev1.0 -c linuxspi -vv -p m2560 -U flash:w:.build/mega2560/firmware.hex"
    export BUILD_ATMEGA_CODE="ino build -m mega2560"
    export LINUX_RESET_GPIO=30
fi


if test "$ROV_BOARD" = "cape"
then
    export UPLOAD_TO_ATMEGA_COMMAND="avrdude -P /dev/ttyO1 -c arduino -D -vvvv -p m328p -U flash:w: .build/uno/firmware.hex"
    export BUILD_ATMEGA_CODE="ino build"
    export LINUX_RESET_GPIO=32
fi

echo "$ROV_BOARD"
echo "$UPLOAD_TO_ATMEGA_COMMAND"
echo "$BUILD_ATMEGA_CODE"
echo "$LINUX_RESET_GPIO"

