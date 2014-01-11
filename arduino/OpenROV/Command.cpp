#include "Command.h"



 static char dataBuffer[DATABUFFERSIZE+1]; //Add 1 for NULL terminator
 static byte dataBufferIndex = 0;
 static boolean commandReady = false;
 const char endChar = ';'; // or '!', or whatever your end character is
 static boolean storeString = false; //This will be our flag to put the data in our buffer
 static InternalCommand internalCommandBuffer[MAX_COMMANDS];
 static int internalCommandBuffer_head =0;
 static int internalCommandBuffer_tail =0; 

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

 //   int Command::_array[MAX_ARGS];
    int Command::args[MAX_ARGS];
    char Command::_commandText[DATABUFFERSIZE+1] ;


// match from command received
boolean Command::cmp(char const* targetcommand){
  if (!commandReady) return false;
  char* pos = strstr(_commandText, targetcommand);
  if(pos==_commandText) { //starts with
    return true;
  }
  return false;
}

// get string from buffer
boolean Command::get(){
  commandReady = false;
  strcpy(_commandText,"");
  for (int i = 0;i<MAX_ARGS;i++){args[i]=0;}
 
  if(getSerialString()){
    //String available for parsing.  Parse it here
     parse();
     commandReady = true;
     return true;
  }
  if (internalCommandBuffer_head != internalCommandBuffer_tail){
     //get from the command buffer
     InternalCommand c = internalCommandBuffer[internalCommandBuffer_tail];
     internalCommandBuffer_tail++;
     if (internalCommandBuffer_tail == MAX_COMMANDS) internalCommandBuffer_tail =0;
     strcpy(_commandText,c.cmdtext);
     if (_commandText==""){
      Serial.print(F("icmd: CMD MUNGED!;")); 
      return false;  
     }
     Serial.print(F("icmd:"));     
     Serial.print(_commandText);
     Serial.print('(');
     for(int i = 1; i<c.cmdargs[0]+1; i++){
       args[i] = c.cmdargs[i];
        if(i>1){
          Serial.print(','); 
        }
        Serial.print(args[i]);        
     }
     //need to add the trailing # of arguments to the count or else have people do it in the call which sucks.

     commandReady = true;

     Serial.println(");"); 
     return true;
  }

  return false;
}

void Command::pushCommand(char* cmdtext, int cmdargs[MAX_ARGS]){
//if commands are not being processed in time we overwrite the oldest ones.  Technically we should probably
//have a global array for all possible commands where only the most recent is ever processed to prevent
//stale messages from floating around.
    InternalCommand c;
    strcpy(c.cmdtext,cmdtext);
    if (strlen(c.cmdtext) <1) {
        Serial.print(F("pushcmd: cmdtext MUNGED!;")); 
    }
    for(int i = 0; i<cmdargs[0]+1; i++){
      c.cmdargs[i] = cmdargs[i];
    }    
    
    internalCommandBuffer_head++;
    if (internalCommandBuffer_head==MAX_COMMANDS) internalCommandBuffer_head=0;
    if (internalCommandBuffer_head==internalCommandBuffer_tail) internalCommandBuffer_tail++;
    if (internalCommandBuffer_tail==MAX_COMMANDS) internalCommandBuffer_tail=0;
    internalCommandBuffer[internalCommandBuffer_head] = c; 
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
     strcpy(_commandText,pch);
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
  args[0] = i-1;
}


