#ifndef LSM303_h
#define LSM303_h

#include <Arduino.h> // for byte data type

// device types

#define LSM303DLH_DEVICE   0
#define LSM303DLM_DEVICE   1
#define LSM303DLHC_DEVICE  2
#define LSM303_DEVICE_AUTO 3

// SA0_A states

#define LSM303_SA0_A_LOW  0
#define LSM303_SA0_A_HIGH 1
#define LSM303_SA0_A_AUTO 2

// register addresses

#define LSM303_CTRL_REG1_A       0x20
#define LSM303_CTRL_REG2_A       0x21
#define LSM303_CTRL_REG3_A       0x22
#define LSM303_CTRL_REG4_A       0x23
#define LSM303_CTRL_REG5_A       0x24
#define LSM303_CTRL_REG6_A       0x25 // DLHC only
#define LSM303_HP_FILTER_RESET_A 0x25 // DLH, DLM only
#define LSM303_REFERENCE_A       0x26
#define LSM303_STATUS_REG_A      0x27

#define LSM303_OUT_X_L_A         0x28
#define LSM303_OUT_X_H_A         0x29
#define LSM303_OUT_Y_L_A         0x2A
#define LSM303_OUT_Y_H_A         0x2B
#define LSM303_OUT_Z_L_A         0x2C
#define LSM303_OUT_Z_H_A         0x2D

#define LSM303_FIFO_CTRL_REG_A   0x2E // DLHC only
#define LSM303_FIFO_SRC_REG_A    0x2F // DLHC only

#define LSM303_INT1_CFG_A        0x30
#define LSM303_INT1_SRC_A        0x31
#define LSM303_INT1_THS_A        0x32
#define LSM303_INT1_DURATION_A   0x33
#define LSM303_INT2_CFG_A        0x34
#define LSM303_INT2_SRC_A        0x35
#define LSM303_INT2_THS_A        0x36
#define LSM303_INT2_DURATION_A   0x37

#define LSM303_CLICK_CFG_A       0x38 // DLHC only
#define LSM303_CLICK_SRC_A       0x39 // DLHC only
#define LSM303_CLICK_THS_A       0x3A // DLHC only
#define LSM303_TIME_LIMIT_A      0x3B // DLHC only
#define LSM303_TIME_LATENCY_A    0x3C // DLHC only
#define LSM303_TIME_WINDOW_A     0x3D // DLHC only

#define LSM303_CRA_REG_M         0x00
#define LSM303_CRB_REG_M         0x01
#define LSM303_MR_REG_M          0x02

#define LSM303_OUT_X_H_M         0x03
#define LSM303_OUT_X_L_M         0x04
#define LSM303_OUT_Y_H_M         -1   // The addresses of the Y and Z magnetometer output registers 
#define LSM303_OUT_Y_L_M         -2   // are reversed on the DLM and DLHC relative to the DLH.
#define LSM303_OUT_Z_H_M         -3   // These four defines have dummy values so the library can 
#define LSM303_OUT_Z_L_M         -4   // determine the correct address based on the device type.

#define LSM303_SR_REG_M          0x09
#define LSM303_IRA_REG_M         0x0A
#define LSM303_IRB_REG_M         0x0B
#define LSM303_IRC_REG_M         0x0C

#define LSM303_WHO_AM_I_M        0x0F // DLM only

#define LSM303_TEMP_OUT_H_M      0x31 // DLHC only
#define LSM303_TEMP_OUT_L_M      0x32 // DLHC only

#define LSM303DLH_OUT_Y_H_M      0x05
#define LSM303DLH_OUT_Y_L_M      0x06
#define LSM303DLH_OUT_Z_H_M      0x07
#define LSM303DLH_OUT_Z_L_M      0x08

#define LSM303DLM_OUT_Z_H_M      0x05
#define LSM303DLM_OUT_Z_L_M      0x06
#define LSM303DLM_OUT_Y_H_M      0x07
#define LSM303DLM_OUT_Y_L_M      0x08

#define LSM303DLHC_OUT_Z_H_M     0x05
#define LSM303DLHC_OUT_Z_L_M     0x06
#define LSM303DLHC_OUT_Y_H_M     0x07
#define LSM303DLHC_OUT_Y_L_M     0x08

class LSM303
{
  public:
    typedef struct vector
    {
      float x, y, z;
    } vector;

    vector a; // accelerometer readings
    vector m; // magnetometer readings
    vector m_max; // maximum magnetometer values, used for calibration
    vector m_min; // minimum magnetometer values, used for calibration

    byte last_status; // status of last I2C transmission
    
    // HEX  = BIN          RANGE    GAIN X/Y/Z        GAIN Z
    //                               DLH (DLM/DLHC)    DLH (DLM/DLHC)
    // 0x20 = 0b00100000   ±1.3     1055 (1100)        950 (980) (default)
    // 0x40 = 0b01000000   ±1.9      795  (855)        710 (760)
    // 0x60 = 0b01100000   ±2.5      635  (670)        570 (600)
    // 0x80 = 0b10000000   ±4.0      430  (450)        385 (400)
    // 0xA0 = 0b10100000   ±4.7      375  (400)        335 (355)
    // 0xC0 = 0b11000000   ±5.6      320  (330)        285 (295)
    // 0xE0 = 0b11100000   ±8.1      230  (230)        205 (205)
    enum magGain { magGain_13 = 0x20, magGain_19 = 0x40, magGain_25 = 0x60, magGain_40 = 0x80,
                   magGain_47 = 0xA0, magGain_56 = 0xC0, magGain_81 = 0xE0 };

    LSM303(void);
    
    void init(byte device = LSM303_DEVICE_AUTO, byte sa0_a = LSM303_SA0_A_AUTO);
    byte getDeviceType(void) { return _device; }
    
    void enableDefault(void);
    
    void writeAccReg(byte reg, byte value);
    byte readAccReg(byte reg);
    void writeMagReg(byte reg, byte value);
    byte readMagReg(int reg);

    void setMagGain(magGain value);
    
    void readAcc(void);
    void readMag(void);
    void read(void);

    void setTimeout(unsigned int timeout);
    unsigned int getTimeout(void);
    bool timeoutOccurred(void);
    
    int heading(void);
    int heading(vector from);
    
    // vector functions
    static void vector_cross(const vector *a, const vector *b, vector *out);
    static float vector_dot(const vector *a,const vector *b);
    static void vector_normalize(vector *a);
    
  private:
    byte _device; // chip type (DLH, DLM, or DLHC)
    byte acc_address;
    unsigned int io_timeout;
    bool did_timeout;
    
    byte detectSA0_A(void);
};

#endif


