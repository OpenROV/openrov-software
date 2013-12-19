#include "AConfig.h"
#if(HAS_STD_LIGHTS)
#include "Device.h"
#include "Pin.h"
#include "Lights.h"
#include "Settings.h"
#include <Arduino.h>

Pin light("light", LIGHTS_PIN, light.analog, light.out);

void Lights::device_setup(){
  Settings::capability_bitarray |= (1 << LIGHTS_CAPABLE);
  light.reset();
  light.write(0);
}



void Lights::device_loop(Command command){

    if( command.cmp("ligt")){
      int value = command.args[1]; //0 - 255
      light.write(value);
      
      Serial.print(F("LIGT:"));
      Serial.print(value);
      Serial.print(';');
      Serial.print(F("LIGP:"));
      Serial.print(command.args[1]/255.0);
      Serial.println(';');       
    }  
}
#endif



