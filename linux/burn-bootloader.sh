#!/bin/sh
avrdude -P /dev/spidev1.0 -b 10000 -c linuxspi -vv -p m2560 -U lfuse:w:0xFF:m -U hfuse:w:0xDE:m -U efuse:w:0xFD:m -U lock:w:0x3F:m
avrdude -P /dev/spidev1.0 -c linuxspi -vv -p m2560 -U flash:w:/usr/share/arduino/hardware/arduino/bootloaders/stk500v2/stk500boot_v2_mega2560.hex -U lock:w:0x0f:m
