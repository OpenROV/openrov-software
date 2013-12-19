////////////////////////////////////////////////////////////////////////////
//
//  This file is part of MPU9150Lib
//
//  Copyright (c) 2013 Pansenti, LLC
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy of 
//  this software and associated documentation files (the "Software"), to deal in 
//  the Software without restriction, including without limitation the rights to use, 
//  copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the 
//  Software, and to permit persons to whom the Software is furnished to do so, 
//  subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in all 
//  copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
//  INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
//  PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
//  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION 
//  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
//  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#ifndef _MPU9150LIB_H_
#define _MPU9150LIB_H_

#include <Arduino.h>
#include "MPUQuaternion.h"
#include "CalLib.h"

//  Define this symbol to get debug info

#define MPULIB_DEBUG

//  This symbol defines the scaled range for mag and accel values

#define SENSOR_RANGE   4096

class MPU9150Lib
{
public: 

  // Constructor

  MPU9150Lib();

  // selectDevice() can be called to select a device:
  //
  //   0 = device at address 0x68 (default)
  //   1 = device at address 0x69
  //
  // selectDevice() must be called before init()

  void selectDevice(int device);

  // these two functions control if calibration data is used. Must be called before init()
  // if defaults (use mag and accel cal) aren't required.

  void useAccelCal(boolean useCal);
  void useMagCal(boolean useCal);

  // init must be called to setup the MPU chip.
  // mpuRate is the update rate in Hz.
  // magMix controls the amoutn of influence that the magnetometer has on yaw:
  //   0 = just use MPU gyros (will not be referenced to north)
  //   1 = just use magnetometer with no input from gyros
  //   2-n = mix the two. Higher numbers decrease correction from magnetometer
  // It returns false if something went wrong with the initialization.
  // magRate is the magnetometer update rate in Hz. magRate <= mpuRate.
  //   Also, magRate must be <= 100Hz.
  // lpf is the low pass filter setting - can be between 5Hz and 188Hz.
  //   0 means let the MotionDriver library decide.
    
  boolean init(int mpuRate, int magMix = 5, int magRate = 10, int lpf = 0);
  
  //  read checks to see if there's been a new update.
  //  returns true if yes, false if not.
  
  boolean read();

  // disableAccelCal can be called while running to disable
  // accel bias offsets while performing accel calibration

  void disableAccelCal();

  //  check if calibration in use
  
  boolean isMagCal();
  boolean isAccelCal();

  //  these functions can be used to display quaternions and vectors
  
  void printQuaternion(long *quaternion);
  void printQuaternion(float *quaternion);
  void printVector(short *vec);
  void printVector(float *vec);
  void printAngles(float *vec);
  
  //  these variables are the values from the MPU
  
  long m_rawQuaternion[4];                                  // the quaternion output from the DMP
  short m_rawGyro[3];                                       // calibrated gyro output from the sensor
  short m_rawAccel[3];                                      // raw accel data
  short m_rawMag[3];                                        // raw mag data 
  
  //  these variables are processed results
  
  float m_dmpQuaternion[4];                                 // float and normalized version of the dmp quaternion
  float m_dmpEulerPose[3];                                  // Euler angles from the DMP quaternion
  short m_calAccel[3];                                      // calibrated and scaled accel data
  short m_calMag[3];                                        // calibrated mag data

  // these variables are the fused results

  float m_fusedEulerPose[3];                                // the fused Euler angles
  float m_fusedQuaternion[4];								// the fused quaternion

private:
  CALLIB_DATA m_calData;                                    // calibration data
  boolean m_useMagCalibration;                              // true if use mag calibration
  boolean m_useAccelCalibration;                            // true if use mag calibration
  byte m_device;                                            // IMU device index
  int m_magMix;                                             // controls gyro and magnetometer mixing for yaw
  unsigned long m_magInterval;                              // interval between mag reads in mS
  unsigned long m_lastMagSample;                            // last time mag was read

  void dataFusion();                                        // fuse mag data with the dmp quaternion

  float m_lastDMPYaw;                                       // the last yaw from the DMP gyros
  float m_lastYaw;                                          // last calculated output yaw

  //  calibration data in processed form

  short m_magXOffset;										// offset to be structed for mag X
  short m_magXRange;										// range of mag X
  short m_magYOffset;										// offset to be structed for mag Y
  short m_magYRange;										// range of mag Y
  short m_magZOffset;										// offset to be structed for mag Z
  short m_magZRange;										// range of mag Z

  short m_accelXRange;										// range of accel X
  short m_accelYRange;										// range of accel Y
  short m_accelZRange;										// range of accel Z
  long m_accelOffset[3];                                    // offsets for accel

};

#endif // _MPU9150LIB_H_
