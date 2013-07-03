#include "Pin.h"

Pin::Pin(String device_name, int pin_number, boolean digital_truth, boolean in_out){
  name = device_name;
  pin = pin_number;
  is_digital = digital_truth;
  is_input = in_out;
}

Pin::Pin(String device_name, int pin_number, boolean digital_truth){
  name = device_name;
  pin = pin_number;
  is_digital = digital_truth;
  is_input = in;  // default to input
}

void Pin::reset(){
  if (is_digital) {
    if (is_input) {
      pinMode(pin, INPUT);
    }
    else {
      pinMode(pin, OUTPUT);
    }
  }
}

void Pin::send(int val){
  char output[MAX_LEN];
  String temp = name + SEPARATER + (String)val + DELIMITER;
  temp.toCharArray(output, MAX_LEN-1);
  
  Serial.write(output);
}

int Pin::read(){
  if (is_input) {
    if (is_digital) value = digitalRead(pin);
    else value = analogRead(pin);
    return value;
  }
  return -1;
}

void Pin::write(int val){
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

String Pin::string(){
  String dig = (is_digital) ? "1" : "0";
  String inp = (is_input) ? "1" : "0";
  String temp = inp + "__" + dig + "__" + (String)value;
  return temp;
}
