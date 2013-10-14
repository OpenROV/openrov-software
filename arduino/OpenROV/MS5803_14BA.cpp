#include "AConfig.h"
#if(HAS_MS5803_14BA)

#include "Device.h"
#include "Pin.h"
#include "MS5803_14BA.h"
#include "Settings.h"
#include "Timer.h"

MS5803 sensor = MS5803();
Timer statustime;

void MS5803_14BA::device_setup(){
  Settings::capability_bitarray |= (1 << DEAPTH_CAPABLE);
  // Initalize the sensor which resets the sensor, downloads the needed coeffecients, 
  // and does a CRC check on the returned data. This will verify that we are talking to
  // the device and that all is well.
  if ( sensor.initalizeSensor() ) {
    Serial.println( "MS5803:Sensor CRC check OK.;" );
    sensor.resetSensor();
  } 
  else {
    Serial.println( "MS5803:Sensor CRC check FAILED! There is something wrong!;" );
  }
  
  statustime.reset();
}
float baseline = 0;
float ticks=0;
float temp;
void MS5803_14BA::device_loop(Command command){
  sensor.readSensor();
  
  temp = sensor.pressure();
  temp = abs(temp);
  if (baseline==0) baseline = temp;
  
  ticks = baseline - temp;
//  Serial.print(temp);
//  Serial.print('|');
//  Serial.print(baseline);
//  Serial.print('|');
//  Serial.print(ticks);
//  Serial.print('|');

  if (statustime.elapsed(100)) {
    envdata::PRES = sensor.pressure();
    envdata::TEMP = sensor.temperature();
  }  

}

//
//  MS5803.cpp
//
//  This library is for reading and writing to the MS5803 pressure/temperature sensor.
//
//  Created by Victor Konshin on 4/10/13.
//
//
//  Copyright (c) 2013, Victor Konshin, info@ayerware.com
//  for the DIY Dive Computer project www.diydivecomputer.com
//  All rights reserved.

//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//  * Redistributions of source code must retain the above copyright
//  notice, this list of conditions and the following disclaimer.
//  * Redistributions in binary form must reproduce the above copyright
//  notice, this list of conditions and the following disclaimer in the
//  documentation and/or other materials provided with the distribution.
//  * Neither the name of Ayerware Publishing nor the
//  names of its contributors may be used to endorse or promote products
//  derived from this software without specific prior written permission.

//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
//  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
//  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
//  DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
//  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
//  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
//   LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
//  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
//  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
//  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.



#include <SPI.h>
#include <Wire.h>

// Sensor constants:
#define SENSOR_CMD_RESET      0x1E
#define SENSOR_CMD_ADC_READ   0x00
#define SENSOR_CMD_ADC_CONV   0x40
#define SENSOR_CMD_ADC_D1     0x00
#define SENSOR_CMD_ADC_D2     0x10
#define SENSOR_CMD_ADC_256    0x00
#define SENSOR_CMD_ADC_512    0x02
#define SENSOR_CMD_ADC_1024   0x04
#define SENSOR_CMD_ADC_2048   0x06
#define SENSOR_CMD_ADC_4096   0x08

#define SENSOR_I2C_ADDRESS    0x76 // If the CSB Pin (pin 3) is high, then the address is 0x76, if low, then it's 0x77

static unsigned int      sensorCoefficients[8];           // calibration coefficients
static unsigned long     D1                       = 0;    // Stores uncompensated pressure value
static unsigned long     D2                       = 0;    // Stores uncompensated temperature value
static float             deltaTemp                = 0;    // These three variable are used for the conversion.
static float             sensorOffset             = 0;
static float             sensitivity              = 0;
static unsigned int      io_timeout               = 60;
// Constructor when using SPI.
MS5803::MS5803(uint8_t cs) {
    _cs   = cs;
    interface = true;
}

// Constructor when using i2c.
MS5803::MS5803() {
	interface = false;
}

