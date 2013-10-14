
#ifndef __MS5803_14BA_H_
#define __MS5803_14BA_H_
#include <Arduino.h>
#include "Device.h"
#include "Pin.h"

class MS5803_14BA : public Device {
  public:
    MS5803_14BA():Device(){};
    void device_setup();
    void device_loop(Command cmd);
};


class MS5803
{
public:
    // Constructor for SPI
    MS5803(uint8_t cs);
    
    // Constructor for i2c - address set in implementation.
    MS5803();

    /* Initalizes sensor and downloads coefficient values from the device.
     Must call this before readSensor. */
    boolean initalizeSensor();
    
    /* Does the actual read from the sensor. */
    void readSensor();
    
    /* Once readSensor is called, the temp and pressure values can be
     retrieved from these methods. */
    float temperature() const       { return temp;  }  // returns temp in degrees C.
    float pressure() const          { return press; }  // Returns pressure in mBars. 
    
    /* Resets the sensor */
    void resetSensor();
    
private:
    
    float             press;    // Stores actual pressure in mbars
    float             temp;    // Stores actual temp in degrees C.

    unsigned int ms5803ReadCoefficient(uint8_t index); // Reads the coeffincient data from the sensor.
    unsigned char ms5803CRC4(unsigned int n_prom[]); // Verifies the validity of the coeffient data using CRC4.
    unsigned long ms5803CmdAdc(char cmd); // Handles commands to the sensor.
    uint8_t  _cs;
    boolean interface;
};


#endif
