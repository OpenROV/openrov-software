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
- Ubuntu 12.04 for BeagleBone:  [http://elinux.org/BeagleBoardUbuntu#Demo_Image](http://elinux.org/BeagleBoardUbuntu#Demo_Image) or [https://github.com/codewithpassion/openrov-image](https://github.com/codewithpassion/openrov-image)
- mjpg-streamer:  [http://sourceforge.net/projects/mjpg-streamer/](http://sourceforge.net/projects/mjpg-streamer/)
- Node.js (v0.8.11):  [http://nodejs.org/](http://nodejs.org/)
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

If you use the image from https://github.com/codewithpassion/openrov-image you can skip this step, there is already a user *rov* with password *OpenROV*

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
    vi /etc/hostname

Change from "arm" (without quotes) to "openrov-XXXX" (without quotes) - where XXXX is your serial number.

    vi /etc/hosts
    exit

Change from "arm" (without quotes) to "openrov-XXXX" (without quotes) - where XXXX is your serial number.

    reboot


Step 3
------

Update/upgrade software and install rerequisits (holy moly, there're packages!):

    sudo apt-get update
    sudo apt-get install g++ curl pkg-config libv4l-dev libjpeg-dev build-essential libssl-dev vim cmake


Step 4
------

Install nvm (Node Version Manager):

    git clone git://github.com/creationix/nvm.git ~/.nvm
    echo ". ~/.nvm/nvm.sh" >> .bashrc
    echo "export LD_LIBRARY_PATH=/usr/local/lib" >> .bashrc
    echo "export PATH=$PATH:/opt/node/bin" >> .bashrc

And make those changes work now:

    source ~/.bashrc

Step 5
------

Try to install Node.js (it will not compile V8 properly):

    nvm install v0.8.11

Step 6
------

Fix V8 to compile (very sketchy right now):

==================================


Find this file for editing:

    ~/.nvm/src/node-v0.8.11/deps/v8/build/common.gypi

Add:

```diff
    {
      'variables': {
+        'arm_neon%': '1',
        'use_system_v8%': 0,
```


==================================


Step 7
------

From ~/.nvm/src/node-v0.8.11 directory, actually install Node.js:

    ./configure
    make
    sudo make install

    echo "nvm use v0.8.11" >> .bashrc


Step 8
------

Install mjpg-streamer

Download mjpg-stream:

     wget http://downloads.sourceforge.net/project/mjpg-streamer/mjpg-streamer/Sourcecode/mjpg-streamer-r63.tar.gz

Prepare mjpg-streamer for make:

    tar zxf mjpg-streamer-r63.tar.gz
    cd mjpg-streamer-r63.tar.gz

Make and install OpenCV:

    make && sudo make install


Step 9
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


Step 10
-------

Download modules:

    npm install express socket.io serialport


Step 11
-------

To enable the UART1 on every boot, you need to add some lines to __/etc/rc.local__ (you need to be su):

Copy etc/rc.local to your /etc/ and replace the one there.

That will not only enable UART1 after boot, but also remove references to your MAC so you can swap the SD card to another BeagleBone (trust me, this is handy).

Go ahead and restart at this point.


Step 12
-------

To enable some of the scripts, you need to enable sudo for the user rov be used without a password:

    sudo echo "rov ALL=NOPASSWD: /opt/openrov/linux/" >> /etc/sudoers

(You have to adapt the path _/opt/openrov/linux_ to match your environment)


Step 13
-------

Try it out!

    node app

Step 14 (optional)
-------

To start the node process on every boot, you can do the following:

    sudo ln -s /opt/openrov/linux/openrov.service /etc/init.d/openrov
    chmod +x /opt/openrov/linux/openrov.service
    sudo update-rc.d openrov defaults

(You have to adapt the path _/opt/openrov/linux_ to match your environment and change the paths in the _openrov.service_ file accordingly too)


Future
------

We have so much more planned.  Imagine being able to track a fish, or map underwater environments in 3D, or coordinate multiple ROV's using vision, or whatever you can imagine!  Please fork & play.  We'd love to see what you create.

License
-------

MIT License

Copyright (C) 2012 Bran Sorem, Simone Chiaretta, Dominik Fretz

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

