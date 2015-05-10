
#ifndef __AuxServo_H_
#define __AuxServo_H_
#include <Arduino.h>
#include "../Device.h"

class AuxServo: public Device {
  public:
    AuxServo():Device(){};
    void device_setup();
    void device_loop(Command cmd);
    
  private:
  	int tilt_val = 1500;
    int new_tilt = 1500;
    const int tiltrate = 1;
    void tiltServo(long milliseconds);
	  int smoothAdjustedCameraPosition(int target, int current);
};
#endif
