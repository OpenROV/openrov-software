#include <Servo.h>
#include <Arduino.h>
#include "Motors.h"
#include "Command.h"
#include "Device.h"
#include "Timer.h"
#include "FreeMem.h"


Motors motors(9, 10, 11);
Command cmd;
Device vout("vout", 0, vout.analog, vout.in);
Device iout("iout", 3, iout.analog, iout.in);
Device light("light", 5, light.analog, light.out);
Timer time;
Timer statustime;
Timer controltime;

Servo tilt;
// IMPORTANT!
// array[0] will be the number of arguments in the command
int array[MAX_ARGS];

// Define the number of samples to keep track of.  The higher the number,
// the more the readings will be smoothed, but the slower the output will
// respond to the input.  Using a constant rather than a normal variable lets
// use this value to determine the size of the readings array.
const int numReadings = 30;

int readings[numReadings];      // the readings from the analog input
int index = 0;                  // the index of the current reading
int total = 0;                  // the running total
int average = 0;                // the average
int new_tilt = MIDPOINT;
int new_p = MIDPOINT;
int new_c = MIDPOINT;
int new_v = MIDPOINT;
int tilt_val = MIDPOINT;
int p = MIDPOINT;
int v = MIDPOINT;
int s = MIDPOINT;
int smoothingIncriment = 5; //How aggressive the throttle changes
void setup(){

  Serial.begin(115200);

  pinMode(13, OUTPUT);
 
  tilt.attach(3);
  
  motors.reset();
  
  time.reset();
  statustime.reset();
  controltime.reset();

// initialize all the readings to 0: 
  for (int thisReading = 0; thisReading < numReadings; thisReading++)
    readings[thisReading] = 0;     
}

void loop(){
  
  if (Serial.available()) {
    // blocks output data... TODO: need a way of calculating frequency for device data
    delay(30);
    // Get command from serial buffer
    cmd.get();

    // do something with the command, what command is it?
    if (cmd.cmp("tilt")) {
      cmd.parse(array);
      tilt_val = array[1];
    }
    else if (cmd.cmp("go")) {
      cmd.parse(array);
      p = array[1];
      v = array[2];
      s = array[3];
    }
    else if (cmd.cmp("light")) {
      cmd.parse(array);
      int value = array[1];
      light.write(value);
    }
    else {
      motors.stop(); 
    }
  }

  //to reduce AMP spikes, smooth large power adjustments out. This incirmentally adjusts the motors and servo
  //to their new positions in increments.  The incriment should eventually be adjustable from the cockpit so that
  //the pilot could have more aggressive response profiles for the ROV.
  if (controltime.elapsed (50)) {
    if (p<new_p) new_p -= min(smoothingIncriment,new_p-p);  
    if (p>new_p) new_p += min(smoothingIncriment,p-new_p);
    if (v<new_v) new_v -= min(smoothingIncriment,new_v-v);
    if (v>new_v) new_v += min(smoothingIncriment,v-new_v);
    if (s<new_c) new_c -= min(smoothingIncriment,new_c-s);
    if (s>new_c) new_c += min(smoothingIncriment,s-new_c);
    if (tilt_val<new_tilt) new_tilt -= min(smoothingIncriment,new_tilt-tilt_val);
    if (tilt_val>new_tilt) new_tilt += min(smoothingIncriment,tilt_val-new_tilt);
    tilt.writeMicroseconds(new_tilt);
    motors.go(new_p, new_v, new_c);
  }

  if (time.elapsed (100)) {
    // subtract the last reading:
    total= total - readings[index];         
    // read from the sensor:  
    readings[index] = iout.read();
    delay(1); 
    // add the reading to the total:
    total= total + readings[index];       
    // advance to the next position in the array:  
    index = index + 1;                    

    // if we're at the end of the array...
    if (index >= numReadings)              
      // ...wrap around to the beginning: 
      index = 0;                           

    // calculate the average:
    average = total / numReadings;
  }        

  // send voltage and current
  if (statustime.elapsed(1000)) {
    vout.send(vout.read());
    iout.send(average);
    Serial.print("fmem:");
    Serial.print(freeMemory());
    Serial.print(";");
    Serial.print("motors:");
    Serial.print(new_p);
    Serial.print(",");
    Serial.print(new_v);
    Serial.print(",");
    Serial.print(new_c);
    Serial.print(";");
    Serial.print("mtarg:");
    Serial.print(p);
    Serial.print(",");
    Serial.print(v);
    Serial.print(",");
    Serial.print(s);
    Serial.print(";");
    Serial.print("servo:");
    Serial.print(new_tilt);
    Serial.print(";");
    Serial.print("starg:");
    Serial.print(tilt_val);
    Serial.print(";");
    Serial.print("ver:");
    //Version Number of last change from UTC date: .YYYYMMDDHHMMSS. If you make a change between this and the cockpit that requires the firmware to be in sync or it breaks the system your should update this version number
    // and update the cockpit software lib/OpenROVControler.js to check and ensure the firmware is at this version.
    Serial.print(".20130314034900");
    Serial.print(";");
    Serial.print("time:");
    Serial.println(millis());
  }

}
