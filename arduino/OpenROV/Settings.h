
#ifndef __SETTINGS_H_
#define __SETTINGS_H_
#include <Arduino.h>
#include "Device.h"

// This section is for devices and their configuration
//Kit:
#define HAS_STD_LIGHTS (1)
#define LIGHTS_PIN 5
#define HAS_STD_CAPE (1)
#define HAS_STD_2X1_THRUSTERS (1)
#define HAS_STD_PILOT (1)
#define CAMERAMOUNT_PIN 3
#define CAPE_VOLTAGE_PIN 0 
#define CAPE_CURRENT_PIN 3

//After Market:
#define HAS_STD_CALIBRATIONLASERS (0)
#define CALIBRATIONLASERS_PIN 6
#define HAS_POLOLU_MINIMUV (1)


#define MIDPOINT 1500


class Settings : public Device {
  public:
    static int smoothingIncriment; //How aggressive the throttle changes
    static int deadZone_min;
    static int deadZone_max;
    static int capability_bitarray;
    
    Settings():Device(){};
    void device_setup();
    void device_loop(Command cmd);
};

#endif
