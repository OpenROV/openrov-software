
#ifndef __COMMAND_H_
#define __COMMAND_H_
#include <Arduino.h>

#define MAX_ARGS 10

class Command {
  private:
		
  public:
    String cmd;
    String value;
    Command(){value = "";};
    String get();
    boolean cmp(String a);
    void parse(int array[MAX_ARGS]);
};


#endif
