#ifndef __CONTROLLER25_H_
#define __CONTROLLER25_H_
#include <Arduino.h>
#include "Device.h"
#include "Pin.h"

#define LIGHTS_PIN 44
#define CAMERAMOUNT_PIN 11
#define CALIBRATIONLASERS_PIN 45
#define PORT_PIN 6
#define VERTICLE_PIN 7
#define STARBORD_PIN 8
#define ESCPOWER_PIN 16
class Controller25 : public Device {
  private:

  public:
    Controller25():Device(){};
    void device_setup();
    void device_loop(Command cmd);
};
#endif
