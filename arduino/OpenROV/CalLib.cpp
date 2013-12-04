#include "AConfig.h"
#if(HAS_MPU9150)
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

#include "CalLib.h"
#ifdef __SAM3X8E__

// Due version

#include "DueFlash.h"

DueFlash flash;

void calLibErase(byte device)
{
    uint32_t data = 0;

    flash.write(CALLIB_START + sizeof(CALLIB_DATA) * device, &data, 1); // just destroy the valid byte
}

void calLibWrite(byte device, CALLIB_DATA *calData)
{
    calData->valid = CALLIB_DATA_VALID;

    flash.write(CALLIB_START + sizeof(CALLIB_DATA) * device, (uint32_t *)calData, sizeof(CALLIB_DATA) / 4);
}

boolean calLibRead(byte device, CALLIB_DATA *calData)
{
    memcpy(calData, CALLIB_START + sizeof(CALLIB_DATA) * device, sizeof(CALLIB_DATA));
    return calData->valid == CALLIB_DATA_VALID;
}

#else

// AVR version

#include <EEPROM.h>

void calLibErase(byte device)
{
    EEPROM.write(CALLIB_START, 0); // just destroy the valid byte
}

void calLibWrite(byte device, CALLIB_DATA *calData)
{
  byte *ptr = (byte *)calData;
  byte length = sizeof(CALLIB_DATA);
  int eeprom = CALLIB_START;

  calData->valid = CALLIB_DATA_VALID;
  
  for (byte i = 0; i < length; i++)
    EEPROM.write(eeprom + i, *ptr++);
}

boolean calLibRead(byte device, CALLIB_DATA *calData)
{
  byte *ptr = (byte *)calData;
  byte length = sizeof(CALLIB_DATA);
  int eeprom = CALLIB_START;

  calData->magValid = false;
  calData->accelValid = false;

  if ((EEPROM.read(eeprom) != CALLIB_DATA_VALID_LOW) ||
      (EEPROM.read(eeprom + 1) != CALLIB_DATA_VALID_HIGH))
    return false;                                  // invalid data
    
  for (byte i = 0; i < length; i++)
    *ptr++ = EEPROM.read(eeprom + i);
  return true;  
}
#endif
#endif