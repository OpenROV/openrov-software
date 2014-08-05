#!/bin/sh

dtc -O dtb -o /lib/firmware/OPENROV-RESET-00A0.dtbo -b 0 -@ /opt/openrov/cockpit/linux/device-tree-overlays/OPENROV-RESET-00A0.dts  
dtc -O dtb -o /lib/firmware/BB-SPI0DEV-00A0.dtbo -b 0 -@ /opt/openrov/cockpit/linux/device-tree-overlays/BB-SPI0DEV-00A0.dts  