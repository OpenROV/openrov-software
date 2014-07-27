#!/bin/sh

/etc/init.d/openrov stop
/etc/init.d/dashboard stop
git pull origin master
if [ -f /opt/openrov/cockpit/updatelinux.sh ]
then
	/opt/openrov/cockpit/updatelinux.sh
fi
/opt/node/bin/npm install
/opt/openrov/cockpit/linux/arduino/firmware-installfromsource.sh
/etc/init.d/openrov start
/etc/init.d/dashboard start
