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

#ifndef _CALLIB_H_
#define _CALLIB_H_

#include <Arduino.h>

#define CALLIB_DATA_VALID         0x15fc
#define CALLIB_DATA_VALID_LOW     0xfc // pattern to detect valid config - low byte
#define CALLIB_DATA_VALID_HIGH    0x15 // pattern to detect valid config - high byte

#ifdef __SAM3X8E__
#define CALLIB_START  ((uint32_t *)(IFLASH1_ADDR + IFLASH1_SIZE - IFLASH1_PAGE_SIZE))
#endif

typedef struct
{
  short valid;                        // should contain the valid pattern if a good config
  short magValid;                     // true if mag data valid
  short magMinX;                      // mag min x value
  short magMaxX;                      // mag max x value
  short magMinY;                      // mag min y value
  short magMaxY;                      // mag max y value
  short magMinZ;                      // mag min z value
  short magMaxZ;                      // mag max z value 
  short accelValid;                   // true if accel data valid
  short accelMinX;                    // mag min x value
  short accelMaxX;                    // mag max x value
  short accelMinY;                    // mag min y value
  short accelMaxY;                    // mag max y value
  short accelMinZ;                    // mag min z value
  short accelMaxZ;                    // mag max z value
  short unused;                       // must be multiple of 32 bits for Due
} CALLIB_DATA;

//  calLibErase() erases any current data in the EEPROM

void calLibErase(byte device);

//  calLibWrite() writes new data to the EEPROM

void calLibWrite(byte device, CALLIB_DATA * calData);

//  calLibRead() reads existing data and returns true if valid else false in not.

boolean calLibRead(byte device, CALLIB_DATA * calData);

#endif // _CALLIB_H_
