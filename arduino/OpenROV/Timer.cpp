#include "Timer.h"

Timer::Timer() {
    reset();
}

boolean Timer::elapsed(unsigned long milliseconds) {
    if (now() - last > milliseconds) {
        last = now();
        return true;
    }
    return false;
}

void Timer::reset() {
    start = millis();
    last = start;
}