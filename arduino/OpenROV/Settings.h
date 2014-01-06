
#ifndef __SETTINGS_H_
#define __SETTINGS_H_
#include "AConfig.h"
#include <Arduino.h>
#include "Device.h"

#define MIDPOINT 1500
#define LOGGING (1)


class Settings : public Device {
  public:
    static int smoothingIncriment; //How aggressive the throttle changes
    static int deadZone_min;
    static int deadZone_max;
    static int capability_bitarray;
    static bool water_type;
    
    Settings():Device(){};
    void device_setup();
    void device_loop(Command cmd);
    void scan_i2c();
};

#endif
