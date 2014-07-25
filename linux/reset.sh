#!/bin/sh
# GPIO1 equals equals /sys/class/gpio32 (32 + 0)

back_to_normal() {
  sleep 0.1
  #set GPIO1_0 to HIGH
  echo 1 > /sys/class/gpio/gpio$LINUX_RESET_GPIO/value
  echo Arduino reset set high, Arduino enabled.
}

reset() {
  #prepare gpio
  echo $LINUX_RESET_GPIO > /sys/class/gpio/export
  echo "out" >/sys/class/gpio/gpio$LINUX_RESET_GPIO/direction 
  #set GPIO1_0 to low
  echo 0 > /sys/class/gpio/gpio$LINUX_RESET_GPIO/value
  back_to_normal 
}

#setup required environment variables if not already set
. /opt/openrov/cockpit/linux/openrov_config.sh

echo Initiating arduino reset on pin $LINUX_RESET_GPIO 1>&2
reset &

