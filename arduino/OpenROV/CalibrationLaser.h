
#ifndef __CALIBRATIONLASER_H_
#define __CALIBRATIONLASER_H_
#include <Arduino.h>
#include "Device.h"
#include "Pin.h"

class CalibrationLaser : public Device {
  public:
    CalibrationLaser():Device(){};
    void device_setup();
    void device_loop(Command cmd);
};
#endif
