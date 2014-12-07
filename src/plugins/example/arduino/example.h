
#ifndef __EXAMPLE_H_
#define __EXAMPLE_H_
#include <Arduino.h>
#include "../Device.h"

class Example: public Device {
  public:
    Example():Device(){};
    void device_setup();
    void device_loop(Command cmd);
};
#endif
