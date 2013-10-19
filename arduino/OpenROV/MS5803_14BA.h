
#ifndef __MS5803_14BA_H_
#define __MS5803_14BA_H_
#include <Arduino.h>
#include "Device.h"

class MS5803_14BA : public Device {
  public:
    MS5803_14BA():Device(){};
    void device_setup();
    void device_loop(Command cmd);
};

#endif
