#include "AConfig.h"
#if(HAS_STD_CAMERAMOUNT)
#include "openrov_servo.h"
#include "Device.h"
#include "Pin.h"
#include "CameraMount.h"
#include "Settings.h"

#define F_CPU 16000000UL
#include <avr/io.h>
#include <avr/interrupt.h>
#include <Arduino.h>

#if(CAMERAMOUNT_PIN != 11) //use timer 1
Servo tilt;
#endif
int tilt_val = 1500;
int new_tilt = 1500;
const int tiltrate = 1;

int smoothAdjustedCameraPosition(int target, int current){
  double x = target - current;
  int sign = (x>0) - (x<0);
  int adjustedVal = current + sign * (min(abs(target - current), tiltrate));
  return (adjustedVal);
}

void tiltServo(long milliseconds){
	OCR1A = milliseconds*2; // set to 90° --> pulsewdith = 1.5ms
}

void CameraMount::device_setup(){
#if(CAMERAMOUNT_PIN != 11) //use timer 1
    tilt.attach(CAMERAMOUNT_PIN);
    tilt.writeMicroseconds(new_tilt);
#else
    pinMode(CAMERAMOUNT_PIN, OUTPUT);
    TCCR1A = 0;
    TCCR1B = 0;
    TCCR1A |= (1<<COM1A1) | (1<<WGM11); // non-inverting mode for OC1A
    TCCR1B |= (1<<WGM13) | (1<<WGM12) | (1<<CS11); // Mode 14, Prescaler 8

    ICR1 = 40000; // 320000 / 8 = 40000   
    tiltServo(1500);
#endif
    Settings::capability_bitarray |= (1 << CAMERA_MOUNT_1_AXIS_CAPABLE);
}

void CameraMount::device_loop(Command command){
    if (command.cmp("tilt")) {
      if ((command.args[1] > 999) && (command.args[1] < 2001)){
        tilt_val = command.args[1];
        cameraMountdata::CMTG = tilt_val;
      }
    }
    if (tilt_val != new_tilt){
      new_tilt = smoothAdjustedCameraPosition(tilt_val,new_tilt);
#if(CAMERAMOUNT_PIN != 11) //use timer 1     
      tilt.writeMicroseconds(new_tilt);
#else
      tiltServo(new_tilt);
#endif
      cameraMountdata::CMNT = new_tilt;
    }

    
}

//void Cape::do_event(Event event){
//}
#endif



