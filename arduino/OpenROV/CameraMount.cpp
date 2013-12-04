#include <Servo.h>
#include "Device.h"
#include "Pin.h"
#include "CameraMount.h"
#include "Settings.h"

Servo tilt;
int tilt_val;
int new_tilt;

int smoothAdjustedCameraPosition(int target, int current){
  // if the MIDPOINT is betwen the change requested in velocity we want to go to MIDPOINT first, and right away.
  if (((current < MIDPOINT) && (MIDPOINT < target)) || ((target < MIDPOINT) && (MIDPOINT < current))){
    return MIDPOINT;
  }
  // if the change is moving us closer to MIDPOINT it is a reduction of power and we can move all the way to the target
  // in one command
  if (abs(MIDPOINT-target) < abs(MIDPOINT-current)){
    return target;
  }
  // else, we need to smooth out amp spikes by making a series of incrimental changes in the motors, so only move part of
  // the way to the target this time.
  double x = target - current;
  int sign = (x>0) - (x<0);
  int adjustedVal = current + sign * (min(abs(target - current), Settings::smoothingIncriment));
  // skip the deadzone
  if (sign<0) {
    return (min(adjustedVal,Settings::deadZone_min));
  } else if(sign>0){ 
    return (max(adjustedVal,Settings::deadZone_max));
  } else
    return (adjustedVal);
}


void CameraMount::device_setup(){
    tilt.attach(CAMERAMOUNT_PIN);
    Settings::capability_bitarray |= (1 << CAMERA_MOUNT_1_AXIS_CAPABLE);
}

void CameraMount::device_loop(Command command){
    if (command.cmp("tilt")) {
      tilt_val = command.args[1];
    }
    if (tilt_val != new_tilt){
      new_tilt = smoothAdjustedCameraPosition(tilt_val,new_tilt);
      tilt.writeMicroseconds(new_tilt);
    }    
}

//void Cape::do_event(Event event){
//}



