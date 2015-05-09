#include "../Device.h"
#include "../openrov_servo.h"
#include "auxServo.h"
#include <Arduino.h>

Servo servo1;
Servo servo2;

int servo1Pin;
int servo1Min;
int servo1Max;

int servo2Pin;
int servo2Min;
int servo2Max;

void AuxServo::device_setup(){
}

void AuxServo::device_loop(Command command){
    if (command.cmp("xsrv.cfg")) {
      if ((command.args[1] == 1) ){
        servo1Pin = command.args[2];
        servo1Min = command.args[3];
        servo1Max = command.args[4];
        Serial.print(F("xsrv.ext:1,pin:"));
        Serial.print(servo1Pin);
        Serial.print(';');
        servo1.attach(servo1Pin);
      }
      if ((command.args[1] == 2) ){
        servo2Pin = command.args[2];
        servo2Min = command.args[3];
        servo2Max = command.args[4];
        Serial.print(F("xsrv.ext:2,pin:"));
        Serial.print(servo2Pin);
        Serial.print(';');
        servo2.attach(servo2Pin);
      }
    }
    if (command.cmp("xsrv.exe")) {
      if (command.args[1] == servo1Pin) {
        servo1.write(command.args[2]);
        Serial.print(F("xsrv.ext:"));
        Serial.print(servo1Pin);
        Serial.print(',');
        Serial.print(command.args[2]);
      }
      if (command.args[1] == servo2Pin) {
        servo2.write(command.args[2]);
        Serial.print(F("xsrv.ext:"));
        Serial.print(servo2Pin);
        Serial.print(',');
        Serial.print(command.args[2]);
      }
      Serial.print(';');
    }
}

