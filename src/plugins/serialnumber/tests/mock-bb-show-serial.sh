#!/bin/sh
#

notif () {
   #echo "\033[1;34m${1}\033[0m${2}"
   echo "${1}${2}"
}

print_serial () {
   notif "beaglebone serial number: " "123BBB123123"
}

print_serial
