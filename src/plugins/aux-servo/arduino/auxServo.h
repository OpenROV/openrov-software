
#ifndef __AuxServo_H_
#define __AuxServo_H_
#include <Arduino.h>
#include "../Device.h"

class AuxServo: public Device {
  public:
    AuxServo():Device(){};
    void device_setup();
    void device_loop(Command cmd);
};
#endif
