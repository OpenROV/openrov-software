#!/bin/sh
cd /var
sudo dd if=/dev/zero of=swapfile bs=1M count=128
sudo mkswap /var/swapfile
sudo swapon /var/swapfile

cat >> /etc/fstab << __EOF__ 
/var/swapfile   none    swap    sw                   0 0

__EOF__
