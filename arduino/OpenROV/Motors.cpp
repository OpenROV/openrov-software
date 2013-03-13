#include "Motors.h"

Motors::Motors(int p_pin, int v_pin, int s_pin){
  port_pin = p_pin;
  vertical_pin = v_pin;
  starbord_pin = s_pin;
}

void Motors::reset(){
  port.attach(port_pin);
  vertical.attach(vertical_pin);
  starbord.attach(starbord_pin);
}

void Motors::go(int p, int v, int s){
  port.writeMicroseconds(p);
  vertical.writeMicroseconds(v);
  starbord.writeMicroseconds(s);
}

void Motors::stop(){
  port.write(MIDPOINT);
  vertical.write(MIDPOINT);
  starbord.write(MIDPOINT);
}
