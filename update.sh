#!/bin/sh

/etc/init.d/openrov stop
/etc/init.d/dashboard stop
git pull origin master
if [ -f /opt/openrov/updatelinux.sh ]
then
	/opt/openrov/updatelinux.sh
fi
/opt/node/bin/npm install
/opt/openrov/linux/arduino/firmware-installfromsource.sh
/etc/init.d/openrov start
/etc/init.d/dashboard start