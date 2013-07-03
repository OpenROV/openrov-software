
#ifndef __COMMAND_H_
#define __COMMAND_H_
#include <Arduino.h>

#define MAX_ARGS 10

class Command {
  private:
    int _array[MAX_ARGS];
    bool _parsed;
    		
  public:
    String cmd;
    String value;
    Command(){value = "";};
    String get();
    boolean cmp(String a);
    int* args();
    void parse(int array[MAX_ARGS]);
};


#endif
