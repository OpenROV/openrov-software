
#include "AConfig.h"
#if(HAS_STD_PILOT)
#include "Device.h"
#include "Pin.h"
#include "Pilot.h"
#include "Timer.h"

Timer pilotTimer;
bool _headingHoldEnabled = false;
int  _headingHoldTarget = 0;
int hdg = 0;
int hdg_Error;
int raw_Left, raw_Right;
int left, right;  // motor outputs in microseconds, +/-500
int loop_Gain = 4;
int integral_Divisor = 100;
long hdg_Error_Integral = 0;
int tgt_Hdg = 0;
bool _depthHoldEnabled = false;
int _depthHoldTarget = 0;
int depth = 0;
int depth_Error = 0;
int raw_lift =0;
int lift = 0;
int target_depth;



void Pilot::device_setup(){
  pilotTimer.reset();
  Serial.println(F("log:pilot setup complete;")); 
}



void Pilot::device_loop(Command command){
//intended to respond to fly by wire commands: MaintainHeading(); TurnTo(compassheading); DiveTo(depth);
    if( command.cmp("holdHeading_toggle")){
      if (_headingHoldEnabled) {
        _headingHoldEnabled = false;     
        raw_Left = 0;
        raw_Right = 0;
        hdg_Error_Integral = 0;  // Reset error integrator
        tgt_Hdg = 0;  // 500 = system not in hdg hold
  
        int argsToSend[] = {1500,1500,1500,3}; //include number of parms as last parm
        command.pushCommand("go",argsToSend);  
        Serial.println(F("log:hold_disabled;"));      
              
      } else {
        Serial.println("log:In loop;");
        _headingHoldEnabled = true;
        _headingHoldTarget = navdata::HDGD;
        tgt_Hdg = _headingHoldTarget;
        Serial.print(F("log:hold_enabled on="));
        Serial.print(tgt_Hdg);
        Serial.println(';');
      }
    }
    
    
    if( command.cmp("holdDepth_toggle")){
      if (_depthHoldEnabled) {
        _depthHoldEnabled = false;     
        raw_lift = 0;
        target_depth = 0;  // 500 = system not in hdg hold
  
        int argsToSend[] = {1500,1500,1500,3}; //include number of parms as last parm
        command.pushCommand("go",argsToSend);  
        Serial.println(F("log:depth_hold_disabled;"));      
              
      } else {
        _depthHoldEnabled = true;
        _depthHoldTarget = navdata::DEAP;
        target_depth = _depthHoldTarget;
        Serial.print(F("log:dhold_enabled on="));
        Serial.print(target_depth);
        Serial.println(';');
      }
    }     


    if (pilotTimer.elapsed (50)) {
      
      // Autopilot Test #3 6 Jan 2014
      // Hold vehicle at arbitrary heading
      // Integer math; proportional control plus basic integrator
      // No hysteresis around 180 degree error
      
      // Check whether hold mode is on
      
      if (_depthHoldEnabled)
      {
        depth = navdata::DEAP;
        depth_Error = depth-target_depth;
        
        raw_lift = -1 * hdg_Error * loop_Gain;
        lift = constrain(raw_lift, -400, 200);
        
        Serial.println(F("log:dhold pushing command;"));
        Serial.print(F("dp_er:"));
        Serial.print(depth_Error);
        Serial.println(';');        
        int argsToSend[] = {1,1500+lift}; //include number of parms as last parm
        command.pushCommand("vertical",argsToSend);         
        
      }

      if (_headingHoldEnabled)
      {
      
        // Code for hold mode here
        hdg = navdata::HDGD;
    
        // Calculate heading error
  
        hdg_Error = hdg - tgt_Hdg;
  
        if (hdg_Error > 180)
        {
        hdg_Error = hdg_Error - 360;
        }
  
        if (hdg_Error < -179)
        {
        hdg_Error = hdg_Error + 360;
        }
        
        // Run error accumulator (integrator)
        hdg_Error_Integral = hdg_Error_Integral + hdg_Error;
        
        // Calculator motor outputs
        raw_Left = -1 * hdg_Error * loop_Gain;
        raw_Right = hdg_Error * loop_Gain;
        // raw_Left = raw_Left - (hdg_Error_Integral / integral_Divisor);
        // raw_Right = raw_Right + (hdg_Error_Integral / integral_Divisor);

        // Constrain and output to motors
        
        left = constrain(raw_Left, -200, 200);
        right = constrain(raw_Right, -200, 200);
        Serial.println(F("log:hold pushing command;"));
        Serial.print(F("p_er:"));
        Serial.print(hdg_Error);
        Serial.println(';');        
        //int argsToSend[] = {3,1500+left,1500,1500+right}; //include number of parms as last parm
        //command.pushCommand("go",argsToSend);
        int argsToSend[] = {1,1500+left}; //include number of parms as last parm
        command.pushCommand("port",argsToSend);
        argsToSend[0] = 1;
        argsToSend[1] =1500+right; //include number of parms as last parm
        command.pushCommand("starbord",argsToSend);        
      }

      
    }
}
#endif



