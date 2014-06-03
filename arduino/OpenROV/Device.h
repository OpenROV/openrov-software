
#ifndef __Device_H_
#define __Device_H_

#include "Command.h"

// If you have devices that add capabilities that should be advertised to the OpenROV Cockpit
// software add them here.  Check the bits on the server side for capabilities and gracefully
// degrade (remove UI elements) if the capabilities do not exist.
#define LIGHTS_CAPABLE 1
#define CALIBRATION_LASERS_CAPABLE 2
#define CAMERA_MOUNT_1_AXIS_CAPABLE 3
#define COMPASS_CAPABLE 4
#define ORIENTATION_CAPABLE 5
#define DEAPTH_CAPABLE 6



#define MAX_DEVICES 10
// Be sure to initialize any storage variables added to these shared data classes in the device.cpp file.
// These shared storage classes are always available and should be device independent.  Data that is
// unque to a particular implimenatation of a device (for example details related to a 3 thruster configuration vs
// a 4 thruster configuration should be handled directly within that devices code as other devices will not
// know to look for those details unless explicitly coded for them.

class navdata{
  public:
    static double HDGD; //Compass heading in degrees
    static float DEAP; //Depth in meters
    static float ROLL; //Roll in degrees
    static float PITC; //Pitch in degrees
    static float YAW; //Yaw in degrees
    static float FTHR; //% of power in forward thrust
};

class envdata{
  public:
    static float PRES; //Pressure in millibars
    static float TEMP; //Temperature in C
};

class capedata{
  public:
    static double FMEM; //Free memory on the Arduino in bytes
    static double VOUT; //Voltage as meassed at the cape in milli-volts
    static double IOUT; //Current measured in to the cape in milli-amps.
    static double ATMP; //Arduino internal temp in Cellcius (should not get above ~86)
    static String VER;  //version number of the OpenRov firmware
    static double UTIM; //up-time since Arduino was started in milliseconds
};

class thrusterdata{
  public:
    static boolean MATC; //Motors on-line indicator

};

class cameraMountdata{
  public:
    static int CMNT; //Camera Mount X Rotation in milliseconds
    static int CMTG; //Camera Mount X Target Rotation in milliseconds
};


class Device {
    
  private:
    String name;
    
//    publishCommand(Command cmd);


  public:
    int ID;
    Device();
    virtual void device_setup();
    virtual void device_loop(Command cmd); //and ignore or do other auxillary work as needed if the cmd does not apply.
    
};

class DeviceManager
{
  private:  
    static Device *devices[MAX_DEVICES];

  
  public:
    static unsigned device_loop_ms[MAX_DEVICES];
    static int device_count;
    static void registerDevice(Device *device);
    static void doDeviceLoops(Command command);
    static void doDeviceSetups();

};

void OutputSharedData();
void OutputNavData();

#endif
