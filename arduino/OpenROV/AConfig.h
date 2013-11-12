#ifndef __ACONFIG_H_
#define __ACONFIG_H_

/* This must be before alphabetically before all other files that reference these settings for the compiler to work
*  or you may get vtable errors.
*/

/* This section is for devices and their configuration. IF you have not setup you pins with the
*  standard configuration of the OpenROV kits, you should probably clone the cape or controlboard
*  and change the pin definitions there.  Things not wired to specific pins but on the I2C bus will
*  have the address defined in this file.
*/
//Kit:
#define HAS_STD_CAPE (0)
#define HAS_STD_PILOT (1)
#define HAS_OROV_CONTROLLERBOARD_25 (1)

#define HAS_STD_LIGHTS (1)
#define HAS_STD_CALIBRATIONLASERS (0)
#define HAS_STD_2X1_THRUSTERS (1)
#define HAS_STD_CAMERAMOUNT (1)

//After Market:
#define HAS_POLOLU_MINIMUV (0)
#define HAS_MS5803_14BA (0)
#define MS5803_14BA_I2C_ADDRESS 0x76
#define HAS_MPU9150 (0)
#define MPU9150_EEPROM_START 2


#endif
