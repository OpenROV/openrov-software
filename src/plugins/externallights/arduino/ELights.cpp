#include "../AConfig.h"
#ifndef HAS_EXT_LIGHTS
#define HAS_EXT_LIGHTS (1) //override by defining in the AConfig.h
#endif
#if(HAS_EXT_LIGHTS)
#include "../Device.h"
#include "../Pin.h"
#include "ELights.h"
#include "../Settings.h"
#include <Arduino.h>

Pin elight("elight", ELIGHTS_PIN, elight.analog, elight.out);

void ELights::device_setup(){
  Settings::capability_bitarray |= (1 << LIGHTS_CAPABLE);
  elight.reset();
  elight.write(0);
}



void ELights::device_loop(Command command){

    if( command.cmp("eligt")){
      int percentvalue = command.args[1]/100.0; //0 - 255
      int value = 255*percentvalue;
      elight.write(value);

      Serial.print(F("LIGTE:"));
      Serial.print(value);
      Serial.print(';');
      Serial.print(F("LIGPE:"));
      Serial.print(percentvalue);
      Serial.println(';');
    }
}
#endif
