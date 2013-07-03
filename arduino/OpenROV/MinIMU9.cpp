#include "MinIMU9.h"
#include "MinIMU9AHRS.h"
#include "MinIMU_I2C.h"
#include "Device.h"
#include "Settings.h"

void MinIMU9::device_setup(){
  init_MiniMU9();
  Settings::capability_bitarray |= (1 << COMPASS_CAPABLE);
  Settings::capability_bitarray |= (1 << ORIENTATION_CAPABLE);
}

void MinIMU9::device_loop(Command command){
  if (command.cmp("ccal")){
    Compass_Calibrate();
  }
  else if (command.cmp("i2cscan")){
    scan();
  }

  sample_MiniMU9();
  navdata::HDGD = ToDeg(MAG_Heading);
      
}
