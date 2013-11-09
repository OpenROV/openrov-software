/*
Sketch to read a MS5803-14BA pressure sensor, written from scratch.
Will output data to the serial console.

Written by Walt Holm 
Initial revision 10 Oct 2013
Rev 1 12 Oct 2013 -- Implements 2nd order temperature compensation
*/


#include <Wire.h>

const int DevAddress = 0x76;  // 7-bit I2C address of the MS5803

// Here are the commands that can be sent to the 5803

const byte Reset = 0x1E;
const byte D1_256 = 0x40;
const byte D1_512 = 0x42;
const byte D1_1024 = 0x44;
const byte D1_2048 = 0x46;
const byte D1_4096 = 0x48;
const byte D2_256 = 0x50;
const byte D2_512 = 0x52;
const byte D2_1024 = 0x54;
const byte D2_2048 = 0x56;
const byte D2_4096 = 0x58;
const byte AdcRead = 0x00;
const byte PromBaseAddress = 0xA0;



unsigned int CalConstant[8];  // Matrix for holding calibration constants

long AdcTemperature, AdcPressure;  // Holds raw ADC data for temperature and pressure
float Temperature, Pressure, TempDifference, Offset, Sensitivity;
float T2, Off2, Sens2;  // Offsets for second-order temperature computation
 
byte ByteHigh, ByteMiddle, ByteLow;  // Variables for I2C reads

// Program initialization starts here

void setup(){
  
  Serial.begin(9600);
  Serial.println("Code is running");
  delay(1000);
  Wire.begin();
  Serial.println("initialized I2C");
  delay(10);
  delay(1000);
  
  
  // Reset the device and check for device presence
  
  sendCommand(Reset);
  delay(10);
  delay(1000);
  Serial.println("Device is reset");
   
  // Get the calibration constants and store in array
  
  for (byte i = 0; i < 8; i++)
  {
    sendCommand(PromBaseAddress + (2*i));
    Wire.requestFrom(DevAddress, 2);
    while(Wire.available()){
      ByteHigh = Wire.read();
      ByteLow = Wire.read();
    }
    CalConstant[i] = (((unsigned int)ByteHigh << 8) + ByteLow);
  }
  
  Serial.println("Calibration constants are:");
  
  for (byte i=0; i < 8; i++)
  {
    Serial.println(CalConstant[i]);
  }
  
  Serial.println("");
  Serial.println("");
}


void loop(){

  // Read the Device for the ADC Temperature and Pressure values
  
  sendCommand(D1_512);
  delay(10);
  sendCommand(AdcRead);
  Wire.requestFrom(DevAddress, 3);
  while(Wire.available())
  {
    ByteHigh = Wire.read();
    ByteMiddle = Wire.read();
    ByteLow = Wire.read();
  }
  AdcPressure = ((long)ByteHigh << 16) + ((long)ByteMiddle << 8) + (long)ByteLow;
  
//  Serial.print("D1 is: ");
//  Serial.println(AdcPressure);
  
  sendCommand(D2_512);
  delay(10);
  sendCommand(AdcRead);
  Wire.requestFrom(DevAddress, 3);
  while(Wire.available())
  {
    ByteHigh = Wire.read();
    ByteMiddle = Wire.read();
    ByteLow = Wire.read();
  }
  AdcTemperature = ((long)ByteHigh << 16) + ((long)ByteMiddle << 8) + (long)ByteLow;
 // Serial.print("D2 is: ");
//  Serial.println(AdcTemperature);
  
    
  // Calculate the Temperature (first-order computation)
  
  TempDifference = (float)(AdcTemperature - ((long)CalConstant[5] << 8));
  Temperature = (TempDifference * (float)CalConstant[6])/ pow(2, 23);
  Temperature = Temperature + 2000;  // This is the temperature in hundredths of a degree C
  
  // Calculate the second-order offsets
  
  if (Temperature < 2000.0)  // Is temperature below or above 20.00 deg C ?
  {
    T2 = 3 * pow(TempDifference, 2) / pow(2, 33);
    Off2 = 1.5 * pow((Temperature - 2000.0), 2);
    Sens2 = 0.625 * pow((Temperature - 2000.0), 2);
  }
  else
  {
    T2 = (TempDifference * TempDifference) * 7 / pow(2, 37);
    Off2 = 0.0625 * pow((Temperature - 2000.0), 2); 
    Sens2 = 0.0;
  }
  
  // Check print the offsets
  
  Serial.println("Second-order offsets are:");
  Serial.println(T2);
  Serial.println(Off2);
  Serial.println(Sens2);
  
  
  // Print the temperature results
  
  Temperature = Temperature / 100;  // Convert to degrees C
  Serial.print("First-Order Temperature in Degrees C is ");
  Serial.println(Temperature);
  Serial.print("Second-Order Temperature in Degrees C is ");
  Serial.println(Temperature - (T2 / 100));
  
  // Calculate the pressure parameters
  
  Offset = (float)CalConstant[2] * pow(2,16);
  Offset = Offset + ((float)CalConstant[4] * TempDifference / pow(2, 7));

  Sensitivity = (float)CalConstant[1] * pow(2, 15);
  Sensitivity = Sensitivity + ((float)CalConstant[3] * TempDifference / pow(2, 8));
  
  // Add second-order corrections
  
  Offset = Offset - Off2;
  Sensitivity = Sensitivity - Sens2;
  
  // Calculate absolute pressure in bars

  Pressure = (float)AdcPressure * Sensitivity / pow(2, 21);
  Pressure = Pressure - Offset;
  Pressure = Pressure / pow(2, 15);
  Pressure = Pressure / 10000;  // Set output to bars;
  
  // Convert to psig and display
  
  Pressure = Pressure - 1.015;  // Convert to gauge pressure (subtract atmospheric pressure)
  Pressure = Pressure * 14.50377;  // Convert bars to psi
  Serial.print("Pressure in psi is: ");
  Serial.println(Pressure);
  Serial.println();
  
  delay(1000);   // pause for 1 second before looping  
}

void sendCommand(byte command){
  Wire.beginTransmission(DevAddress);
  Wire.write(command);
  Wire.endTransmission();
}
 
