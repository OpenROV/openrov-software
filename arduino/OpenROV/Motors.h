#ifndef __MOTORS_H_
#define __MOTORS_H_

#include <Servo.h>

#define MIDPOINT 1500

class Motors {
  private:
    Servo port, vertical, starbord;
    int port_pin, vertical_pin, starbord_pin;
    
  public:
  
    Motors(int p_pin, int v_pin, int s_pin);
    void reset();
    void go(int p, int v, int s);
    void stop();
    
};

#endif
