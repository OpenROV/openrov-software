#include "AConfig.h"
#if(HAS_STD_CALIBRATIONLASERS)
#include "Device.h"
#include "Pin.h"
#include "CalibrationLaser.h"
#include "Settings.h"

Pin light("claser", CALIBRATIONLASERS_PIN, light.analog, light.out);

void CalibrationLaser::device_setup(){
    Settings::capability_bitarray |= (1 << CALIBRATION_LASERS_CAPABLE);
    light.write(0);
}

void CalibrationLaser::device_loop(Command command){
    if( command.cmp("claser")){
      int value = command.args[1];
      light.write(value);
    }       

}
#endif



