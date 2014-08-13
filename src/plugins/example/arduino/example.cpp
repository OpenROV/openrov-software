#include "../Device.h"
#include "example.h"
#include <Arduino.h>

void Example::device_setup(){
}



void Example::device_loop(Command command){

    if( command.cmp("ligt")){
      int value = command.args[1]; //0 - 255
      
      Serial.print(F("ExamplePlugin:"));
      if (value == 0) { Serial.print("Example"); }
      else { Serial.print("EXAMPLE"); }
      Serial.print(';');
    }  
}
