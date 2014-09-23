#!/bin/bash
set -e

if [ ! -d "afro_firmware" ]; then
  echo "Cannot find the afro_esc firmware project. Make sure it has been installed."
  exit -1
fi

/etc/init.d/openrov stop
arduino/firmware-install-usblinker.sh
avrdude -p m8 -b 19200 -P /dev/ttyO1 -c avrispv2 -e -U flash:w:afro_firmware/afro_nfet.hex:i -vv
stty -F /dev/ttyO1 raw 19200
echo -n "\$M<P52" > /dev/ttyO1
avrdude -p m8 -b 19200 -P /dev/ttyO1 -c avrispv2 -e -U flash:w:afro_firmware/afro_nfet.hex:i -vv
echo -n "\$M<P53" > /dev/ttyO1
avrdude -p m8 -b 19200 -P /dev/ttyO1 -c avrispv2 -e -U flash:w:afro_firmware/afro_nfet.hex:i -vv
arduino/firmware-installfromsource.sh
/etc/init.d/openrov restart
