#!/bin/sh
# 
# for reference check out: http://www.jerome-bernard.com/blog/2012/06/04/beaglebone-serial-ports-and-xbees/
echo 0 > /sys/kernel/debug/omap_mux/uart1_txd #setting mode of UART1 TX to in
echo 20 > /sys/kernel/debug/omap_mux/uart1_rxd #setting mode of UART1 TX to out

