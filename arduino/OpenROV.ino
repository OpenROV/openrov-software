#include <Servo.h>

void rov_analog_write();

Servo tilt, light, port, vertical, starbord;

int speed_offset = 31, l = 0, MIDPOINT = 128, 
    p = MIDPOINT, v = MIDPOINT, s = MIDPOINT, t = MIDPOINT;

unsigned long startTime = millis();  //  time based on hardware register - Timer #0
unsigned long interval1 = 1000; // one second interval
int interval2 = 10; // multiple of interval1
long count = 0; // counter for interval2
unsigned long lastTime = 0;  // use for holding time of last interval

int pin_read = 0; //  holds value of analog read
float voltage = 0;  //  holds scaled value of voltage - adjusted for voltage divider
float scale = 15.0/1023.0;  // scale factor for 3 to 1 voltage divider - 15V reduced to 5V

// Note - this will not be neede for ROV pc board
// led on pin 19 of ATmega328 breadboard to indicate if program is running - connected to pin 13 on Arduino boards
int led = 13;
int blink = 0;  // toggle to blink on/off - period = interval

void setup(){
  
  Serial.begin(9600);
  
  Serial.println();
  Serial.println("Begin");

  // Output elapsed time  
  elapsed_time_output(startTime);
   
  tilt.attach(5);
  light.attach(6);
  port.attach(9);
  vertical.attach(10);
  starbord.attach(11);

  
  // initialize the digital pin as an output for led blink
  pinMode(led, OUTPUT);     

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
  // once every interval1
  if (millis() - lastTime > interval1){
    lastTime = millis();  // reset interval1 timer
    count++; // increment interval2 count
    
    if (blink == 0){
      digitalWrite(led, HIGH);  // turn the led on (HIGH is the voltage level)
      blink = 1;  // reset toggle
    }
    else{
      digitalWrite(led, LOW);    // turn the LED off by making the voltage LOW
      blink = 0;  // reset toggle
    }
    
    rov_analog_output(1, "float");  // output value
  }
  
  // once every interval2
  if (count == interval2){
    count=0;  // reset interval2 counter

    // Output elapsed time  
    elapsed_time_output(startTime);

    pin_read = analogRead(0);                 //  read voltage on pin 0 and output to serial port
    voltage=pin_read*scale;                   //  15V will scale to 5V at analog in pin 0 with 3 to 1 voltage divider
    Serial.print("Battery Voltage:");         //  Connect Battery output to analog pin 0 using voltage divider
    Serial.println(voltage);                  //  Nominal Battery voltage is 12V - analog pin input 0-5V
                                              //  Divide by 3 with voltage divider
                                              
  }
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
  Serial.println();     // newline
}

// Output elapsed time
void elapsed_time_output(unsigned long sTime){
 #define SEC_PER_MIN 60
 #define SEC_PER_HOUR 3600
 unsigned long elapsedTime = (millis() - sTime)/1000;
 Serial.print("Elapsed time is ");
 Serial.print(elapsedTime/SEC_PER_HOUR);
 Serial.print(":");
 Serial.print((elapsedTime/SEC_PER_MIN) % SEC_PER_MIN);
 Serial.print(":");  
 Serial.println(elapsedTime % SEC_PER_MIN);
}
