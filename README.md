OpenROV Cockpit
================

"[OpenROV](http://openrov.com/) is a DIY telerobotics community centered around underwater exploration & adventure."  One goal of OpenROV is to have onboard video for live viewing as the user operates the ROV.  Enter: OpenROV Cockpit.

Getting started
---------------

**If you just getting started and wan't to have working environment for the OpenROV Cokpit, we recommend that you start with using our ready made [OpenROV disk Image](https://github.com/OpenROV/openrov-image/blob/master/README.md)!**

Introduction
------------

We designed the onboard video platform using several key technologies: 

- [MJPEG_Streamer](https://code.google.com/p/mjpg-streamer/)
- [Node.js](http://nodejs.org/)
- [Socket.io](http://socket.io/)

Combining these great technologies provides a lot of power and room for future growth.  But is also provides well documented means to extend OpenROV.  With Node.js and Socket.io, not only are we able to stream video to a web browser by updating an image, but we are also able to control the ROV and view valuable sensor information.  This is just the beginning.  


Requirements
------------
- BeagleBone: [http://beagleboard.org/bone](http://beagleboard.org/bone)
- USB webcam:  we're using the Genius F100 HD
- Ubuntu for BeagleBone:  [http://elinux.org/BeagleBoardUbuntu#Demo_Image](http://elinux.org/BeagleBoardUbuntu#Demo_Image) or [https://github.com/codewithpassion/openrov-image](https://github.com/codewithpassion/openrov-image)
- mjpg-streamer:  [http://sourceforge.net/projects/mjpg-streamer/](http://sourceforge.net/projects/mjpg-streamer/)
- Node.js :  [http://nodejs.org/](http://nodejs.org/)
- Socket.io:  [http://socket.io/](http://socket.io/)

Installation
------------

Step 1
------

Follow the instructions from our image project to get a starting image: https://github.com/OpenROV/openrov-image.  The default user is *rov* and password is *OpenROV*

Step 2
------

Go ahead and start up the image in the beaglebone.  If you connect the rov to a router it will use DHCP to get an address. You many need to login to your router and examine the dhcp logs to figure out what IP was assigned.  If you connect directly to a laptop, a static IP of 192.168.254.1 is used.
Go ahead and SSH on to you rov

a) ssh rov@<address of rov>

Step 3
------

Customive the name of the image to match your rov#.


Change from "openrov" (without quotes) to "openrov-XXXX" (without quotes) - where XXXX is your serial number.

    vi /etc/hosts
    exit

Step 4
------

Upload the right firmware on to the arduino that is driving the motors and sensors.  The source code for the arduino is actually installed in the git repo on the beaglebone. The beaglebone has a full arduino development environment and the ability to uplaod the firmware to the ardino.

Since there are multiple versions of the ROV with multiple possible configurations you have to first tailor the options for the firmware to match your ROV.  It defaults to the stock installation for the *current* shipping ROV kit.

a) from the ssh session: sudo pico /opt/openrov/arduino/OpenROV/Aconfig.h

b) put a 1 for the options you have, a 0 if you don't have the option and save.  For most folks you simply need to choose if you have the cape or controllerboard25.

c) Login to the web session for the rov, choose settings, and select the upload firmware to ardino option.

Updating
------------
The easiest way to upgrade your installation is to ssh on to

1) ssh on to your rov
2) cd /opt/openrov
3) sudo ./update.sh

This will go to the github repositroy and pull the latest code. You may need to reboot after the update.  There is a known issue where the serial.io project sometimes failes to compile.  You can ignore that, but you may have to try again if it aborts the update.



License
-------

MIT License

Copyright (C) 2013 OpenROV Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

