#ifndef __MPU9150_H_
#define __MPU9150_H_
#include <Arduino.h>
#include "Device.h"

class MPU9150 : public Device {
  public:
    MPU9150():Device(){};
    void device_setup();
    void device_loop(Command cmd);
};
#endif