#include "MPU9150.h"
#include "AConfig.h"
#if(HAS_MPU9150)
#include "Device.h"
#include "Settings.h"
#include <Wire.h>
//#include "I2Cdev.h"
#include "MPU9150Lib.h"
#include "CalLib.h"
//#include "dmpKey.h"
//#include "dmpmap.h"
//#include "inv_mpu.h"
//#include "inv_mpu_dmp_motion_driver.h"
#include <EEPROM.h>
#include "Timer.h"

MPU9150Lib MPU;                                              // the MPU object
int MPUDeviceId = 1;
boolean DidInit = false;
boolean InCallibrationMode = false;
Timer MPU9150ReInit;
CALLIB_DATA calData;
Timer calibration_timer;
int counter = 0;
//  MPU_UPDATE_RATE defines the rate (in Hz) at which the MPU updates the sensor data and DMP output

//  MPU_UPDATE_RATE defines the rate (in Hz) at which the MPU updates the sensor data and DMP output

#define MPU_UPDATE_RATE  (20)

//  MAG_UPDATE_RATE defines the rate (in Hz) at which the MPU updates the magnetometer data
//  MAG_UPDATE_RATE should be less than or equal to the MPU_UPDATE_RATE

#define MAG_UPDATE_RATE  (10)

//  MPU_MAG_MIX defines the influence that the magnetometer has on the yaw output.
//  The magnetometer itself is quite noisy so some mixing with the gyro yaw can help
//  significantly. Some example values are defined below:

#define  MPU_MAG_MIX_GYRO_ONLY          0                   // just use gyro yaw
#define  MPU_MAG_MIX_MAG_ONLY           1                   // just use magnetometer and no gyro yaw
#define  MPU_MAG_MIX_GYRO_AND_MAG       10                  // a good mix value
#define  MPU_MAG_MIX_GYRO_AND_SOME_MAG  50                  // mainly gyros with a bit of mag correction

//  MPU_LPF_RATE is the low pas filter rate and can be between 5 and 188Hz

#define MPU_LPF_RATE   5


void MPU9150::device_setup(){
  //Todo: Read calibration values from EPROM
  Wire.begin();
  MPU.selectDevice(MPUDeviceId);
  //  MPU.init(MPU_UPDATE_RATE, MPU_MAG_MIX_GYRO_AND_MAG, MAG_UPDATE_RATE, MPU_LPF_RATE);
  if (!MPU.init(MPU_UPDATE_RATE, MPU_MAG_MIX_GYRO_AND_MAG, MAG_UPDATE_RATE, MPU_LPF_RATE)){
	Serial.println(F("log:Trying other MPU9150 address to init;"));
	Serial.print(F("log:IMU Address was :"));
	Serial.print(1);
	MPUDeviceId = !MPUDeviceId;
	Serial.print(F(" but is now:"));
	Serial.print(MPUDeviceId);
	Serial.println(";");
	MPU.selectDevice(MPUDeviceId);
	if (MPU.init(MPU_UPDATE_RATE, MPU_MAG_MIX_GYRO_AND_MAG, MAG_UPDATE_RATE, MPU_LPF_RATE)){
		DidInit = true;
		Serial.println(F("log:Init worked the second time;"));
	} else {
		Serial.println(F("log:Failed to init on both addresses;"));
	}
  } else {
	DidInit = true;
	Serial.println(F("log:init on primary addresses;"));
  }                             // start the MPU
  Settings::capability_bitarray |= (1 << COMPASS_CAPABLE);
  Settings::capability_bitarray |= (1 << ORIENTATION_CAPABLE);
  MPU9150ReInit.reset();
}

