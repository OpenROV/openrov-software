#!/bin/sh
# GPIO6 equals equals /sys/class/gpio38 (32 + 6)

#seting up GPIO6 (32+6 = 38)
#see http://ninjablocks.com/blog/2012/1/20/setting-up-gpio-on-the-beaglebone.htm l
echo "38" > /sys/class/gpio/export
echo "out" > /sys/class/gpio/gpio38/direction


back_to_normal() {
  sleep 2
  #set GPIO6 to LOW
  echo "0" > /sys/class/gpio/gpio38/value
}

reset() {
  #set GPIO6 to HIGH
  echo "1" > /sys/class/gpio/gpio38/value
  back_to_normal &
}
reset &
sleep 1

