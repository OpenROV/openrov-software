
#ifndef __COMMAND_H_
#define __COMMAND_H_
#include <Arduino.h>

#define MAX_ARGS 10
#define MAX_COMMANDSIZE 40
#define MAX_COMMANDS 10
#define DATABUFFERSIZE      80

class InternalCommand {
  public:
    char cmdtext[DATABUFFERSIZE+1]; //Add 1 for NULL terminator
    int cmdargs[MAX_ARGS];
};

class Command {
  private:
//    static int _array[MAX_ARGS];
    static char _commandText[DATABUFFERSIZE+1];
    void parse();
    		
  public:
    static int args[MAX_ARGS];
    boolean get();
    boolean cmp(char const* a);
    static void pushCommand(char* cmdtext, int cmdargs[MAX_ARGS]);
};


#endif
