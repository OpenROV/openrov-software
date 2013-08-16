#include "Command.h"


 #define DATABUFFERSIZE      80
 static char dataBuffer[DATABUFFERSIZE+1]; //Add 1 for NULL terminator
 static byte dataBufferIndex = 0;

 const char endChar = ';'; // or '!', or whatever your end character is
 static boolean storeString = false; //This will be our flag to put the data in our buffer
 

boolean getSerialString(){
    static byte dataBufferIndex = 0;
    while(Serial.available()>0){
        char incomingbyte = Serial.read();
 //       if(incomingbyte==startChar){
 //           dataBufferIndex = 0;  //Initialize our dataBufferIndex variable
       if (storeString == false) {
         storeString = true;
         dataBufferIndex=0;
        }
        if(storeString){
            //Let's check our index here, and abort if we're outside our buffer size
            //We use our define here so our buffer size can be easily modified
            if(dataBufferIndex==DATABUFFERSIZE){
                //Oops, our index is pointing to an array element outside our buffer.
                dataBufferIndex = 0;
                break;
            }
            if(incomingbyte==endChar){
                dataBuffer[dataBufferIndex] = 0; //null terminate the C string
                storeString = false;
                //Our data string is complete.  return true
                return true;
            }
            else{
                dataBuffer[dataBufferIndex++] = incomingbyte;
                dataBuffer[dataBufferIndex] = 0; //null terminate the C string
            }
        }
        else{
        }
    }
   
    //We've read in all the available Serial data, and don't have a valid string yet, so return false
    return false;
}

    int Command::_array[MAX_ARGS];
    bool Command::_parsed;
    String Command::cmd;
    String Command::value;
    int Command::args[MAX_ARGS];


// match from command received
boolean Command::cmp(String a){
  boolean match = cmd.startsWith(a);
//  if (match) value = a;
  return match;
}

// get string from buffer
String Command::get(){
  Command::cmd = "";
  if(getSerialString()){
    //String available for parsing.  Parse it here
     Command::cmd = dataBuffer;
     Serial.print(F("cmd:"));     
     Serial.println(Command::cmd);

     parse();
  }

  return Command::cmd;
}

// get 'arguments' from command
void Command::parse(){

  String temp = Command::cmd;
  
  Serial.print(F("log:temp|"));
  Serial.print(temp);
  Serial.println(';'); 
  
  value = "";
  for (unsigned i = 0; i < temp.length(); i++){
    char t = temp[i];
    if ((t == '(') || (t == ';')) break;
    value += temp[i];
  }

  Serial.print(F("log:ParsedValue|"));
  Serial.print(value);
  Serial.println(';'); 
  
  temp.replace(value, "");
  temp.replace("(", "");
  temp.replace(")", "");
      
  String val = "";
  int len = 1;
  
  for (unsigned i = 0; i < temp.length(); i++){
    char t = temp[i];
    Serial.print(F("log:Pt|"));
    Serial.print(t);
    Serial.println(';');    
    if (t != ','){  // if not argument delimiter
      val += t;
    }
    else {
      args[len] = atoi(&val[0]);
      len++;
      val = "";
    }
  }
  
  args[len] = atoi(&val[0]);
  args[0] = len;
  for (int i=0;i<=len;i++){
      Serial.print(F("log:Parsed|"));
      Serial.print(args[i]);
      Serial.println(';');  
  }
  _parsed = true;
}


