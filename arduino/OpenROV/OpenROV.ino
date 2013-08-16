#include <Servo.h>
#include <Arduino.h>
#include "Motors.h"
#include "Command.h"
#include "Device.h"
#include "Timer.h"
#include "Pin.h"
#include "Settings.h"
#include <avr/wdt.h> // watchdog timer

//Include the defined headers in the settings.h file for the different devices that may be wired in.
Settings settings;

#if(HAS_STD_LIGHTS)
  #include "Lights.h"
  Lights lights;
#endif

#if(HAS_STD_CALIBRATIONLASERS)
  #include "CalibrationLaser.h"
  CalibrationLaser calibrationLaser;
#endif

#if(HAS_STD_CAPE)
  #include "Cape.h"
  Cape cape;
#endif

#if(HAS_STD_2X1_THRUSTERS)
  #include "Thrusters2X1.h"
  Thrusters thrusters;
#endif

#if(HAS_STD_PILOT)
  #include "Pilot.h"
  Pilot pilot;
#endif

#if(HAS_STD_CAMERAMOUNT)
  #include "CameraMount.h"
  CameraMount cameramount;
#endif

#if(HAS_POLOLU_MINIMUV)
  #define COMPASS_ENABLED 1
  #define GYRO_ENABLED 1
  #define ACCELEROMETER_ENABLED 1
  #include "MinIMU9.h"
  #include <Wire.h> //required to force the Arduino IDE to include the library in the path for the I2C code
  MinIMU9 IMU;
#endif


Command cmd;

volatile int wdt_resets = 0; //watchdog resets

// IMPORTANT!
// array[0] will be the number of arguments in the command
int array[MAX_ARGS]; 
Timer Output1000ms;
int loops_per_sec;

void setup(){

  Serial.begin(115200);
  pinMode(13, OUTPUT);
  Output1000ms.reset();
  //Todo: Add code to enable the watchdog timer for 5 seconds or so.
  
  DeviceManager::doDeviceSetups();
  //watchdogOn();
  wdt_enable(WDTO_8S);
}


void loop(){
  wdt_reset();
  cmd.cmd = "";
  if (Serial.available()) {
    //Todo: Add code to tap a watchdog timer here. If we loose connection with the beagle bone the system will reset causing motors to go back to idle
  
    // blocks output data... TODO: need a way of calculating frequency for device data
    // delay(30);
    // Get command from serial buffer
    cmd.get();
  }
  
  DeviceManager::doDeviceLoops(cmd);
  loops_per_sec++;
  if (Output1000ms.elapsed(1000)) {
    OutputSharedData(); 
    Serial.print(F("alps:"));
    Serial.print(loops_per_sec);
    Serial.println(';');
    loops_per_sec = 0;
    Serial.print(F("log:WatchDogResets|"));
    Serial.print(wdt_resets);
    Serial.println(';');    
  }
  
}

void watchdogOn() {
  
// Clear the reset flag, the WDRF bit (bit 3) of MCUSR.
MCUSR = MCUSR & B11110111;
  
// Set the WDCE bit (bit 4) and the WDE bit (bit 3) 
// of WDTCSR. The WDCE bit must be set in order to 
// change WDE or the watchdog prescalers. Setting the 
// WDCE bit will allow updtaes to the prescalers and 
// WDE for 4 clock cycles then it will be reset by 
// hardware.
WDTCSR = WDTCSR | B00011000; 

// Set the watchdog timeout prescaler value to 1024 K 
// which will yeild a time-out interval of about 8.0 s.
WDTCSR = B00100001;

// Enable the watchdog timer interupt.
WDTCSR = WDTCSR | B01000000;
MCUSR = MCUSR & B11110111;

}

ISR(WDT_vect)
{
  wdt_resets++;  
}
