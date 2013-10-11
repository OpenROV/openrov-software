#!/bin/sh

# This code will try to automatically detect known motor/power boards and configure the correctly tailored command for them*/

testGPIOhigh() {

  echo $1 > /sys/class/gpio/export || true
  echo "in" >/sys/class/gpio/gpio$1/direction || true
  local TESTVAL=`cat /sys/class/gpio/gpio$1/value` || true 
  if test "$TESTVAL" = "1"
  then
	return 0 #true
  else
	return 1  #false
  fi

}

export ROV_BOARD=custom

if testGPIOhigh 32
then
    export ROV_BOARD=cape
fi

if testGPIOhigh 30
then
    export ROV_BOARD=board25
fi

echo "$ROV_BOARD" > /var/run/rov_board

exit 0

