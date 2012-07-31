#include "Sensor.h"

Sensor::Sensor(String sensor_name, int pin_number, boolean digital_truth, boolean in_out){
  name = sensor_name;
  pin = pin_number;
  is_digital = digital_truth;
  is_input = in_out;
}

Sensor::Sensor(String sensor_name, int pin_number, boolean digital_truth){
  name = sensor_name;
  pin = pin_number;
  is_digital = digital_truth;
  is_input = in;  // default to input
}

void Sensor::reset(){
  if (is_digital) {
    if (is_input) {
      pinMode(pin, INPUT);
    }
    else {
      pinMode(pin, OUTPUT);
    }
  }
  Serial.print("Digital: ");
  Serial.println(is_digital);
  Serial.print("Input: ");
  Serial.println(is_input);
}

void Sensor::send(int val){
  char output[MAX_LEN];
  String temp = name + SEPARATER + (String)val + DELIMITER;
  temp.toCharArray(output, MAX_LEN);
  
  Serial.write(output);
}

int Sensor::read(){
  if (is_input) {
    if (is_digital) value = digitalRead(pin);
    else value = analogRead(pin);
    return value;
  }
  return -1;
}

void Sensor::write(int val){
  if (!is_input){
    if (is_digital){
      if (val == 0) digitalWrite(pin, LOW);
      else digitalWrite(pin, HIGH);
    }
    else {
      analogWrite(pin, val);
    }
  }
  value = val;
}

String Sensor::string(){
  //String dig = "";
  String dig = (is_digital) ? "1" : "0";
  String inp = (is_input) ? "1" : "0";
  //if (is_digital) dig = "1";
  //else dig = "0";
  //String inp = "";
  //if (is_input) inp = "1";
  //else inp = "0";
  String temp = inp + "__" + dig + "__" + (String)value;
  return temp;
}
