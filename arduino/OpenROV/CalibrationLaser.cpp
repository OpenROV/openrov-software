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
      int *array = command.args();
      int value = array[1];
      light.write(value);
    }       

}



