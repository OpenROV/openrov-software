README
======
These are a couple of script used to configure the UART and GPIO pins on the BeagleBone.

Its recomended that you check out this directory to:
<b>/home/rov/openrov/openrov-software/linux</b>
If you use another directory, you have to change the paths in: openrov_sudo


INSTALL
=======
To enable the node.js app to run these scripts you have to copy the file 'openrov_sudo' to /etc/sudoers.d and set the execute flag on the scripts:

     cp openrov_sudo /etc/sudoers.d/ 
     chmod +x *.sh


