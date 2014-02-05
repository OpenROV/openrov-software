#include "AConfig.h"
#include <Arduino.h>
#include "Motors.h"
#include "Command.h"
#include "Device.h"
#include "Timer.h"
#include "Pin.h"
#include "Settings.h"
#include <avr/wdt.h> // watchdog timer
#include <EEPROM.h>

byte check = 0;

//Include the defined headers in the settings.h file for the different devices that may be wired in.  For
//devices that have pin numbers wired to a board they are added in the cape or controllerboard cpp file because
//we need the pin numbers.

Settings settings;


#if(HAS_STD_CAPE)
  #include "Cape.h"
  Cape cape;
#endif

#if(HAS_OROV_CONTROLLERBOARD_25)
  #include "controllerboard25.h"
  Controller25 controller;
#endif

#if(HAS_STD_LIGHTS)
  #include "Lights.h"
  Lights lights;
#endif

#if(HAS_STD_CALIBRATIONLASERS)
  #include "CalibrationLaser.h"
  CalibrationLaser calibrationLaser;
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

#if(HAS_MPU9150)
  #define COMPASS_ENABLED 1
  #define GYRO_ENABLED 1
  #define ACCELEROMETER_ENABLED 1
  #include "MPU9150.h"
  #include <Wire.h> //required to force the Arduino IDE to include the library in the path for the I2C code

  MPU9150 IMU;
#endif

#if(HAS_MS5803_14BA)
  #define DEAPTH_ENABLED 1
  #include "MS5803_14BA.h"
  #include <Wire.h> //required to force the Arduino IDE to include the library in the path for the I2C code
  #include <SPI.h> //required to force the Arduino IDE to include the library in the path for the SPI code
  MS5803_14BA DeapthSensor;
#endif


Command cmd;

volatile byte wdt_resets = 0; //watchdog resets

// IMPORTANT!
// array[0] will be the number of arguments in the command
int array[MAX_ARGS];
Timer Output1000ms;
Timer Output100ms;
int loops_per_sec;

/* sets the watchdog timer both interrupt and reset mode with an 8 second timeout */
void enableWatchdog()
{
  cli();
  MCUSR &= ~(1<<WDRF);
  wdt_reset();
  WDTCSR |= (1<<WDCE) | (1<<WDE);
  WDTCSR = (~(1<<WDP1) & ~(1<<WDP2)) | ((1<<WDE) | (1<<WDIE) | (1<<WDP3) | (1<<WDP0));
  sei();
}

/* disables the watchdog timer */
void disableWatchdog()
{
  cli();
  wdt_reset();
  MCUSR &= ~(1<<WDRF);
  WDTCSR |= (1<<WDCE) | (1<<WDE);
  WDTCSR = 0x00;
  sei();
}

void setup(){
  disableWatchdog();
  enableWatchdog();
  Serial.begin(115200);
  //watchdogOn();

  check = EEPROM.read(0);

  // if the watchdog triggered and the ISR completed, the first EEPROM byte will be a "1"
  if(check == 1)
  {
    wdt_resets = EEPROM.read(1);
    EEPROM.write(0,0); // reset byte so the EEPROM is not read on next startup
    Serial.println("log:Watchdog was triggered and the following was read from EEPROM;");
    Serial.print("log:");
    Serial.println(wdt_resets);
    Serial.print(';');
  }

  pinMode(13, OUTPUT);
  Output1000ms.reset();
  Output100ms.reset();

  DeviceManager::doDeviceSetups();
}


void loop(){
  wdt_reset();
  cmd.get();

  DeviceManager::doDeviceLoops(cmd);
  loops_per_sec++;
  if (Output1000ms.elapsed(1000)) {
    OutputSharedData();
    Serial.print(F("alps:"));
    Serial.print(loops_per_sec);
    Serial.println(';');
    loops_per_sec = 0;
  }
  if (Output100ms.elapsed(100)) {
    OutputNavData();
  }

}






/* this is called when the watchdog times out and before the reset */
ISR(WDT_vect)
{

  EEPROM.write(1, wdt_resets+1);    // write the random number to the second byte
  EEPROM.write(0,1);         // write a "1" to the first byte to indicate the data in second byte is valid and the ISR triggered properly
  while(true);               // triggers the second watchdog timeout for a reset
}




