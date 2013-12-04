#!/bin/sh

if [ "$(id -u)" != "0" ]; then
   echo "This script must be run as root or with sudo" 1>&2
   exit 1
fi

echo "d
2
n
p
2


p
w
" | fdisk /dev/mmcblk0

touch /var/_RESIZE_ROOT_

reboot
