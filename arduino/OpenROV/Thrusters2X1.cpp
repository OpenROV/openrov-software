#include "Device.h"
#include "Pin.h"
#include "Thrusters2X1.h"
#include "Settings.h"
#include "Motors.h"
#include "Timer.h"

Motors motors(9, 10, 11);



int new_p = MIDPOINT;
int new_s = MIDPOINT;
int new_v = MIDPOINT;
int p = MIDPOINT;
int v = MIDPOINT;
int s = MIDPOINT;
Timer controltime;
Timer thrusterOutput;
boolean bypasssmoothing;

int smoothAdjustedServoPosition(int target, int current){
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

void Thrusters::device_setup(){
  motors.reset();
  thrusterOutput.reset();
  controltime.reset();
  bypasssmoothing = false;
}

void Thrusters::device_loop(Command command){

  if (command.cmp("go")) {
      //ignore corrupt data
      int *array = command.args();
      if (array[1]>999 && array[2] >999 && array[3] > 999 && array[1]<2001 && array[2]<2001 && array[3] < 2001) {       
        p = array[1];
        v = array[2];
        s = array[3];
        if (array[4] == 1) bypasssmoothing=true;
      }
    }    
    else if (command.cmp("start")) {
      motors.reset();
    }    
    else if (command.cmp("stop")) {
      motors.stop();
    } 
    
  //to reduce AMP spikes, smooth large power adjustments out. This incirmentally adjusts the motors and servo
  //to their new positions in increments.  The incriment should eventually be adjustable from the cockpit so that
  //the pilot could have more aggressive response profiles for the ROV.
  if (controltime.elapsed (50)) {
    if (p!=new_p || v!=new_v || s!=new_s) {
      new_p = smoothAdjustedServoPosition(p,new_p);
      new_v = smoothAdjustedServoPosition(v,new_v);
      new_s = smoothAdjustedServoPosition(s,new_s);
      if (bypasssmoothing)
      {
        new_p=p;
        new_v=v;
        new_s=s;
        bypasssmoothing = false;
      }
      motors.go(new_p, new_v, new_s);
    }

  }
  
  //The output from the motors is unique to the thruster configuration
  if (thrusterOutput.elapsed(1000)){
    Serial.print(F("motors:"));
    Serial.print(new_p);
    Serial.print(',');
    Serial.print(new_v);
    Serial.print(',');
    Serial.print(new_s);
    Serial.println(';');
    
    Serial.print(F("mtarg:"));
    Serial.print(p);
    Serial.print(',');
    Serial.print(v);
    Serial.print(',');
    Serial.print(s);
    Serial.println(';'); 
  } 
}





