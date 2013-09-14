#!/bin/sh
# GPIO1 equals equals /sys/class/gpio32 (32 + 0)

back_to_normal() {
  sleep 0.1
  #set GPIO1_0 to HIGH
  echo "high" > /sys/class/gpio/gpio30/direction
}

reset() {
  #sleep 1
  #prepare gpio
  echo "30" > /sys/class/gpio/export
  echo "out" >/sys/class/gpio/gpio30/direction 
  #set GPIO1_0 to low
  echo "low" > /sys/class/gpio/gpio30/direction
  back_to_normal 
}
echo Initiating arduino reset 1>&2
reset &

