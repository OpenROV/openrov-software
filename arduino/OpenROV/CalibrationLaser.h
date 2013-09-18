
#ifndef __CALIBRATIONLASER_H_
#define __CALIBRATIONLASER_H_
#include "AConfig.h"
#include <Arduino.h>
#include "Device.h"
#include "Pin.h"

//This must be defined with the right pin. It is set in the cape and controlboard header files.
//#define CALIBRATIONLASERS_PIN 6
#if(HAS_STD_CAPE)
  #include "Cape.h"
#endif

#if(HAS_OROV_CONTROLLERBOARD_25)
  #include "controllerboard25.h"
#endif

class CalibrationLaser : public Device {
  public:
    CalibrationLaser():Device(){};
    void device_setup();
    void device_loop(Command cmd);
};
#endif
