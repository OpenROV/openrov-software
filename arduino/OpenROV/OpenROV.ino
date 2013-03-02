#include <Servo.h>
#include <Arduino.h>
#include "Motors.h"
#include "Command.h"
#include "Device.h"
#include "Timer.h"

Motors motors(9, 10, 11);
Command cmd;
Device vout("vout", 0, vout.analog, vout.in);
Device iout("iout", 3, iout.analog, iout.in);
Device light("light", 5, light.analog, light.out);
Timer time;

Servo tilt;
// IMPORTANT!
// array[0] will be the number of arguments in the command
int array[MAX_ARGS];

// Define the number of samples to keep track of.  The higher the number,
// the more the readings will be smoothed, but the slower the output will
// respond to the input.  Using a constant rather than a normal variable lets
// use this value to determine the size of the readings array.
const int numReadings = 100;

int readings[numReadings];      // the readings from the analog input
int index = 0;                  // the index of the current reading
int total = 0;                  // the running total
int average = 0;                // the average
int c_tilt = 90;
int c_motorp = 90;
int c_motors = 90;
int c_motorv = 90;
int tilt_val = 90;
int p = 90;
int v = 90;
int s = 90;

void setup(){

  delay(5000); //wait 5 seconds before starting to give time for programming pin sets

  Serial.begin(115200);

  pinMode(13, OUTPUT);
 
  tilt.attach(3);
  
  motors.reset();
  
  time.reset();

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
      //tilt.write(tilt_val);
    }
    else if (cmd.cmp("go")) {
      cmd.parse(array);
      p = array[1];
      v = array[2];
      s = array[3];
      //motors.go(p, v, s); 
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

  //to reduce AMP spikes, smooth large power adjustments out
  if (time.elapsed (100)) {
    if (p<c_motorp) c_motorp--;
    if (p>c_motorp) c_motorp++;
    if (v<c_motorv) c_motorv--;
    if (v>c_motorv) c_motorv++;
    if (s<c_motors) c_motors--;
    if (s>c_motors) c_motors++;
    if (tilt_val<c_tilt) c_tilt--;
    if (tilt_val>c_tilt) c_tilt++;
    tilt.write(tilt_val);
    motors.go(c_motorp, c_motorv, c_motors);
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
  if (time.elapsed(1000)) {
    vout.send(vout.read());
    iout.send(average);
    Serial.print("time:");
    Serial.println(millis());
  }
  // else if (time.elapsed(500)) {
  //   digitalWrite(13, HIGH);
  //   delay(200);
  //   digitalWrite(13, LOW);
  // }

}
