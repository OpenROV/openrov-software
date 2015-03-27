[![Views in the last 24 hours](https://sourcegraph.com/api/repos/github.com/OpenROV/openrov-software/counters/views-24h.png)](https://sourcegraph.com/github.com/OpenROV/openrov-software)
[![Build Status](https://secure.travis-ci.org/OpenROV/openrov-software.png?branch=master)](http://travis-ci.org/OpenROV/openrov-software)
[![Code Climate](https://codeclimate.com/github/OpenROV/openrov-software.png)](https://codeclimate.com/github/OpenROV/openrov-software)
[![Coverage Status](https://coveralls.io/repos/OpenROV/openrov-software/badge.png)](https://coveralls.io/r/OpenROV/openrov-software)
[![Scrutinizer Quality Score](https://scrutinizer-ci.com/g/OpenROV/openrov-software/badges/quality-score.png?s=c24130cbf17aaa23f2680e3b45a0ec675ef2037f)](https://scrutinizer-ci.com/g/OpenROV/openrov-software/)
[![Code Coverage](https://scrutinizer-ci.com/g/OpenROV/openrov-software/badges/coverage.png?s=e356e3047940fb7ea47e36477c6064e23fee12c0)](https://scrutinizer-ci.com/g/OpenROV/openrov-software/)
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/OpenROV/discuss?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

OpenROV Cockpit
================

"[OpenROV](http://openrov.com/) is a DIY telerobotics community centered around underwater exploration & adventure."  One goal of OpenROV is to have onboard video for live viewing as the user operates the ROV.  Enter: OpenROV Cockpit.

Getting started
---------------

**If you just getting started and want to have working environment for the OpenROV Cockpit, we recommend that you start with using our last stable release from our [releases page](https://github.com/OpenROV/openrov-software/releases).  If you want to explore building your own image from scratch, refer to our  
[OpenROV disk Image](https://github.com/OpenROV/openrov-image/blob/master/README.md) project.  The latest development image (from master) can be downloaded from http://54.187.8.25:8080/job/OpenROV-Image_BuildImage_master/.

Introduction
------------

We designed the onboard video platform using several key technologies:

- [MJPEG_Streamer](https://code.google.com/p/mjpg-streamer/)
- [Node.js](http://nodejs.org/)
- [Socket.io](http://socket.io/)

Combining these great technologies provides a lot of power and room for future growth.  But is also provides well documented means to extend OpenROV.  With Node.js and Socket.io, not only are we able to stream video to a web browser by updating an image, but we are also able to control the ROV and view valuable sensor information.  This is just the beginning.  

Key Related Projects
----------------

* The firmware for the arduino can be found in [openrov/openrov-software-arduino](https://github.com/OpenROV/openrov-software-arduino) in the /OpenROV project.
* The dashboard project can be found in [openrov/openrov-dashboard](https://github.com/OpenROV/openrov-dashboard)

Note on Repository Branches
---------------------------

The "master" branch is the most current development branch of the code.  All work is done outside and submited as pull requests that *should* be working before they are merged.  There will also be a `<release>`-maintanence branch that has the code from the last stable release.  There may also be a `<release>`-alpha|beta|rc1 which is the next release that is being stabalized.  This will more than likely change as committers come and go, but that it what it looks like today.

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

Customize the name of the image to match your rov#.


Change from "openrov" (without quotes) to "openrov-XXXX" (without quotes) - where XXXX is your serial number.

    vi /etc/hosts
    exit

Step 4
------

Upload the right firmware on to the arduino that is driving the motors and sensors.  The source code for the arduino is actually installed in the git repo on the beaglebone. The beaglebone has a full arduino development environment and the ability to upload the firmware to the arduino.

Since there are multiple versions of the ROV with multiple possible configurations you have to first tailor the options for the firmware to match your ROV.  It defaults to the stock installation for the *current* shipping ROV kit.

a) from the ssh session: sudo pico /opt/openrov/arduino/OpenROV/Aconfig.h

b) put a 1 for the options you have, a 0 if you don't have the option and save. For most folks you don't need to do anything because the type of board will be automatically detected. In case you could

c) Login to the web session for the rov, choose settings, and select the upload firmware to arduino option.

Updating
------------
NOTE: This is changing and may not be working properly.  
The easiest way to upgrade your installation is to ssh on to

1) ssh on to your rov

2) cd /opt/openrov/cockpit

3) sudo ./update.sh

This will go to the github repository and pull the latest code. You may need to reboot after the update.  There is a known issue where the serial.io project sometimes fails to compile.  You can ignore that, but you may have to try again if it aborts the update.

Plugins
------------
You can create your own plugins and share them with the community. Take a look at our [openrov-grunt-init-plugin](https://github.com/openrov/openrov-grunt-init-plugin) project.  


How to Contribute
------------

Contributions require that you sign a [CLA](http://wiki.openrov.com/index.php/Special:SignDocument?doc=9) before the project can accept your pull requests.

1) Fork the project in github

2) Add an issue to the issue list for the changes you want to make.  Browse the issues lists for many of the fixes and enhancement requests if you are looking for ideas.

3) Make your changes and or fixes.

4) Test them locally on your ROV or using the mock framework for node if you don't have one.

5) Send a pull request back to the Master repository.

More details can be found on the [OpenROV Wiki](http://wiki.openrov.com/index.php/Contributing).

Someone on the team will review the pull request and ensure the changes work on the ROVs before approving the pull request.

License
-------

MIT License

Copyright (C) 2013 OpenROV Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
