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

void Motors::goport(int p){
  port.writeMicroseconds(p);  
}

void Motors::govertical(int v){
  vertical.writeMicroseconds(v);  
}

void Motors::gostarbord(int s){
  starbord.writeMicroseconds(s);  
}

void Motors::stop(){
  port.writeMicroseconds(MIDPOINT);
  vertical.writeMicroseconds(MIDPOINT);
  starbord.writeMicroseconds(MIDPOINT);
  port.detach();
  vertical.detach();
  starbord.detach();
}

bool Motors::attached(){
  return port.attached() || vertical.attached() || starbord.attached();
}
