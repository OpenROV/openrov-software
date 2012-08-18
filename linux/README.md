README
======
These are a couple of script used to configure the UART and GPIO pins on the BeagleBone.


INSTALL
=======
To enable the node.js app to run these scripts you have to copy the file 'openrov_sudo' to /etc/sudoers.d and set the execute flag on the scripts:

     cp openrov_sudo /etc/sudoers.d/ 
     chmod +x *.sh
