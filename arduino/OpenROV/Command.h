
#ifndef __COMMAND_H_
#define __COMMAND_H_
#include <Arduino.h>

#define MAX_ARGS 10
#define MAX_COMMANDSIZE 40
class Command {
  private:
    static int _array[MAX_ARGS];
    void parse();
    		
  public:
    static int args[MAX_ARGS];
    boolean get();
    boolean cmp(char const* a);
};


#endif
