#if(HAS_STD_2X1_THRUSTERS)
#ifndef __THRUSTERS_H_
#define __THRUSTERS_H_
#include <Arduino.h>
#include "Device.h"
#include "Pin.h"

#define MOTOR_NEUTRAL = 1500
#define MOTOR_COUNT = 3

#if(HAS_STD_CAPE)
  #include "Cape.h"
#endif

#if(HAS_OROV_CONTROLLERBOARD_25)
  #include "controllerboard25.h"
#endif

class Thrusters : public Device {
  public:
    Thrusters():Device(){};
    void device_setup();
    void device_loop(Command cmd);
};
#endif
#endif