
#ifndef __CAMERAMOUNT_H_
#define __CAMERAMOUNT_H_
#include <Arduino.h>
#include "Device.h"
#include "Pin.h"

#define MIDPOINT 1500

class CameraMount : public Device {
  public:
    CameraMount():Device(){};
    void device_setup();
    void device_loop(Command cmd);
};
#endif
