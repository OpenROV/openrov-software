#include <Servo.h>
#include <Arduino.h>
#include "Motors.h"
#include "Command.h"
#include "Sensor.h"


Motors motors(9, 10, 11);
Command cmd;
Sensor led("led", 4, led.analog, led.out);

Servo tilt, light;
// IMPORTANT!
// array[0] will be the number of arguments in the command
int array[MAX_ARGS];


void setup(){

  Serial.begin(115200);
 
  tilt.attach(12);
  light.attach(6);
  
  motors.reset();
  led.reset();
}

void loop(){
  
  if (Serial.available()) {
    // blocks output data... TODO: need a way of calculating frequency for sensor data
    delay(30);
    // Get command from serial buffer
    cmd.get();

    // do something with the command, what command is it?
    if (cmd.cmp("tilt")) {
      cmd.parse(array);
      int tilt_val = array[1];
      tilt.write(tilt_val);
    }
    else if (cmd.cmp("go")) {
      cmd.parse(array);
      int p = array[1];
      int v = array[2];
      int s = array[3];
      motors.go(p, v, s); 
      // Serial.println(cmd.cmd);
    }
    else if (cmd.cmp("light")) {
      cmd.parse(array);
      int light = array[1];
      led.write(light);
    }
    else {
      motors.stop(); 
    }
  }
}
