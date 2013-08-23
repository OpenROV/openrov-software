
#ifndef __LIGHTS_H_
#define __LIGHTS_H_
#include <Arduino.h>
#include "Device.h"
#include "Pin.h"

class Lights : public Device {
  public:
    Lights():Device(){};
    void device_setup();
    void device_loop(Command cmd);
};
#endif
