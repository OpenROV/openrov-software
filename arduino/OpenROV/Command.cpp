#include "Command.h"


 #define DATABUFFERSIZE      80
 static char dataBuffer[DATABUFFERSIZE+1]; //Add 1 for NULL terminator
 static byte dataBufferIndex = 0;
 static boolean commandReady = false;
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
    int Command::args[MAX_ARGS];


// match from command received
boolean Command::cmp(char const* targetcommand){
  if (!commandReady) return false;
  char* pos = strstr(dataBuffer, targetcommand);
  if(pos==dataBuffer) { //starts with
    return true;
  }
  return false;
}

// get string from buffer
boolean Command::get(){
  commandReady = false;
  if(getSerialString()){
    //String available for parsing.  Parse it here
     parse();
     commandReady = true;
     return true;
  }
  return false;
}

// get 'arguments' from command
void Command::parse(){
  char * pch;
  byte i = 0;
  pch = strtok (dataBuffer," ,();");
  while (pch != NULL){
    if (i == 0) {
      //this is the command text
     Serial.print(F("cmd:"));     
     Serial.print(pch);
     Serial.print('(');    
    } else {
      //this is a parameter
      args[i] = atoi(pch);
      if(i>1){
        Serial.print(','); 
      }
      Serial.print(pch); 
    }
    i++;
    pch = strtok (NULL," ,();");
  }
  Serial.println(");"); 
  args[0] = i;
}


