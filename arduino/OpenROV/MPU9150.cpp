#include "MPU9150.h"
#include "AConfig.h"
#if(HAS_MPU9150)
#include "Device.h"
#include "Settings.h"
#include <Wire.h>
//#include "I2Cdev.h"
#include "MPU9150Lib.h"
//#include "CalLib.h"
//#include "dmpKey.h"
//#include "dmpmap.h"
//#include "inv_mpu.h"
//#include "inv_mpu_dmp_motion_driver.h"
#include <EEPROM.h>

MPU9150Lib MPU;                                              // the MPU object

//  MPU_UPDATE_RATE defines the rate (in Hz) at which the MPU updates the sensor data and DMP output

#define MPU_UPDATE_RATE  (10)

void MPU9150::device_setup(){
  //Todo: Read calibration values from EPROM
  Wire.begin();
  MPU.selectDevice(1);
  MPU.init(MPU_UPDATE_RATE);                             // start the MPU
  Settings::capability_bitarray |= (1 << COMPASS_CAPABLE);
  Settings::capability_bitarray |= (1 << ORIENTATION_CAPABLE);
}

void MPU9150::device_loop(Command command){
  if (command.cmp("ccal")){
   // Compass_Calibrate();
    //Todo: Write calibrated values to EPROM
  }
  else if (command.cmp("i2cscan")){
   // scan();
  }
    MPU.read();
    navdata::HDGD = MPU.m_fusedEulerPose[VEC3_Z] * RAD_TO_DEGREE + 180;  //need to confirm
    navdata::PITC = MPU.m_fusedEulerPose[VEC3_X] * RAD_TO_DEGREE;
    navdata::ROLL = MPU.m_fusedEulerPose[VEC3_Y] * RAD_TO_DEGREE;
    navdata::YAW = MPU.m_fusedEulerPose[VEC3_Z] * RAD_TO_DEGREE;
}
#endif
