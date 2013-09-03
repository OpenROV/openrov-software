
#ifndef __MINIUM9_H_
#define __MINIUM9_H_
#include <Arduino.h>
#include "Device.h"

class MinIMU9 : public Device {
  public:
    MinIMU9():Device(){};
    void device_setup();
    void device_loop(Command cmd);
};
#endif
