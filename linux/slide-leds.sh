#!/bin/bash

LED_STATE[0]="0,0,0,0"
LED_STATE[1]="255,0,0,0"
LED_STATE[2]="255,255,0,0"
LED_STATE[3]="255,255,255,0"
LED_STATE[4]="255,255,255,255"
LED_STATE[5]="0,255,255,255"
LED_STATE[6]="0,0,255,255"
LED_STATE[7]="0,0,0,0"
LED_STATE[8]="0,0,0,255"
LED_STATE[9]="0,0,255,255"
LED_STATE[10]="0,255,255,255"
LED_STATE[11]="255,255,255,255"
LED_STATE[12]="255,255,255,0"
LED_STATE[13]="255,255,0,0"
LED_STATE[14]="255,0,0,0"

COUNTER=0

while true; do
  while IFS=',' read -ra ADDR; do
      LedCounter=0
      for i in "${ADDR[@]}"; do
          echo $i > /sys/class/leds/beaglebone\:green\:usr$LedCounter/brightness
          LedCounter=`expr $LedCounter + 1`
      done
  done <<< "${LED_STATE[$COUNTER]}"

  COUNTER=`expr $COUNTER + 1`
  if [ "$COUNTER" -eq "14" ]; then
    COUNTER=0
  fi
  sleep 0.1
done
