OpenROV ROVision
================

"[OpenROV](http://openrov.com/) is a DIY telerobotics community centered around underwater exploration & adventure."  One goal of OpenROV is to have onboard video for live viewing as the user operates the ROV.  Enter: ROVision.

Introduction
------------

We designed the onboard video platform using several key technologies: 

- [OpenCV](http://opencv.willowgarage.com/)
- [Node.js](http://nodejs.org/)
- [Socket.io](http://socket.io/)

Combining these great technologies provides a lot of power and room for future growth.  But is also provides well documented means to extend OpenROV.  With Node.js and Socket.io, not only are we able to stream video to a web browser by updating an image, but we are also able to control the ROV and view valuable sensor information.  This is just the beginning.  


Requirements
------------
- BeagleBone: [http://beagleboard.org/bone](http://beagleboard.org/bone)
- USB webcam:  we're using the Genius F100 HD
- Ubuntu 12.04 for BeagleBone:  [http://elinux.org/BeagleBoardUbuntu#Demo_Image](http://elinux.org/BeagleBoardUbuntu#Demo_Image)
- OpenCV 2.4.2:  [http://opencv.willowgarage.com/](http://opencv.willowgarage.com/)
- Node.js (v0.6.14):  [http://nodejs.org/](http://nodejs.org/)
- Socket.io:  [http://socket.io/](http://socket.io/)

Installation
------------

Step 1
------

a)  Install 12.04 Ubuntu

b)  Plug into router

c)  Find IP address (look through your router or something...) - I'm calling it __IP__

Step 2
------

Change the user name and password.

Login as default user (ubuntu):

    ssh -l ubuntu __IP__
    (pass) temppwd
    
Then change to root:

    su
    (pass) root
    
Add a temporary user:

    useradd -m temp
    passwd temp
    (pass) temppwd
    adduser temp sudo

Switch to temp user then change primary account name/password:

    logout

(if ubuntu still logged in:  su, then:  pkill -KILL -u ubuntu)

    ssh -l temp __IP__
    su
    usermod -l rov -m -d /home/rov ubuntu
    passwd rov
    (pass) OpenROV
    exit
    exit

Login as new user (rov):

    ssh -l rov __IP__
    (pass) OpenROV

Delete temporary user:

    su
    userdel -r temp
    exit

    su
    vi /etc/hostname

Change from "arm" (without quotes) to "openrov-XXXX" (without quotes) - where XXXX is your serial number.

    vi /etc/hosts

Change from "arm" (without quotes) to "openrov-XXXX" (without quotes) - where XXXX is your serial number.

    reboot


Step 3
------

Update/upgrade software and install rerequisits (holy moly, there're packages!):

    sudo apt-get update
    sudo apt-get install g++ curl pkg-config libv4l-dev libjpeg-dev build-essential libssl-dev vim nodejs npm libopencv-dev


Step 4
------

Download OpenROV ROVision:

    cd ~
    git clone git://github.com/OpenROV/openrov-software.git
    cd openrov-software/

Change to development branch:

    git checkout development

edit ~/.bashrc, add:

    export LD_LIBRARY_PATH=/usr/local/lib

You'll need to restart your shell:

    source ~/.bashrc

Step 5
------

Download modules:

    npm install express socket.io serialport


Step 6
------

Compile the capture C++ file:

    cd src/
    g++ capture.cpp -o capture `pkg-config opencv --cflags --libs`


Step 8
------

To enable the UART1 on every boot, you need to add some lines to /etc/rc.local

    su
    echo "echo 20 > /sys/kernel/debug/omap_mux/uart1_rxd" >> /etc/rc.local
    echo "echo 0 > /sys/kernel/debug/omap_mux/uart1_txd" >> /etc/rc.local

Go ahead and restart at this point.

Step 9
------

Try it out!

    node app

Future
------

We have so much more planned.  Imagine being able to track a fish, or map underwater environments in 3D, or coordinate multiple ROV's using vision, or whatever you can imagine!  Please fork & play.  We'd love to see what you create.

License
-------

MIT License

Copyright (C) 2012 Bran Sorem

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.