boolean MS5803::initalizeSensor() {
    
    // Start the appropriate interface.
    if (interface) {
        pinMode( _cs, OUTPUT );
  	    digitalWrite( _cs, HIGH );
    	SPI.begin();
   	    SPI.setBitOrder( MSBFIRST );
   	    SPI.setClockDivider( SPI_CLOCK_DIV2 ); // Go fast or go home...
    } else {
        Wire.begin();
    }
    
    // resetting the sensor on startup is important
    resetSensor(); 
	
	// Read sensor coefficients - these will be used to convert sensor data into pressure and temp data
    for (int i = 0; i < 8; i++ ){
        sensorCoefficients[ i ] = ms5803ReadCoefficient( i );  // read coefficients
        Serial.print("Coefficient = ");
        Serial.println(sensorCoefficients[ i ]);
        delay(10);
    }
    
    unsigned char p_crc = sensorCoefficients[ 7 ];
    unsigned char n_crc = ms5803CRC4( sensorCoefficients ); // calculate the CRC
    
    // If the calculated CRC does not match the returned CRC, then there is a data integrity issue.
    // Check the connections for bad solder joints or "flakey" cables. 
    // If this issue persists, you may have a bad sensor.
    if ( p_crc != n_crc ) {
        return false;
    }
    
    return true;
}

void MS5803::readSensor() {
//swapped D1 D2... (BA)
	// If power or speed are important, you can change the ADC resolution to a lower value.
	// Currently set to SENSOR_CMD_ADC_4096 - set to a lower defined value for lower resolution.
	D2 = ms5803CmdAdc( SENSOR_CMD_ADC_D1 + SENSOR_CMD_ADC_4096 );    // read uncompensated pressure
    D1 = ms5803CmdAdc( SENSOR_CMD_ADC_D2 + SENSOR_CMD_ADC_4096 );    // read uncompensated temperature
    
    // calculate 1st order pressure and temperature correction factors (MS5803 1st order algorithm). 
    deltaTemp = D2 - sensorCoefficients[5] * pow( 2, 8 );
    sensorOffset = sensorCoefficients[2] * pow( 2, 16 ) + ( deltaTemp * sensorCoefficients[4] ) / pow( 2, 7 );
    sensitivity = sensorCoefficients[1] * pow( 2, 15 ) + ( deltaTemp * sensorCoefficients[3] ) / pow( 2, 8 );
    
    // calculate 2nd order pressure and temperature (MS5803 2st order algorithm)
    temp = ( 2000 + (deltaTemp * sensorCoefficients[6] ) / pow( 2, 23 ) ) / 100; 
    press = ( ( ( ( D1 * sensitivity ) / pow( 2, 21 ) - sensorOffset) / pow( 2, 15 ) ) / 10 );
    
}

// Sends a power on reset command to the sensor.
// Should be done at powerup and maybe on a periodic basis (needs to confirm with testing).
void MS5803::resetSensor() {

	if (interface) {
    	SPI.setDataMode( SPI_MODE3 );
   	 	digitalWrite( _cs, LOW );
   		SPI.transfer( SENSOR_CMD_RESET );
    	delay( 10 );
    	digitalWrite( _cs, HIGH );
    	delay( 5 );
    } else {
    	Wire.beginTransmission( SENSOR_I2C_ADDRESS );
        Wire.write( SENSOR_CMD_RESET );
        Wire.endTransmission();
    	delay( 10 );
    }
}

// These sensors have coefficient values stored in ROM that are used to convert the raw temp/pressure data into degrees and mbars.
// This method reads the coefficient at the index value passed.  Valid values are 0-7. See datasheet for more info.
unsigned int MS5803::ms5803ReadCoefficient(uint8_t index) {
    unsigned int result = 0;   // result to return
    
    if (interface) {
    	SPI.setDataMode( SPI_MODE3 );
    	digitalWrite( _cs, LOW );
    
    	// send the device the coefficient you want to read:
    	SPI.transfer( 0xA0 + ( index * 2 ) );
    
    	// send a value of 0 to read the first byte returned:
    	result = SPI.transfer( 0x00 );
    	result = result << 8;
    	result |= SPI.transfer( 0x00 ); // and the second byte
    
    	// take the chip select high to de-select:
    	digitalWrite( _cs, HIGH );
    	
    } else {
	    Wire.beginTransmission( SENSOR_I2C_ADDRESS );
        Wire.write( 0xA0 + ( index * 2 ) );
        Wire.endTransmission();
        Wire.requestFrom ( SENSOR_I2C_ADDRESS, 2 );
          unsigned int millis_start = millis();
          while (Wire.available() < 2) {
            if (io_timeout > 0 && ((unsigned int)millis() - millis_start) > io_timeout) {
    //        did_timeout = true;
              return 0;
            }
          }
        
    	result = Wire.read();
    	result = result << 8;
    	result |= Wire.read(); 
    }
    
    return( result );
}

