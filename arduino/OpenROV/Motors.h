#ifndef __MOTORS_H_
#define __MOTORS_H_

#include "openrov_servo.h"
#include <Arduino.h>
#define MIDPOINT 1500
#define port_motor 0
#define vertical_motor 1
#define starbord_motor 2

class Motors {
  private:
    Servo port, vertical, starbord;
    int port_pin, vertical_pin, starbord_pin;
    
  public:
  
    Motors(int p_pin, int v_pin, int s_pin);
    void goport(int p);
    void govertical(int v);
    void gostarbord(int s);
    void reset();
    void go(int p, int v, int s);
    void stop();
    bool attached();
    static float motor_positive_modifer[3];
    static float motor_negative_modifer[3];
};

#endif
