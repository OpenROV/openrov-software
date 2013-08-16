
#ifndef __COMMAND_H_
#define __COMMAND_H_
#include <Arduino.h>

#define MAX_ARGS 10

class Command {
  private:
    static int _array[MAX_ARGS];
    static bool _parsed;
    void parse();
    		
  public:
    static String cmd;
    static String value;
    static int args[MAX_ARGS];
    Command(){value = "";};
    String get();
    boolean cmp(String a);
};


#endif