void MPU9150::device_loop(Command command){
  if (!DidInit){
    if( MPU9150ReInit.elapsed(30000)){
	MPU9150::device_setup();
    }
     return;
  }
  if (command.cmp("ccal")){
   // Compass_Calibrate();
   // The IMU needs both Magnatrometer and Acceleromter to be calibrated. This attempts to do them both at the same time
    calLibRead(MPUDeviceId, &calData);               // pick up existing accel data if there

    calData.accelValid = false;
    calData.accelMinX = 0x7fff;                              // init accel cal data
    calData.accelMaxX = 0x8000;
    calData.accelMinY = 0x7fff;
    calData.accelMaxY = 0x8000;
    calData.accelMinZ = 0x7fff;
    calData.accelMaxZ = 0x8000;

    calData.magValid = false;
    calData.magMinX = 0x7fff;                                // init mag cal data
    calData.magMaxX = 0x8000;
    calData.magMinY = 0x7fff;
    calData.magMaxY = 0x8000;
    calData.magMinZ = 0x7fff;
    calData.magMaxZ = 0x8000;

    MPU.useAccelCal(false);
    //MPU.init(MPU_UPDATE_RATE, 5, 1, MPU_LPF_RATE);

    counter = 359;
    InCallibrationMode = true;
    calibration_timer.reset();
    Serial.println(F("!!!:While the compass counts down from 360 to 0, rotate the ROV slowly in all three axis;"));

  }

  if (InCallibrationMode){
    bool changed = false;


    if(counter>0){
      if (MPU.read()) {                                        // get the latest data
        changed = false;
        if (MPU.m_rawAccel[VEC3_X] < calData.accelMinX) {
          calData.accelMinX = MPU.m_rawAccel[VEC3_X];
          changed = true;
        }
         if (MPU.m_rawAccel[VEC3_X] > calData.accelMaxX) {
          calData.accelMaxX = MPU.m_rawAccel[VEC3_X];
          changed = true;
        }
        if (MPU.m_rawAccel[VEC3_Y] < calData.accelMinY) {
          calData.accelMinY = MPU.m_rawAccel[VEC3_Y];
          changed = true;
        }
         if (MPU.m_rawAccel[VEC3_Y] > calData.accelMaxY) {
          calData.accelMaxY = MPU.m_rawAccel[VEC3_Y];
          changed = true;
        }
        if (MPU.m_rawAccel[VEC3_Z] < calData.accelMinZ) {
          calData.accelMinZ = MPU.m_rawAccel[VEC3_Z];
          changed = true;
        }
         if (MPU.m_rawAccel[VEC3_Z] > calData.accelMaxZ) {
          calData.accelMaxZ = MPU.m_rawAccel[VEC3_Z];
          changed = true;
        }
        if (MPU.m_rawMag[VEC3_X] < calData.magMinX) {
          calData.magMinX = MPU.m_rawMag[VEC3_X];
          changed = true;
        }
         if (MPU.m_rawMag[VEC3_X] > calData.magMaxX) {
          calData.magMaxX = MPU.m_rawMag[VEC3_X];
          changed = true;
        }
        if (MPU.m_rawMag[VEC3_Y] < calData.magMinY) {
          calData.magMinY = MPU.m_rawMag[VEC3_Y];
          changed = true;
        }
         if (MPU.m_rawMag[VEC3_Y] > calData.magMaxY) {
          calData.magMaxY = MPU.m_rawMag[VEC3_Y];
          changed = true;
        }
        if (MPU.m_rawMag[VEC3_Z] < calData.magMinZ) {
          calData.magMinZ = MPU.m_rawMag[VEC3_Z];
          changed = true;
        }
         if (MPU.m_rawMag[VEC3_Z] > calData.magMaxZ) {
          calData.magMaxZ = MPU.m_rawMag[VEC3_Z];
          changed = true;
        }

        if (changed) {
          Serial.print(F("dia:accel.MinX=")); Serial.print(calData.accelMinX); Serial.println(";");
          Serial.print(F("dia:accel.maxX=")); Serial.print(calData.accelMaxX); Serial.println(";");
          Serial.print(F("dia:accel.minY=")); Serial.print(calData.accelMinY); Serial.println(";");
          Serial.print(F("dia:accel.maxY=")); Serial.print(calData.accelMaxY); Serial.println(";");
          Serial.print(F("dia:accel.minZ=")); Serial.print(calData.accelMinZ); Serial.println(";");
          Serial.print(F("dia:accel.maxZ=")); Serial.print(calData.accelMaxZ); Serial.println(";");
          Serial.print(F("dia:mag.minX=")); Serial.print(calData.magMinX); Serial.println(";");
          Serial.print(F("dia:mag.maxX=")); Serial.print(calData.magMaxX); Serial.println(";");
          Serial.print(F("dia:mag.minY=")); Serial.print(calData.magMinY); Serial.println(";");
          Serial.print(F("dia:mag.maxY=")); Serial.print(calData.magMaxY); Serial.println(";");
          Serial.print(F("dia:mag.minZ=")); Serial.print(calData.magMinZ); Serial.println(";");
          Serial.print(F("dia:mag.maxZ=")); Serial.print(calData.magMaxZ); Serial.println(";");
        }
      }
      if (calibration_timer.elapsed (1000)) {
        counter--;
        navdata::HDGD = counter;
        Serial.print(F("hdgd:"));
        Serial.print(navdata::HDGD);
        Serial.print(';');
      }
    }
    if (counter <= 0){
      calData.accelValid = true;
      calData.magValid = true;
      calLibWrite(MPUDeviceId, &calData);
      Serial.println(F("log:Accel cal data saved for device;"));
      InCallibrationMode = false;
    }
    return;  //prevents the normal read and reporting of IMU data
  }
  else if (command.cmp("i2cscan")){
   // scan();
  }
//    MPU.selectDevice(MPUDeviceId);
    MPU.read();
//    {
//        Serial.println(F("log:SwappingIMUAddress;"));
//        MPUDeviceId = !MPUDeviceId;
//        MPU.selectDevice(MPUDeviceId);
//        if(!MPU.read()){
//		Serial.println(F("log:Failed to read IMU on both addresses. Sleeping for 1 minute"));
//		DidInit = false;
//	}
//    }
    navdata::HDGD = MPU.m_fusedEulerPose[VEC3_Z] * RAD_TO_DEGREE;
    //To convert to-180/180 to 0/360
    if (navdata::HDGD < 0) navdata::HDGD+=360;
    navdata::PITC = MPU.m_fusedEulerPose[VEC3_X] * RAD_TO_DEGREE;
    navdata::ROLL = MPU.m_fusedEulerPose[VEC3_Y] * RAD_TO_DEGREE;
    navdata::YAW = MPU.m_fusedEulerPose[VEC3_Z] * RAD_TO_DEGREE;
}
#endif
