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
  goport(p);
  govertical(v);
  gostarbord(s);
}

void Motors::goport(int p){
  int modifier = 1;
  if (p>MIDPOINT) modifier = motor_positive_modifer[port_motor];
  if (p<MIDPOINT) modifier = motor_negative_modifer[port_motor];
  int delta = p-MIDPOINT;
  port.writeMicroseconds(MIDPOINT+delta*modifier);

}

void Motors::govertical(int v){
  int modifier = 1;  
  if (v>MIDPOINT) modifier = motor_positive_modifer[vertical_motor];
  if (v<MIDPOINT) modifier = motor_negative_modifer[vertical_motor];
  int delta = v-MIDPOINT;
  vertical.writeMicroseconds(MIDPOINT+delta*modifier); 
}

void Motors::gostarbord(int s){
  int modifier = 1;  
  if (s>MIDPOINT) modifier = motor_positive_modifer[starbord_motor];
  if (s<MIDPOINT) modifier = motor_negative_modifer[starbord_motor];  
  int delta = s-MIDPOINT;
  starbord.writeMicroseconds(MIDPOINT+delta*modifier); 
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

    //hard coded to reverse the starbord motor assuming we are using the reverse prop.
    //need to tunnel configuration down to this level, possibly store in eeprom.
    float Motors::motor_positive_modifer[3] = {-1.0,1.0,-1.0};
    float Motors::motor_negative_modifer[3] = {-2.0,2.0,-2.0};
