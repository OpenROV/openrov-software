The Arduino code
================

This code is intended to be the repository of all modifications possible for the OpenROV Arduino code.  As the community adds sensors and new behaviors we ask that the submit those back to this project via pull requests so that we can integrate them in to the updates that all OpenROV Cockpit code users recieve.  

This code is configured be default to enable the components that ship on the OpenROV KIT versions 2 - 2.4.  You enable or disable the components in the settings.h file. You will need to re-upload the Arduino firmware after making this change.

<table border=1>
    <tr>
        <th>Component</th><th>Default</th><th>Description</th><th>Size</th><th>Memory Used</th>       
    </tr>
    <tr>
        <td>Pilot</td>
        <td>On</td>
        <td>Place holder for fly by wire type behavior</td>
        <td>58b</td>
        <td>tbd</td>        
    </tr>
    <tr>
        <td>CalibrationLasers</td>
        <td>Off</td>
        <td>If you add a couple lasers that fire in parallel this module will control them.</td>
        <td>460b</td>
        <td>tbd</td>            
    </tr>
    <tr>
        <td>CameraMount</td>
        <td>On</td>
        <td>Basic vertical tilt for moving the camera</td>
        <td>1,034b</td>
        <td>tbd</td>       
    </tr>
    <tr>
        <td>Cape</td>
        <td>On</td>
        <td>Emits all of the sensor data regarding the ATMEGA328 and the OpenROV cape.</td>
        <td>970b</td>
        <td>tbd</td>            
    </tr>
    <tr>
        <td>Lights</td>
        <td>On</td>
        <td>Controls the lights on the ROV</td>
        <td>460b</td>
        <td>tbd</td>            
    </tr>
    <tr>
        <td>Thrusters2X1</td>
        <td>On</td>
        <td>For controlling the motors in a Port/Vertical/Starboard configuration.</td>
        <td>2,314b</td>
        <td>tbd</td>            
    </tr>    
    <tr>
        <td>MiniIMU</td>
        <td>Off</td>
        <td>The Pololu IMU (http://www.pololu.com/catalog/product/1268) for compass and orientation.</td>
        <td>10,122b</td>
        <td>tbd</td>            
    </tr>
</table>
OpenROV Arduino cade base sketch size with zero components enabled: 13,524b


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
- [ ] Update the enumeration of #ifdef devices in the AConfig.h file

If your module requires multiple sub-modules, use a naming convention that groups your files togther in the directory. Do not use subdirectories as that prevents the Aurdino IDE from being able to load the project.

Be sure to use SI units everywhere to make it easy for modules to share data. The following table are the suggestions from the ada-fruit standard sensor project which looks like a good guide to follow:

Standardised SI Units for Sensor DataA key part of the unified sensor driver system layer is the standardisation of values on SI units of a particular scale. This following SI units and scales are used for the appropriate sensor type:
--------------------------

- acceleration: values are in meter per second per second (m/s^2)
- magnetic: values are in micro-Tesla (uT)
- orientation: values are in degrees
- gyro: values are in rad/s
- temperature: values in degrees centigrade (Celsius)
- distance: values are in centimeters
- light: values are in SI lux units
- pressure: values are in hectopascal (hPa)
- relative_humidity: values are in percent
- current: values are in milliamps (mA)
- voltage: values are in volts (V)
- color: values are in 0..1.0 RGB channel luminosity and 32-bit RGBA format
 
Please note that the ATMega328 has a max of 32K for loading code.  If you enable to many devices you can exceed that number and the code will fail to upload.  You can use the Arduino IDE and do a verify to check the size of the sketch.
