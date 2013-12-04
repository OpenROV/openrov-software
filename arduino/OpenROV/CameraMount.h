
#ifndef __CAMERAMOUNT_H_
#define __CAMERAMOUNT_H_
#include "AConfig.h"
#include <Arduino.h>
#include "Device.h"
#include "Pin.h"

#define MIDPOINT 1500
//This must be defined with the right pin. It is set in the cape and controlboard header files.
//#define CAMERAMOUNT_PIN 3
#if(HAS_STD_CAPE)
  #include "Cape.h"
#endif

#if(HAS_OROV_CONTROLLERBOARD_25)
  #include "controllerboard25.h"
#endif

class CameraMount : public Device {
  public:
    CameraMount():Device(){};
    void device_setup();
    void device_loop(Command cmd);
};
#endif
