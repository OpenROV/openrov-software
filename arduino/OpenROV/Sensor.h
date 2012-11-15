
#ifndef __Sensor_H_
#define __Sensor_H_
#include <Arduino.h>

#define MAX_LEN 50

class Sensor {
    
  private:
    static const char SEPARATER = ':';
    static const char DELIMITER = ';';
    String name;
    int pin;
    int value;
    boolean is_digital;
    boolean is_input;

  public:
    static const boolean analog = false;
    static const boolean digital = true;
    static const boolean out = false;
    static const boolean in = true;
    
    Sensor(String sensor_name, int pin_number, boolean digital_truth, boolean in_out);
    Sensor(String sensor_name, int pin_number, boolean digital_truth);
    void send(int val);
    int read();
    void write(int val);
    void reset();
    String string();
    
};


#endif
