#include <Servo.h>

void rov_analog_write();

Servo tilt, light, port, vertical, starbord;

int speed_offset = 31, l = 0, MIDPOINT = 128, 
    p = MIDPOINT, v = MIDPOINT, s = MIDPOINT, t = MIDPOINT;
    
int count;

void setup(){

  Serial.begin(9600);
 
  tilt.attach(5);
  light.attach(6);
  port.attach(9);
  vertical.attach(10);
  starbord.attach(11);

  count = 0;
}

void loop(){
  // ========================================================================================
  // ========================================================================================
  // Get commands from OpenROV
  // ========================================================================================
  // ========================================================================================
  
  if (Serial.available()) {
    delay(30); // number of characters to be read?  buffer delay (TODO:  affects timing of sensors... fix this?)
    String cmd = "";
    char in;
    while(Serial.available() > 0) { // read full string
      in = Serial.read();
      if (in == ';') break;
      cmd += in;  // concat each char to string
    }
    
    // Parse command from Beaglebone
    if      (cmd == "move_up") { vertical.write(MIDPOINT + speed_offset); }
    else if (cmd == "move_down") { vertical.write(MIDPOINT - speed_offset); }
    else if (cmd == "move_forward") { port.write(MIDPOINT + speed_offset); starbord.write(MIDPOINT + speed_offset); }
    else if (cmd == "move_aft") { port.write(MIDPOINT - speed_offset); starbord.write(MIDPOINT - speed_offset); }
    else if (cmd == "rotate_left") { port.write(MIDPOINT - speed_offset); starbord.write(MIDPOINT + speed_offset); }
    else if (cmd == "rotate_right") { port.write(MIDPOINT + speed_offset); starbord.write(MIDPOINT - speed_offset); }
    else if (cmd.startsWith("throttle(")) {
      cmd.replace("throttle(", "");
      cmd.replace(")", "");
      speed_offset = atoi(&cmd[0]);
    }
    else if (cmd.startsWith("go(")) {
      cmd.replace("go(", "");
      cmd.replace(")", "");
      
      int portVal = MIDPOINT, starbordVal = MIDPOINT, verticalVal = MIDPOINT;
      String servoVal = "";
      int nextPort = 0;
      String temp;
      
      for (int i = 0; i < cmd.length(); i++){
        temp = (char*)cmd[i];
        if      (temp != ","){ servoVal += temp; }
        else if (nextPort == 0) { portVal = atoi(&servoVal[0]); nextPort++; servoVal = ""; }
        else if (nextPort == 1) { starbordVal = atoi(&servoVal[0]); nextPort++; servoVal = ""; }
      }
      verticalVal = atoi(&servoVal[0]);
      
      port.write(portVal);
      vertical.write(verticalVal);
      starbord.write(starbordVal);

    }
    else {port.write(MIDPOINT); vertical.write(MIDPOINT); starbord.write(MIDPOINT); }  // stop
    
    //Serial.println(cmd);
  }
  
  // ========================================================================================
  // ========================================================================================
  // Write commands to OpenROV
  // ========================================================================================
  // ========================================================================================
  
  // TODO: make these actually do something, just testing for now
  // once every 1,300 counts
  if (count % 1300 == 0){
    rov_analog_output(1, "float");
  }
  // once every 10,000 counts
  if (count == 10000){
    rov_analog_output(0, "salinity");
    count = 0;  // reset counter (this should be done by the longest "running" counter
  }
  count++;
}

// Actually create and send command
// Example:  rov_analog_output(0, "salinity");
// outputs:  salinity:124;
void rov_analog_output(int pin, String cmd){
  cmd += ":";    // separates command and value
  char cmd_output[50];
  cmd.toCharArray(cmd_output, 50);
  int pin_read = analogRead(pin);
  String pin_read_str = String(pin_read);
  char out[5];
  pin_read_str.toCharArray(out, 5);
    
  Serial.write(cmd_output);
  Serial.write(out);
  Serial.write(";");    // command delimiter
}
