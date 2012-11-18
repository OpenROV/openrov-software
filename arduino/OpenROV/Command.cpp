#include "Command.h"

// match from command received
boolean Command::cmp(String a){
  boolean match = cmd.startsWith(a);
  if (match) value = a;
  return match;
}

// get string from buffer
String Command::get(){
  //delay(30); // number of characters to be read?  buffer delay (TODO:  affects timing of devices... fix this?)
  String command = "";
  char in;
  while(Serial.available() > 0) { // read full string
    in = Serial.read();
    if (in == ';') break;
    command += in;  // concat each char to string
  }
  cmd = command;
  return cmd;
}

// get 'arguments' from command
void Command::parse(int array[MAX_ARGS]){
  String temp = cmd;
  temp.replace(value, "");
  temp.replace("(", "");
  temp.replace(")", "");
      
  String val = "";
  int len = 1;
  
  for (int i = 0; i < temp.length(); i++){
    char t = temp[i];
    if (t != ','){  // if not argument delimiter
      val += t;
    }
    else {
      array[len] = atoi(&val[0]);
      len++;
      val = "";
    }
  }
  
  array[len] = atoi(&val[0]);
  array[0] = len;
}
