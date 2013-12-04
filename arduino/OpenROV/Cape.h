
#ifndef __CAPE_H_
#define __CAPE_H_
#include <Arduino.h>
#include "Device.h"
#include "Pin.h"

#define LIGHTS_PIN 5
#define CAMERAMOUNT_PIN 3
#define CALIBRATIONLASERS_PIN 6
#define CAPE_VOLTAGE_PIN 0 
#define CAPE_CURRENT_PIN 3
#define PORT_PIN 9
#define VERTICLE_PIN 10
#define STARBORD_PIN 11

class Cape : public Device {
  private:

  public:
    Cape():Device(){};
    void device_setup();
    void device_loop(Command cmd);
};
#endif
