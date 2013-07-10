The Arduino code
================

This code is intended to be the repository of all modifications possible for the OpenROV Arduino code.  As the community adds sensors and new behaviors we ask that the submit those back to this project via pull requests so that we can integrate them in to the updates that all OpenROV Cockpit code users recieve.  

This code is configured be default to enable the components that ship on the OpenROV KIT versions 2 - 2.4.  You enable or disable the components in the settings.h file. You will need to re-upload the Arduino firmware after making this change.

<table border=1>
    <tr>
        <th>Component</th><th>Default</th><th>Description</th>        
    </tr>
    <tr>
        <td>Pilot</td><td>On</td><td>Place holder for fly by wire type behavior</td>        
    </tr>
    <tr>
        <td>CalibrationLasers</td><td>Off</td><td>If you add a couple lasers that fire in parallel this module will control them.</td>        
    </tr>
    <tr>
        <td>CameraMount</td><td>On</td><td>Basic vertical tilt for moving the camera</td>        
    </tr>
    <tr>
        <td>Cape</td><td>On</td><td>Emits all of the sensor data regarding the ATMEGA328 and the OpenROV cape.</td>        
    </tr>
    <tr>
        <td>Lights</td><td>On</td><td>Controls the lights on the ROV</td>        
    </tr>
    <tr>
        <td>Thrusters2X1</td><td>On</td><td>For controlling the motors in a Port/Vertical/Starboard configuration.</td>        
    </tr>    
    <tr>
        <td>MiniIMU</td><td>Off</td><td>The Pololu IMU (http://www.pololu.com/catalog/product/1268) for compass and orientation.</td>        
    </tr>
</table>



Adding Sensors and Devices
--------------------------

The code is laid out to enable easy addition of sensors or custom modules.  You can enable or disable the modules by editting the settings.h file and changing the #define "Module Name" from a zero to a one.

The diagram below shows all of the current modules along with the commands they are ready to receive and the data they update or send.

![Component Brakout](http://yuml.me/291bafca "Major areas of the Arduino code")[edit](http://yuml.me/edit/291bafca)

If you want to add your own module you need to:

- [ ] Copy the light.h and light.cpp files and rename for your module
- [ ] Take the sketch that has the sensor working and cut and paste it in to the renamed light.h and light.cpp files.  Move the setup() to device_setup() and the loop() to device_loop() code.  If you have additional libraries, put them all in the root foler but prefix the library file names with the name of your device.
- [ ] replace the #define at the top of the .h file with a new name that represents your device
- [ ] update the include of the light.h with your device name.h in the .cpp file
- [ ] In the OpenRov.ino file, add a #ifdef section for your device along side the other devices.
- [ ] Update the enumeration of #ifdef devices in the settings.h file
 
Please note that the ATMega328 has a max of 32K for loading code.  If you enable to many devices you can exceed that number and the code will fail to upload.  You can use the Arduino IDE and do a verify to check the size of the sketch.
