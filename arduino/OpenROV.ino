#include <Servo.h>
#include <Arduino.h>
#include "Motors.h"
#include "Command.h"
#include "Sensor.h"


/* All sensors are just examples for now.  None of them actually do anything. */

Motors motors(9, 10, 11);
Command cmd;
Sensor salinity("salinity", 1, salinity.analog);
Sensor led("led", 13, led.digital, led.out);

Servo tilt, light;
int speed_offset = 31;
// array[0] will be the number of arguments in the command
int array[MAX_ARGS];

unsigned long startTime = millis();  //  time based on hardware register - Timer #0
unsigned long interval1 = 500; // one second interval
int interval2 = 4; // multiple of interval1
long count = 0; // counter for interval2
unsigned long lastTime = 0;  // use for holding time of last interval

int pin_read = 0; //  holds value of analog read
float voltage = 0;  //  holds scaled value of voltage - adjusted for voltage divider
float scale = 15.0/1023.0;  // scale factor for 3 to 1 voltage divider - 15V reduced to 5V

// Note - this will not be neede for ROV pc board
// led on pin 19 of ATmega328 breadboard to indicate if program is running - connected to pin 13 on Arduino boards
int blink = 0;  // toggle to blink on/off - period = interval

void setup(){

  Serial.begin(115200);

  // Output elapsed time  
  elapsed_time_output(startTime);
 
  tilt.attach(5);
  light.attach(6);
  
  motors.reset();
  salinity.reset();
  led.reset();
  count = 0;
}

void loop(){
  
  if (Serial.available()) {
    // blocks output data... TODO: need a way of calculating frequency for sensor data
    delay(30);
    // Get command from serial buffer
    cmd.get();

    // do something with the command, what command is it?
    if (cmd.cmp("throttle")){
      cmd.parse(array);
      speed_offset = array[1];
    }
    else if (cmd.cmp("go")){
      cmd.parse(array);
      int p = array[1];
      int v = array[2];
      int s = array[3];
      motors.go(p, v, s); 
      Serial.println(cmd.cmd);
    }
    else {
      motors.stop(); 
    }
    
    //Serial.println(cmd);
  }

  // Write commands to OpenROV ===============
  // blink LED
  if (millis() - lastTime > interval1){
    lastTime = millis();  // reset interval1 timer
    count++; // increment interval2 count
    
    if (blink == 0){
      led.write(HIGH);  // turn the led on (HIGH is the voltage level)
      blink = 1;  // reset toggle
    }
    else{
      led.write(LOW);    // turn the LED off by making the voltage LOW
      blink = 0;  // reset toggle
    }
  }
  if (count == interval2){
    count=0;  // reset interval2 counter

    // Output elapsed time  
    elapsed_time_output(startTime);

    pin_read = analogRead(0);                 //  read voltage on pin 0 and output to serial port
    voltage=pin_read*scale;                   //  15V will scale to 5V at analog in pin 0 with 3 to 1 voltage divider
    Serial.print("Battery Voltage:");         //  Connect Battery output to analog pin 0 using voltage divider
    Serial.println(voltage);                  //  Nominal Battery voltage is 12V - analog pin input 0-5V
                                              //  Divide by 3 with voltage divider
  }
}



// Output elapsed time
void elapsed_time_output(unsigned long sTime){
  #define SEC_PER_MIN 60
  #define SEC_PER_HOUR 3600
  unsigned long elapsedTime = (millis() - sTime)/1000;
  Serial.print("Elapsed time is ");
  Serial.print(elapsedTime/SEC_PER_HOUR);
  Serial.print(":");
  Serial.print((elapsedTime/SEC_PER_MIN) % SEC_PER_MIN);
  Serial.print(":");  
  Serial.println(elapsedTime % SEC_PER_MIN);
}

