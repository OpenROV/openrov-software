#!/bin/sh
# GPIO1 equals equals /sys/class/gpio32 (32 + 0)

#see http://ninjablocks.com/blog/2012/1/20/setting-up-gpio-on-the-beaglebone.htm l


back_to_normal() {
  sleep 1
  #set GPIO1_0 to HIGH
  echo "high" > /sys/class/gpio/gpio32/direction
}

reset() {
  sleep 1
  #prepare gpio
  echo "32" > /sys/class/gpio/export
  echo "out" >/sys/class/gpio/gpio32/direction 
  echo 7 > /sys/kernel/debug/omap_mux/gpmc_ad0
  #set GPIO1_0 to low
  echo "low" > /sys/class/gpio/gpio32/direction
  back_to_normal 
}
echo Initiating arduino reset 1>&2
reset &

