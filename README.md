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
- Ubuntu 12.04 for BeagleBone:  [http://elinux.org/BeagleBoardUbuntu#Demo_Image](http://elinux.org/BeagleBoardUbuntu#Demo_Image)
- OpenCV 2.4:  [http://opencv.willowgarage.com/](http://opencv.willowgarage.com/)
- Node.js (v0.8.1):  [http://nodejs.org/](http://nodejs.org/)
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
    (change to openrov)
    vi /etc/hosts
    (change to openrov)
    reboot


Step 3
------

Update/upgrade software and install rerequisits:

    sudo apt-get update
    sudo apt-get install g++ curl cmake pkg-config libv4l-dev libjpeg-dev git build-essential subversion libssl-dev vim


Step 4
------

Install nvm (Node Version Manager):

    git clone git://github.com/creationix/nvm.git ~/.nvm
    echo ". ~/.nvm/nvm.sh" >> .bashrc
    echo "export LD_LIBRARY_PATH=/usr/local/lib" >> .bashrc
    echo "export PATH=$PATH:/opt/node/bin" >> .bashrc


Step 5
------

Try to install Node.js (it will not compile V8 properly):

    nvm install v0.8.1


Step 6
------

Fix V8 to compile (very sketchy right now):

==================================

Find this file for editing:
    ~/.nvm/src/node-v0.8.1/deps/v8/src/platform-linux.cc

Make these changes (from red to green):
    http://code.google.com/p/v8/source/diff?spec=svn11951&r=11951&format=side&path=/branches/bleeding_edge/src/platform-linux.cc


comment out lines 1230...

    /*
    #ifdef __arm__
      // When running on ARM hardware check that the EABI used by V8 and
      // by the C code is the same.
      bool hard_float = OS::ArmUsingHardFloat();
      if (hard_float) {
    #if !USE_EABI_HARDFLOAT
        PrintF("ERROR: Binary compiled with -mfloat-abi=hard but without "
               "-DUSE_EABI_HARDFLOAT\n");
        exit(1);
    #endif
      } else {
    #if USE_EABI_HARDFLOAT
        PrintF("ERROR: Binary not compiled with -mfloat-abi=hard but with "
               "-DUSE_EABI_HARDFLOAT\n");
        exit(1);
    #endif
      }
    #endif
    */
      SignalSender::SetUp();
    }

This is a very bad idea, but it works for now.  Bleeding edge can make you bleed sometimes.

==================================


Step 7
------

Actually install Node.js:

    ./configure
    make
    sudo make install

    echo "nvm use v0.8.1" >> .bashrc


Step 8
------

Install OpenCV:

Download OpenCV:
    svn co http://code.opencv.org/svn/opencv/trunk/opencv

Prepare OpenCV for make:
    cd opencv
    mkdir release && cd release

Build OpenCV:
    cmake -D CMAKE_BUILD_TYPE=RELEASE -D CMAKE_INSTALL_PREFIX=/usr/local -D BUILD_TESTS=OFF -D BUILD_EXAMPLES=ON ..

Make and install OpenCV:
    make && sudo make install


Step 9
------

Download OpenROV ROVision:

    cd ~
    git clone git://github.com/OpenROV/openrov-software.git
    cd openrov-software/

edit ~/.bashrc

    export LD_LIBRARY_PATH=/usr/local/lib


Step 10
-------

Fix SSL errors and download required Node.js modules:

Fix SSL (just don't use secure connection...):
    npm config set registry http://registry.npmjs.org/

Download modules:
    npm install express socket.io serialport


Step 11
-------

Compile the capture C++ file:
    cd src/
    g++ capture.cpp -o capture `pkg-config opencv --cflags --libs`


Step 12
-------

Try it out!

    NODE_ENV=production node app.js

Future
------

Wwe have so much more planned.  Imagine being able to track a fish, or map underwater environments in 3D, or coordinate multiple ROV's using vision, or whatever you can imagine!  Please fork & play.  We'd love to see what you create.

License
-------

This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License. To view a copy of this license, visit <http://creativecommons.org/licenses/by-sa/3.0/> or send a letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

*Some portions of code may be subject to different licensing agreements.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
