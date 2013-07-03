#include "Device.h"
#include "Settings.h"

int Settings::capability_bitarray = 0;
int Settings::smoothingIncriment = 5; //How aggressive the throttle changes
int Settings::deadZone_min = MIDPOINT;
int Settings::deadZone_max = MIDPOINT;


void Settings::device_setup(){

}

void Settings::device_loop(Command command){
    if (command.cmp("reportSetting")) {
      Serial.print(F("*settings:"));
      Serial.print(F("smoothingIncriment|"));
      Serial.print(String(smoothingIncriment) + ";");
      Serial.print(F("deadZone_min|"));
      Serial.print(String(deadZone_min) + ";");
      Serial.print(F("deadZone_max|"));
      Serial.println(String(deadZone_max) + ";");
    }
    else if (command.cmp("rcap")){ //report capabilities
      Serial.print(F("CAPA:"));
      Serial.print(capability_bitarray);
      Serial.print(';');
    }
    else if (command.cmp("updateSetting")) {
      int *array = command.args();
      smoothingIncriment = array[1];
      deadZone_min = array[2];
      deadZone_max = array[3];
    }      

}




