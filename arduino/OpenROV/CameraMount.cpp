#include "AConfig.h"
#if(HAS_STD_CAMERAMOUNT)
#include "orov_Servo.h"
#include "Device.h"
#include "Pin.h"
#include "CameraMount.h"
#include "Settings.h"

Servo tilt;
int tilt_val = 1500;
int new_tilt = 1500;
const int tiltrate = 1;

int smoothAdjustedCameraPosition(int target, int current){
  double x = target - current;
  int sign = (x>0) - (x<0);
  int adjustedVal = current + sign * (min(abs(target - current), tiltrate));
  return (adjustedVal);
}


void CameraMount::device_setup(){
    tilt.attach(CAMERAMOUNT_PIN);
    Settings::capability_bitarray |= (1 << CAMERA_MOUNT_1_AXIS_CAPABLE);
}

void CameraMount::device_loop(Command command){
    if (command.cmp("tilt")) {
      tilt_val = command.args[1];
      cameraMountdata::CMTG = tilt_val;
    }
    if (tilt_val != new_tilt){
      new_tilt = smoothAdjustedCameraPosition(tilt_val,new_tilt);
      tilt.writeMicroseconds(new_tilt);
      cameraMountdata::CMNT = new_tilt;
    }

    
}

//void Cape::do_event(Event event){
//}
#endif



