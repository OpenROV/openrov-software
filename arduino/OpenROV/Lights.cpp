#include "Device.h"
#include "Pin.h"
#include "Lights.h"
#include "Settings.h"

static Pin light("light", LIGHTS_PIN, light.analog, light.out);

void Lights::device_setup(){
  Settings::capability_bitarray |= (1 << LIGHTS_CAPABLE);
  light.write(0);
}

void Lights::device_loop(Command command){

    if( command.cmp("light")){
      Serial.print("log:light1;");
      int value = command.args[1];
      Serial.print("log:light2;");
      light.write(value);
    }  
}




