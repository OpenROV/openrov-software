
#ifndef __CAPE_H_
#define __CAPE_H_
#include <Arduino.h>
#include "Device.h"
#include "Pin.h"

class Cape : public Device {
  public:
    Cape():Device(){};
    void device_setup();
    void device_loop(Command cmd);
};
#endif
