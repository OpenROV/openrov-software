#include "Device.h"
#include "Settings.h"
#include <Wire.h>

int Settings::capability_bitarray = 0;
int Settings::smoothingIncriment = 5; //How aggressive the throttle changes
int Settings::deadZone_min = MIDPOINT;
int Settings::deadZone_max = MIDPOINT;
bool Settings::water_type = 0; //Freshwater


void Settings::device_setup(){
Wire.begin();
}

void Settings::device_loop(Command command){
    if (command.cmp("reportSetting")) {
      Serial.print(F("*settings:"));
      Serial.print(F("smoothingIncriment|"));
      Serial.print(String(Settings::smoothingIncriment) + ",");
      Serial.print(F("deadZone_min|"));
      Serial.print(String(Settings::deadZone_min) + ",");
      Serial.print(F("deadZone_max|"));
      Serial.print(String(Settings::deadZone_max) + ";");
      Serial.print(F("water_type"));
      Serial.println(String(Settings::water_type) + ";");
      
    }
    else if (command.cmp("rcap")){ //report capabilities
      Serial.print(F("CAPA:"));
      Serial.print(capability_bitarray);
      Serial.print(';');
      scan_i2c();
    }
    else if (command.cmp("updateSetting")) {
      Settings::smoothingIncriment = command.args[1];
      Settings::deadZone_min = command.args[2];
      Settings::deadZone_max = command.args[3];
      Settings::water_type = command.args[4];
    }      

}

void Settings::scan_i2c(){
  byte error, address;
  int nDevices;

  Serial.println(F("log:Scanning...;"));

  nDevices = 0;
  for(address = 1; address < 127; address++ ) 
  {
    // The i2c_scanner uses the return value of
    // the Write.endTransmisstion to see if
    // a device did acknowledge to the address.
    Wire.beginTransmission(address);
    error = Wire.endTransmission();

    if (error == 0)
    {
      Serial.print(F("log:I2C device found at address 0x"));
      if (address<16) 
        Serial.print("0");
      Serial.print(address,HEX);
      Serial.println("  !;");

      nDevices++;
    }
    else if (error==4) 
    {
      Serial.print(F("log:Unknow error at address 0x"));
      if (address<16) 
        Serial.print("0");
      Serial.print(address,HEX);
      Serial.println(";");
    }    
  }
  if (nDevices == 0)
    Serial.println(F("log:No I2C devices found\n;"));
  else
    Serial.println(F("log:done\n;"));

  delay(5000);           // wait 5 seconds for next scan
    
}



