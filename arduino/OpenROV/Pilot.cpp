#include "AConfig.h"
#if(HAS_STD_PILOT)
#include "Device.h"
#include "Pin.h"
#include "Pilot.h"

void Pilot::device_setup(){
  int a = 0;
}

void Pilot::device_loop(Command command){
//intended to respond to fly by wire commands: MaintainHeading(); TurnTo(compassheading); DiveTo(depth); 
}
#endif




