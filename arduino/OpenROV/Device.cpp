#include "Device.h"
#include "Settings.h"

Device::Device(){
  DeviceManager::registerDevice(this);
}

void Device::device_loop(Command cmd){
  
}

void Device::device_setup(){
  
}

void DeviceManager::registerDevice(Device *device){
  devices[device_count] = device;
  device_count++;
}

void DeviceManager::doDeviceLoops(Command cmd){
  for(int i=0;i<device_count;i++) {
    int stime = millis();
    devices[i]->device_loop(cmd);
    int delta = millis()-stime;
    if (delta > 0){
      DeviceManager:device_loop_ms[i]+=delta;
    }
  }
}

void DeviceManager::doDeviceSetups(){
  for(int i=0;i<device_count;i++) {
    devices[i]->device_setup();
  }
}

void OutputNavData(){
    Serial.print(F("hdgd:"));
    Serial.print(navdata::HDGD);
    Serial.print(';');
    Serial.print(F("deap:"));
    Serial.print(navdata::DEAP);
    Serial.print(';');
    Serial.print(F("pitc:"));
    Serial.print(navdata::PITC);
    Serial.print(';');
    Serial.print(F("roll:"));
    Serial.print(navdata::ROLL);
    Serial.print(';');
    Serial.print(F("yaw:"));
    Serial.print(navdata::YAW);
    Serial.print(';');    
    Serial.print(F("fthr:"));
    Serial.print(navdata::FTHR);
    Serial.println(';');
}

void OutputSharedData(){

    Serial.print(F("motorAttached:"));
    Serial.print(thrusterdata::MATC);
    Serial.println(';');
    
    Serial.print(F("servo:"));
    Serial.print(cameraMountdata::CMNT);
    Serial.print(';');
    Serial.print(F("starg:"));
    Serial.print(cameraMountdata::CMTG);
    Serial.println(';');
    
    Serial.print(F("fmem:"));
    Serial.print(capedata::FMEM);
    Serial.print(';');
    Serial.print(F("vout:"));
    Serial.print(capedata::VOUT);
    Serial.print(';');    
    Serial.print(F("iout:"));
    Serial.print(capedata::IOUT);
    Serial.print(';');
    Serial.print(F("atmp:"));
    Serial.print(capedata::ATMP);
    Serial.print(';');
    Serial.print(F("ver:"));
    Serial.print(F("CUSTOM_BUILD"));
    Serial.print(';');
    Serial.print(F("cmpd:"));
    Serial.print( F(__DATE__));
    Serial.print( F(", "));
    Serial.print( F(__TIME__));
    Serial.print( F(", "));
    Serial.println( F(__VERSION__));  
    Serial.print(';');
    Serial.print(F("time:"));
    Serial.print(capedata::UTIM);
    Serial.println(';'); 
    
    Serial.print(F("pres:"));
    Serial.print(envdata::PRES);
    Serial.print(';');
    Serial.print(F("temp:"));
    Serial.print(envdata::TEMP);
    Serial.println(';'); 
 
    Serial.print(F("dlms:")); //device loop time in ms
    for(int i=0;i<DeviceManager::device_count;i++){
      Serial.print(i);
      Serial.print('|');
      Serial.print(DeviceManager::device_loop_ms[i]);
    }
    Serial.println(';');   
    
}

int DeviceManager::device_count = 0;
Device *DeviceManager::devices[MAX_DEVICES];
unsigned DeviceManager::device_loop_ms[MAX_DEVICES];

// Initialize all of the shared data types
double navdata::HDGD = 0;
float navdata::DEAP = 0;
float navdata::PITC = 0;
float navdata::ROLL = 0;
float navdata::FTHR = 0;
float navdata::YAW = 0;

float envdata::PRES = 0;
float envdata::TEMP = 0;

double capedata::FMEM = 0;
double capedata::VOUT = 0;
double capedata::IOUT = 0;
double capedata::ATMP = 0;
String capedata::VER = "";
double capedata::UTIM = 0;

boolean thrusterdata::MATC = true;

int cameraMountdata::CMNT = MIDPOINT;
int cameraMountdata::CMTG = MIDPOINT;

