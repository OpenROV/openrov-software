#include <Servo.h>
#include <Arduino.h>
#include "Motors.h"
#include "Command.h"
#include "Device.h"
#include "Timer.h"


Motors motors(9, 10, 11);
Command cmd;
Device led("led", 4, led.analog, led.out);
Device vout("vout", 0, vout.analog, vout.in);
Timer time;

Servo tilt, light;
// IMPORTANT!
// array[0] will be the number of arguments in the command
int array[MAX_ARGS];


void setup(){

  Serial.begin(115200);

  pinMode(13, OUTPUT);
 
  tilt.attach(3);
  light.attach(6);
  
  motors.reset();
  led.reset();

  time.reset();
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
      int tilt_val = array[1];
      tilt.write(tilt_val);
    }
    else if (cmd.cmp("go")) {
      cmd.parse(array);
      int p = array[1];
      int v = array[2];
      int s = array[3];
      motors.go(p, v, s); 
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

  // send voltage
  if (time.elapsed(1000)) {
    vout.send(vout.read());
    Serial.print("time:");
    Serial.println(millis());
  }
  // else if (time.elapsed(500)) {
  //   digitalWrite(13, HIGH);
  //   delay(200);
  //   digitalWrite(13, LOW);
  // }

}
