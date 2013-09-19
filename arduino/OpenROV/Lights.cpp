#include "AConfig.h"
#if(HAS_STD_LIGHTS)
#include "Device.h"
#include "Pin.h"
#include "Lights.h"
#include "Settings.h"
#include <Arduino.h>

//Pin light("light", LIGHTS_PIN, light.analog, light.out);

void Lights::device_setup(){
  Settings::capability_bitarray |= (1 << LIGHTS_CAPABLE);
  //light.reset();
  //light.write(0);
  pinMode(LIGHTS_PIN, OUTPUT); 
}

void Lights::device_loop(Command command){

    if( command.cmp("light")){
      int value = command.args[1];
      //light.write(value);
      analogWrite(LIGHTS_PIN, value);
    }  
}
#endif



