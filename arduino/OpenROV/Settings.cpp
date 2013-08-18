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
      Serial.print(String(Settings::smoothingIncriment) + ",");
      Serial.print(F("deadZone_min|"));
      Serial.print(String(Settings::deadZone_min) + ",");
      Serial.print(F("deadZone_max|"));
      Serial.println(String(Settings::deadZone_max) + ";");
    }
    else if (command.cmp("rcap")){ //report capabilities
      Serial.print(F("CAPA:"));
      Serial.print(capability_bitarray);
      Serial.print(';');
    }
    else if (command.cmp("updateSetting")) {
      Settings::smoothingIncriment = command.args[1];
      Settings::deadZone_min = command.args[2];
      Settings::deadZone_max = command.args[3];
    }      

}




