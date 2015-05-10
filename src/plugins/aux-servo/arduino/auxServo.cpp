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

int AuxServo::smoothAdjustedCameraPosition(int target, int current){
  double x = target - current;
  int sign = (x>0) - (x<0);
  int adjustedVal = current + sign * (min(abs(target - current), this->tiltrate));
  return (adjustedVal);
}

void AuxServo::tiltServo(long milliseconds){
  OCR1A = milliseconds*2; // set to 90° --> pulsewdith = 1.5ms
}



void AuxServo::device_setup(){
}

void AuxServo::device_loop(Command command){
    if (command.cmp("xsrv.cfg")) {
      if ((command.args[1] == 1) ){
        servo1Pin = command.args[2];
        servo1Min = command.args[3];
        servo1Max = command.args[4];

        pinMode(servo1Pin, OUTPUT);
        TCCR1A = 0;
        TCCR1B = 0;
        TCCR1A |= (1<<COM1A1) | (1<<WGM11); // non-inverting mode for OC1A
        TCCR1B |= (1<<WGM13) | (1<<WGM12) | (1<<CS11); // Mode 14, Prescaler 8

        ICR1 = 40000; // 320000 / 8 = 40000
        this->tiltServo(1500);

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
        this->tilt_val = command.args[1];
        if (this->tilt_val != this->new_tilt){
          this->new_tilt = this->smoothAdjustedCameraPosition(this->tilt_val, this->new_tilt);
        }
        this->tiltServo(this->new_tilt);

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

