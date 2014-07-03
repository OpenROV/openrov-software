#include "AConfig.h"
#if(HAS_STD_CALIBRATIONLASERS)
#include "Device.h"
#include "Pin.h"
#include "CalibrationLaser.h"
#include "Settings.h"

Pin claser("claser", CALIBRATIONLASERS_PIN, claser.analog, claser.out);

void CalibrationLaser::device_setup(){
    Settings::capability_bitarray |= (1 << CALIBRATION_LASERS_CAPABLE);
    claser.write(0);
}

void CalibrationLaser::device_loop(Command command){
    if( command.cmp("claser")){
      int value = command.args[1];
      claser.write(value);
      claser.send(value);
    }       

}
#endif



