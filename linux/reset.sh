#!/bin/sh
# GPIO6 equals equals /sys/class/gpio38 (32 + 6)

#seting up GPIO6 (32+6 = 38)
#see http://ninjablocks.com/blog/2012/1/20/setting-up-gpio-on-the-beaglebone.htm l
echo "38" > /sys/class/gpio/export
echo "out" > /sys/class/gpio/gpio38/direction
echo "32" > /sys/class/gpio/export
echo "out" >/sys/class/gpio/gpio32/direction 
echo 7 > /sys/kernel/debug/omap_mux/gpmc_ad0


back_to_normal() {
  sleep 2
  #set GPIO6 to LOW
  echo "0" > /sys/class/gpio/gpio38/value
  echo "high" > /sys/class/gpio/gpio32/direction
}

reset() {
  #set GPIO6 to HIGH
  echo "1" > /sys/class/gpio/gpio38/value
  echo "low" > /sys/class/gpio/gpio32/direction
  back_to_normal &
}
echo Initiating arduino reset 1>&2
reset &
sleep 1

