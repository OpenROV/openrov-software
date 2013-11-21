#include "AConfig.h"
#if(HAS_STD_2X1_THRUSTERS)
#include "Device.h"
#include "Pin.h"
#include "Thrusters2X1.h"
#include "Settings.h"
#include "Motors.h"
#include "Timer.h"

//Motors motors(9, 10, 11);
//Motors motors(6, 7, 8);
Motors motors(PORT_PIN,VERTICLE_PIN,STARBORD_PIN);

int new_p = MIDPOINT;
int new_s = MIDPOINT;
int new_v = MIDPOINT;
int p = MIDPOINT;
int v = MIDPOINT;
int s = MIDPOINT;
Timer controltime;
Timer thrusterOutput;
boolean bypasssmoothing;

#ifdef ESCPOWER_PIN
bool canPowerESCs = true;
Pin escpower("escpower", ESCPOWER_PIN, escpower.digital, escpower.out);
#else
boolean canPowerESCs = false;
#endif

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
  #ifdef ESCPOWER_PIN
    escpower.reset();

  #endif
}

void Thrusters::device_loop(Command command){

  if (command.cmp("go")) {
      //ignore corrupt data
      if (command.args[1]>999 && command.args[2] >999 && command.args[3] > 999 && command.args[1]<2001 && command.args[2]<2001 && command.args[3] < 2001) {       
        p = command.args[1];
        v = command.args[2];
        s = command.args[3];
        if (command.args[4] == 1) bypasssmoothing=true;
      }
    }
  #ifdef ESCPOWER_PIN
    else if (command.cmp("escp")) {
      escpower.write(args[1]); //Turn on the ESCs
      Serial.print(F("log:escpower="));
      Serial.print(args[1]));
      Serial.println(';');
    }
  #endif  
    else if (command.cmp("start")) {
      motors.reset();
    }    
    else if (command.cmp("stop")) {
      motors.stop();
    }
    else if ((command.cmp("mcal")) && (canPowerESCs)){
      Serial.println(F("log:Motor Callibration Staring;"));      
      pinMode(ESCPOWER_PIN, OUTPUT);
      digitalWrite(ESCPOWER_PIN, LOW); //turn ESCs off
      motors.go(2000,2000,2000);
      digitalWrite(ESCPOWER_PIN, HIGH); //turn ESCs on
      delay(2000);
      digitalWrite(ESCPOWER_PIN, LOW); //turn ESCs off
      delay(1000);      
      digitalWrite(ESCPOWER_PIN, HIGH); //turn ESCs on
      delay(2000);     
      motors.go(1000,1000,1000);
      delay(2000);
      motors.go(1500,1500,1500);
      Serial.println(F("log:Motor Callibration Complete;"));
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
  
  navdata::FTHR = map((new_p + new_s) / 2, 1000,2000,-100,100);
  
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
#endif




