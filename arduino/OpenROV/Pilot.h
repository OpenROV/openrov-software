
#ifndef __PILOT_H_
#define __PILOT_H_
#include <Arduino.h>
#include "Device.h"
#include "Pin.h"

#define DISABLED F("DISABLED")

class Pilot : public Device {
  public:
    Pilot():Device(){};
    void device_setup();
    void device_loop(Command cmd);
};
#endif