// Coefficient at index 7 is a four bit CRC value for verifying the validity of the other coefficients.
// The value returned by this method should match the coefficient at index 7.
// If not there is something works with the sensor or the connection.
unsigned char MS5803::ms5803CRC4(unsigned int n_prom[]) {

    int cnt;
    unsigned int n_rem;
    unsigned int crc_read;
    unsigned char  n_bit;
    
    n_rem = 0x00;
    crc_read = sensorCoefficients[7];
    sensorCoefficients[7] = ( 0xFF00 & ( sensorCoefficients[7] ) );
    
    for (cnt = 0; cnt < 16; cnt++)
    { // choose LSB or MSB
        if ( cnt%2 == 1 ) n_rem ^= (unsigned short) ( ( sensorCoefficients[cnt>>1] ) & 0x00FF );
        else n_rem ^= (unsigned short) ( sensorCoefficients[cnt>>1] >> 8 );
        for ( n_bit = 8; n_bit > 0; n_bit-- )
        {
            if ( n_rem & ( 0x8000 ) )
            {
                n_rem = ( n_rem << 1 ) ^ 0x3000;
            }
            else {
                n_rem = ( n_rem << 1 );
            }
        }
    }
    
    n_rem = ( 0x000F & ( n_rem >> 12 ) );// // final 4-bit reminder is CRC code
    sensorCoefficients[7] = crc_read; // restore the crc_read to its original place
    
    return ( n_rem ^ 0x00 ); // The calculated CRC should match what the device initally returned.
}

// Use this method to send commands to the sensor.  Pretty much just used to read the pressure and temp data.
unsigned long MS5803::ms5803CmdAdc(char cmd) {

    unsigned int result = 0;
    unsigned long returnedData = 0;
    
    if ( interface ) {
    	SPI.setDataMode( SPI_MODE3 );
    	digitalWrite( _cs, LOW );
    	SPI.transfer( SENSOR_CMD_ADC_CONV + cmd );
    } else {
	    Wire.beginTransmission( SENSOR_I2C_ADDRESS );
        Wire.write( SENSOR_CMD_ADC_CONV + cmd );
        Wire.endTransmission();
    }
    
    switch ( cmd & 0x0f )
    {
        case SENSOR_CMD_ADC_256 :
            delay( 1 );
            break;
        case SENSOR_CMD_ADC_512 :
            delay( 3 );
            break;
        case SENSOR_CMD_ADC_1024:
            delay( 4 );
            break;
        case SENSOR_CMD_ADC_2048:
            delay( 6 );
            break;
        case SENSOR_CMD_ADC_4096:
            delay( 10 );
            break;
    }
    
	if ( interface ) {
    	digitalWrite( _cs, HIGH );
    	delay(3);
    	digitalWrite( _cs, LOW );
    	
    	SPI.transfer( SENSOR_CMD_ADC_READ );
    	
    	returnedData = SPI.transfer( 0x00 );
    	result = 65536 * returnedData;
    	returnedData = SPI.transfer( 0x00 );
    	result = result + 256 * returnedData;
    	returnedData = SPI.transfer( 0x00 );
    	result = result + returnedData;
    	digitalWrite( _cs, HIGH );
    } else {
        delay(3);
        Wire.beginTransmission( SENSOR_I2C_ADDRESS );
        Wire.write( SENSOR_CMD_ADC_READ );
        Wire.endTransmission();
        
        // Always read back three bytes (24 bits)
    	Wire.requestFrom ( SENSOR_I2C_ADDRESS, 3 );
            unsigned int millis_start = millis();
          while (Wire.available() < 3) {
            if (io_timeout > 0 && ((unsigned int)millis() - millis_start) > io_timeout) {
    //        did_timeout = true;
              return 0;
            }
          }
          
    	returnedData = Wire.read();
    	result = 65536 * returnedData;
    	returnedData = Wire.read();
    	result = result + 256 * returnedData;
    	returnedData = Wire.read();
    	result = result + returnedData;
    }
    return result;
}

#endif



