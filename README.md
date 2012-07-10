OpenROV ROVision
================

"[OpenROV](http://openrov.com/) is a DIY telerobotics community centered around underwater exploration & adventure."  One goal of OpenROV is to have onboard video for live viewing as the user operates the ROV.  Enter: ROVision.

Introduction
------------

We designed the onboard video platform using several key technologies: 

- [OpenCV](http://opencv.willowgarage.com/)
- [Node.js](http://nodejs.org/)
- [Socket.io](http://socket.io/)

Combining these great technologies provides a lot of power and room for future growth.  But is also provides well documented means to extend OpenROV.  With Node.js and Socket.io, not only are we able to stream video to a web browser by updating an image, but we are also able to control the ROV and view valuable sensor information.  This is just the beginning.  Ultimately, we would like to move to a WebM (or similar) video stream from OpenCV, but we need your help.  We're hoping that you, the community, are as excited as we are to explore the many uncharted areas underwater.  We have many exciting ideas for the future


Requirements
------------
- BeagleBone: [http://beagleboard.org/bone](http://beagleboard.org/bone)
- USB webcam:  we're using the Microsoft LifeCam HD-5000
- Ubuntu 11.10 for BeagleBone:  [http://elinux.org/BeagleBoardUbuntu#Demo_Image](http://elinux.org/BeagleBoardUbuntu#Demo_Image)
- OpenCV 2.3:  [http://opencv.willowgarage.com/](http://opencv.willowgarage.com/)
- Node.js:  [http://nodejs.org/](http://nodejs.org/)
- Socket.io:  [http://socket.io/](http://socket.io/)

###For installation
(pre-OpenROV-custom-image):

- g++
- make
- cmake
- svn
- pkg-config
- npm

Installation
------------

*We WILL be making a custom image to bypass this difficult process in the future.*

I will warn you that this was a hairy process.  

First, download and install Ubuntu (link above) onto a microSD card.  Then, put it in the BeagleBone and plug the BeagleBone into a router.  You need to SSH into the BeagleBone once it has booted:

    $ ssh -l ubuntu 192.168.1.100

Where the IP address corresponds to the BeagleBone's current IP address.  The default password is listed on the Ubuntu download page (linked above).  It should be:  `temppwd`

Make sure the BeagleBone has an Internet connection.  Install dependencies:

`$ sudo apt-get install g++`
`$ sudo apt-get install make`
`$ sudo apt-get install cmake`
`$ sudo apt-get install subversion`
`$ wget http://sourceforge.net/projects/numpy/files/NumPy/1.6.1/numpy-1.6.1.tar.gz` - untar then install
`$ sudo apt-get install pkg-config`

OpenCV:
- [http://opencv.willowgarage.com/wiki/InstallGuide](http://opencv.willowgarage.com/wiki/InstallGuide)
- [http://thebitbangtheory.wordpress.com/2011/10/23/how-to-install-opencv-2-3-1-in-ubuntu-11-10-oneiric-ocelot-with-python-support/](http://thebitbangtheory.wordpress.com/2011/10/23/how-to-install-opencv-2-3-1-in-ubuntu-11-10-oneiric-ocelot-with-python-support/)

Install Node.js from source (we used v0.6.12):
[https://github.com/joyent/node/wiki/Installation](https://github.com/joyent/node/wiki/Installation)

`$ sudo apt-get install curl`

NPM:  [http://npmjs.org/](http://npmjs.org/)

`$ sudo npm install -g socket.io`

Finally, download ROVision, then compile the C++ program using this command:

    $ g++ capture.cpp -o capture `pkg-config opencv --cflags --libs`

To run,

    $ NODE_ENV=production node app.js



Future
------

As I mentioned earlier, one of our top future goals is getting a WebM (or maybe h.264) stream output from OpenCV (NOTE).  However, we have so much more planned.  Imagine being able to track a fish, or map underwater environments in 3D, or coordinate multiple ROV's using vision, or whatever you can imagine!  Please fork & play.  We'd love to see what you create.

UPDATE:  we're sticking with a JPEG stream for the foreseeable future.

License
-------

[http://www.gnu.org/copyleft/gpl.html] (GPLv3)

ROVision is software for remotely operating an OpenROV vessel.
Copyright (C) 2012  Bran Sorem

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see [http://www.gnu.org/licenses/](http://www.gnu.org/licenses/).