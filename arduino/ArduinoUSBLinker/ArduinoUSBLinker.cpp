#line 1 "ArduinoUSBLinker.ino"
/*
Copyright (C) 2012-2013 Chris Osgood <chris at luadev.com>

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
version 2 as published by the Free Software Foundation.  No
other versions are acceptable.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
02110-1301, USA.
*/

///////////////////////////////////////////////////////////////////////////////

// Check for MultiWii
#if defined(MSP_VERSION)
  #define MULTIWII
#else
  #include <EEPROM.h>
#endif

#define AUL_SERIALRATE 19200

#define AUL_MIN_BITTIME 4
#define AUL_MAX_BITTIME 136
#define AUL_DEFAULT_BITTIME 32

#define AUL_MICROS_TO_TICKS(x)  ((x) * (F_CPU / 1000000) / g_timerScale)
#define AUL_MICROS_TO_TICKS_R(x) ((x) * g_timerScale / (F_CPU / 1000000))

#if defined(__AVR_ATmega8__)
#define AUL_SET_TIMER_MODE TCCR2 = g_timerConfig
#else
#define AUL_SET_TIMER_MODE TCCR2B = g_timerConfig
#endif

// Default PD2/INT0
#define AUL_DEFAULT_PIN 51 //18 was working, 15 is digital pin 6 (pwm)

#define AUL_BUFSIZE 300

#define AUL_SERIALTIMEOUT ((F_CPU >> 7) / (9600 >> 4))

#define AUL_PININPUT  ((*g_signalDDR)  &= ~(g_signalPinPortNum))
#define AUL_PINOUTPUT ((*g_signalDDR)  |=  (g_signalPinPortNum))
#define AUL_PINHIGH   ((*g_signalPORT) |=  (g_signalPinPortNum))
#define AUL_PINLOW    ((*g_signalPORT) &= ~(g_signalPinPortNum))

#define AUL_PINREAD   ((*g_signalPIN) & (g_signalPinPortNum))

#define AUL_DELAYTICKS(x) \
  TCNT2 = 0; \
  while (TCNT2 < (x));

#if defined(__AVR_ATmega8__)
#define AUL_SYNC_PRESCALER \
  SFIOR = (1 << PSR2); \
  while (SFIOR & (1 << PSR2));
#else
#define AUL_SYNC_PRESCALER \
  GTCCR = (1 << PSRASY); \
  while (GTCCR & (1 << PSRASY));
#endif

// Save space on MultWii since baud rate changes are not supported and it is the
// only thing that requires a value greater than uint8
#if defined(MULTIWII)
  #define AUL_ASCII_INT_TYPE uint8_t
#else
  #define AUL_ASCII_INT_TYPE uint32_t
#endif

#define AUL_EEPROM_PIN 4
#define AUL_EEPROM_BITTIME 5
#define AUL_EEPROM_BAUD 6

///////////////////////////////////////////////////////////////////////////////
// Globals
///////////////////////////////////////////////////////////////////////////////

#include "Arduino.h"
static char* AUL_itoa(AUL_ASCII_INT_TYPE n, char *b);
static AUL_ASCII_INT_TYPE AUL_atoi(const char* s);
static void AUL_SerialInit(uint8_t port);
static void AUL_SerialWriteBuf(const uint8_t* b, int16_t len);
static void AUL_SerialWriteStr(const char* b);
static void DisableAllTimers();
static void SignalPinStatus(char* buf);
static void SignalPinInit(int8_t pin);
static void SendByte(uint8_t b);
static int8_t ReadLeader();
static void SetBitTime(uint16_t t);
static uint32_t EERead32(int pos);
static void EEWrite32(int pos, uint32_t value);
void AUL_loop(uint8_t port);
int main(int argc, char* argv[]);
#line 89
static uint8_t g_timerConfig;
static uint16_t g_timerScale;

// Approximate microseconds for each bit when sending
static uint8_t g_bitTimeSend;
static uint8_t g_bitTimeSendHalf;

// Calculated leader timing for receive
static uint8_t g_bitTime, g_shortBitTime;

static volatile uint8_t* g_signalDDR;
static volatile uint8_t* g_signalPORT;
static volatile uint8_t* g_signalPIN;
static int8_t g_signalPinPortNum, g_signalPinNum;

#if defined(MULTIWII)
static uint32_t g_baudRate = 0;
#else
static uint32_t g_baudRate = AUL_SERIALRATE;
#endif

///////////////////////////////////////////////////////////////////////////////
// stdlib type utility functions (mostly to save space)
///////////////////////////////////////////////////////////////////////////////

// int to ASCII base 10
// Returns the address of the null terminator
static char* AUL_itoa(AUL_ASCII_INT_TYPE n, char *b)
{
   uint8_t i = 0, s;
   
   do {
      s = n % 10;
      n = n / 10;
      b[i++] = '0' + s;
   } while (n > 0);

   b[i] = '\0';
   
   strrev(b);
   
   return &b[i];
}

// ASCII to int base 10
static AUL_ASCII_INT_TYPE AUL_atoi(const char* s)
{
  AUL_ASCII_INT_TYPE b = 0;
  while (*s) b = (b << 3) + (b << 1) + (*s++ - '0');
  return(b);
}

///////////////////////////////////////////////////////////////////////////////
// Serial port.  MultiWii helpers.
///////////////////////////////////////////////////////////////////////////////

#if !defined(MULTIWII)

#define AUL_SerialInit(x) Serial.begin(g_baudRate)
#define AUL_SerialAvailable() Serial.available()
#define AUL_SerialRead() Serial.read()
#define AUL_SerialWrite(x) Serial.write(x)
#define AUL_SerialWriteBuf(x,y) Serial.write(x,y)
#define AUL_SerialWriteStr(x) Serial.write((const char*)x)

#else // MULTIWII

static volatile uint8_t* g_serialUCSRA;
static volatile uint8_t* g_serialUDR;
static uint8_t g_serialRXC, g_serialUDRE;

static void AUL_SerialInit(uint8_t port)
{
  #define AUL_INIT_PORT(x) \
    UCSR##x##C = (1 << UCSZ##x##1) | (1 << UCSZ##x##0); \
    UCSR##x##B = (1 << RXEN##x) | (1 << TXEN##x); \
    g_serialUCSRA = &UCSR##x##A; \
    g_serialUDR = &UDR##x; \
    g_serialRXC = (1 << RXC##x); \
    g_serialUDRE = (1 << UDRE##x);
  
  switch (port)
  {
  case 0:
    AUL_INIT_PORT(0)
    break;
  #if defined(UBRR1H)
  case 1:
    AUL_INIT_PORT(1)
    break;
  #endif
  #if defined(UBRR2H)
  case 2:
    AUL_INIT_PORT(2)
    break;
  #endif
  #if defined(UBRR3H)
  case 3:
    AUL_INIT_PORT(3)
    break;
  #endif
  #if defined(UBRR4H)
  case 4:
    AUL_INIT_PORT(4)
    break;
  #endif
  default:
    break;
  }
}

#define AUL_SerialAvailable() \
  ((*g_serialUCSRA) & g_serialRXC)

#define AUL_SerialRead() \
  (*g_serialUDR)

#define AUL_SerialWrite(x) \
  { while (!((*g_serialUCSRA) & g_serialUDRE)); (*g_serialUDR) = (x); }

static void AUL_SerialWriteBuf(const uint8_t* b, int16_t len)
{
  int16_t i;
  for (i = 0; i < len; i++)
    AUL_SerialWrite(b[i]);
}

static void AUL_SerialWriteStr(const char* b)
{
  int16_t i;
  for (i = 0; b[i] != '\0'; i++)
    AUL_SerialWrite(b[i]);
}

#endif // MULTIWII

///////////////////////////////////////////////////////////////////////////////
// Signal pin
///////////////////////////////////////////////////////////////////////////////

// Clear all timers and PWM settings
static void DisableAllTimers()
{
  #define AUL_RESET_PORT(x) \
    TCCR##x##B = 0; \
    TCCR##x##A = 0;

  // For mega8 and similar
  #if defined(TCCR0)
    TCCR0 = 0;
  #endif
  #if defined(TCCR1)
    TCCR1 = 0;
  #endif
  #if defined(TCCR2)
    TCCR2 = 0;
  #endif
  
  #if defined(TCCR0B)
    AUL_RESET_PORT(0)
  #endif
  #if defined(TCCR1B)
    AUL_RESET_PORT(1)
  #endif
  #if defined(TCCR2B)
    AUL_RESET_PORT(2)
  #endif
  #if defined(TCCR3B)
    AUL_RESET_PORT(3)
  #endif
  #if defined(TCCR4B)
    AUL_RESET_PORT(4)
  #endif
  #if defined(TCCR5B)
    AUL_RESET_PORT(5)
  #endif
  #if defined(TCCR6B)
    AUL_RESET_PORT(6)
  #endif
}

static void SignalPinStatus(char* buf)
{
  #define AUL_WRITE_PORT_INFO(x) \
    *pos++ = #x[0]; \
    pos = AUL_itoa(pincnt, pos); \
    *pos++ = ':'; \
    pincnt += 8;

  char* pos = buf;
  int8_t pincnt = 0;

  pos[0] = 'P';
  pos[1] = 'I';
  pos[2] = 'N';
  pos[3] = 'S';
  pos[4] = ':';
  pos += 5;
  
  #if defined(PORTB)
    AUL_WRITE_PORT_INFO(B)
  #endif
  #if defined(PORTC)
    AUL_WRITE_PORT_INFO(C)
  #endif
  #if defined(PORTD)
    AUL_WRITE_PORT_INFO(D)
  #endif
  #if defined(PORTE)
    AUL_WRITE_PORT_INFO(E)
  #endif
  #if defined(PORTF)
    AUL_WRITE_PORT_INFO(F)
  #endif
  #if defined(PORTG)
    AUL_WRITE_PORT_INFO(G)
  #endif
  #if defined(PORTH)
    AUL_WRITE_PORT_INFO(H)
  #endif
  #if defined(PORTI)
    AUL_WRITE_PORT_INFO(I)
  #endif
  #if defined(PORTJ)
    AUL_WRITE_PORT_INFO(J)
  #endif
  #if defined(PORTK)
    AUL_WRITE_PORT_INFO(K)
  #endif
  #if defined(PORTL)
    AUL_WRITE_PORT_INFO(L)
  #endif
  
  #if defined(PORTA)
    AUL_WRITE_PORT_INFO(A)
  #endif
  
  *pos = '\0';
}

static void SignalPinInit(int8_t pin)
{
  #define AUL_SETUP_PORT(x) \
    if (pin < (pincnt += 8)) \
    { \
      g_signalDDR = &DDR##x; \
      g_signalPORT = &PORT##x; \
      g_signalPIN = &PIN##x; \
      g_signalPinPortNum = (1 << (pin - (pincnt - 8))); \
      goto finished; \
    }
  
  int8_t pincnt = 0;
  
  g_signalPinNum = pin;

  #if defined(PORTB)
    AUL_SETUP_PORT(B);
  #endif
  #if defined(PORTC)
    AUL_SETUP_PORT(C);
  #endif
  #if defined(PORTD)
    AUL_SETUP_PORT(D);
  #endif
  #if defined(PORTE)
    AUL_SETUP_PORT(E);
  #endif
  #if defined(PORTF)
    AUL_SETUP_PORT(F);
  #endif
  #if defined(PORTG)
    AUL_SETUP_PORT(G);
  #endif
  #if defined(PORTH)
    AUL_SETUP_PORT(H);
  #endif
  #if defined(PORTI)
    AUL_SETUP_PORT(I);
  #endif
  #if defined(PORTJ)
    AUL_SETUP_PORT(J);
  #endif
  #if defined(PORTK)
    AUL_SETUP_PORT(K);
  #endif
  #if defined(PORTL)
    AUL_SETUP_PORT(L);
  #endif
  
  #if defined(PORTA)
    AUL_SETUP_PORT(A);
  #endif

finished:  
  AUL_PINHIGH; // Enable pull-up
  AUL_PININPUT;
}

///////////////////////////////////////////////////////////////////////////////
// SENDING on signal pin
///////////////////////////////////////////////////////////////////////////////

static void SendByte(uint8_t b)
{
  uint8_t i;
  for (i = 1; i; i <<= 1)
  {
    if (b & i)
    {
      AUL_PINHIGH;
      AUL_DELAYTICKS(g_bitTimeSend);
      AUL_PINLOW;
      AUL_DELAYTICKS(g_bitTimeSend);
    }
    else
    {
      AUL_PINHIGH;
      AUL_DELAYTICKS(g_bitTimeSendHalf);
      AUL_PINLOW;
      AUL_DELAYTICKS(g_bitTimeSendHalf);
      AUL_PINHIGH;
      AUL_DELAYTICKS(g_bitTimeSendHalf);
      AUL_PINLOW;
      AUL_DELAYTICKS(g_bitTimeSendHalf);
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
// RECEIVE on signal pin
///////////////////////////////////////////////////////////////////////////////

#define AUL_SPINPINHIGH \
  TCNT2 = 0; \
  while (AUL_PINREAD) { if (TCNT2 > 250) goto timeout; }

#define AUL_SPINPINLOW \
  TCNT2 = 0; \
  while (!AUL_PINREAD) { if (TCNT2 > 250) goto timeout; }

#define AUL_NT_SPINPINHIGH \
  while (AUL_PINREAD) { if (TCNT2 > 250) goto timeout; }

#define AUL_NT_SPINPINLOW \
  while (!AUL_PINREAD) { if (TCNT2 > 250) goto timeout; }

#define AUL_READBIT \
  AUL_SPINPINHIGH \
  AUL_NT_SPINPINLOW \
  if (TCNT2 <= g_shortBitTime) \
  { \
    AUL_SPINPINHIGH \
    AUL_NT_SPINPINLOW \
    b = 0; \
  } \
  else \
    b = 1;

static int8_t ReadLeader()
{
  uint8_t i;
  
  // Skip the first few to let things stabilize
  for (i = 0; i < 9; i++)
  {
    AUL_SPINPINHIGH
    AUL_NT_SPINPINLOW
  }

#ifndef AUL_FIXED_TIMING
  // Calculate timing from header
  AUL_SPINPINHIGH
  AUL_NT_SPINPINLOW
  g_bitTime = TCNT2;
  g_shortBitTime = (g_bitTime >> 1) + (g_bitTime >> 2);
#else
  // Use fixed timing
  g_bitTime = g_bitTimeSend << 1;
  g_shortBitTime = g_bitTimeSend + g_bitTimeSendHalf;
#endif

  // Read until we get a 0 bit
  while (1)
  {
    uint8_t b;
    AUL_READBIT // Sets b to the bit value
    
    if (!b)
      return 0;
  }

timeout:
  return -1;
}

static void SetBitTime(uint16_t t)
{
  if (t < AUL_MIN_BITTIME)
    t = AUL_MIN_BITTIME;
  else if (t > AUL_MAX_BITTIME)
    t = AUL_MAX_BITTIME;

  if (t * (F_CPU / 1000000) < 242)
  {
    g_timerScale = 2;
    g_timerConfig = (1 << CS20);
  }
  else if (t * (F_CPU / 1000000) / 8 < 242)
  {
    g_timerScale = 16;
    g_timerConfig = (1 << CS21);
  }
  else if (t * (F_CPU / 1000000) / 32 < 242)
  {
    g_timerScale = 64;
    g_timerConfig = (1 << CS21) | (1 << CS20);
  }
  else
  {
    return; // invalid time, no change
  }

  g_bitTimeSend = AUL_MICROS_TO_TICKS(t);
  g_bitTimeSendHalf = (g_bitTimeSend >> 1);
}

#if !defined(MULTIWII)
static uint32_t EERead32(int pos)
{
  uint32_t value;
  ((char*)&value)[0] = EEPROM.read(pos);
  ((char*)&value)[1] = EEPROM.read(pos + 1);
  ((char*)&value)[2] = EEPROM.read(pos + 2);
  ((char*)&value)[3] = EEPROM.read(pos + 3);
  return value;
}

static void EEWrite32(int pos, uint32_t value)
{
  EEPROM.write(pos, ((char*)&value)[0]);
  EEPROM.write(pos + 1, ((char*)&value)[1]);
  EEPROM.write(pos + 2, ((char*)&value)[2]);
  EEPROM.write(pos + 3, ((char*)&value)[3]);
}
#endif // !MULTIWII

///////////////////////////////////////////////////////////////////////////////
// Main
///////////////////////////////////////////////////////////////////////////////

void AUL_loop(uint8_t port)
{
  // Disable interrupts and timers
  cli();
  DisableAllTimers();
  
  #if defined(MULTIWII)
    #if defined(BUZZERPIN_OFF)
      BUZZERPIN_OFF;
    #endif
    #if defined(LEDPIN_OFF)
      LEDPIN_OFF;
    #endif
  #endif
  
  #if defined(MULTIWII)
    AUL_SerialInit(port);
    SetBitTime(AUL_DEFAULT_BITTIME);
    SignalPinInit(AUL_DEFAULT_PIN);
  #else
    if (EEPROM.read(0) != 'a' ||
        EEPROM.read(1) != 'u' ||
        EEPROM.read(2) != 'l')
    {
      EEPROM.write(0, 'a');
      EEPROM.write(1, 'u');
      EEPROM.write(2, 'l');
      EEPROM.write(3, 1); // version
      EEPROM.write(AUL_EEPROM_PIN, AUL_DEFAULT_PIN);
      EEPROM.write(AUL_EEPROM_BITTIME, AUL_DEFAULT_BITTIME);
      EEWrite32(AUL_EEPROM_BAUD, AUL_SERIALRATE);
    }

    SignalPinInit(EEPROM.read(AUL_EEPROM_PIN));  
    SetBitTime(EEPROM.read(AUL_EEPROM_BITTIME));

    g_baudRate = EERead32(AUL_EEPROM_BAUD);
    AUL_SerialInit(port);
    
    sei(); // Re-enable interrupts for Serial
  #endif

  // Set timer2 to count ticks
  AUL_SET_TIMER_MODE;

  // The buffer always has the leader at the start
  uint8_t buf[AUL_BUFSIZE] = { 0xFF, 0xFF, 0x7F };
  uint8_t lastPin = 0;
  int16_t buflen, i;

  while (1)
  {
    if (AUL_SerialAvailable())
    {
      buflen = 3;
      buf[buflen++] = AUL_SerialRead();
  
      // Temporarily set timer2 to count ticks/128
#if defined(__AVR_ATmega8__)
      TCCR2 = (1 << CS22) | (1 << CS20);  
#else
      TCCR2B = (1 << CS22) | (1 << CS20);  
#endif
      AUL_SYNC_PRESCALER;
      TCNT2 = 0;     
      // Buffer data until the serial timeout
      do {
         if (AUL_SerialAvailable())
         {
           buf[buflen++] = AUL_SerialRead();
           TCNT2 = 0;
         }
      } while (TCNT2 < AUL_SERIALTIMEOUT);
      
      // Set timer2 back to normal
      AUL_SET_TIMER_MODE;
      
      if (buf[3] == '$' && buf[4] == 'M' && buf[5] == '<')
      {
#if !defined(MULTIWII)
        int8_t setbaud = 0;
#endif

        buf[buflen] = '\0';
        
        switch(buf[6])
        {
        case 'B': { // BITTIME
          SetBitTime(AUL_atoi((const char*)&buf[7]));
          break; }
        case 'P': // SELECT PORT
          SignalPinInit(AUL_atoi((const char*)&buf[7]));
          break;
#if !defined(MULTIWII)
        case 'R': // BAUD RATE
          g_baudRate = AUL_atoi((const char*)&buf[7]);

          if (g_baudRate < 9600)
            g_baudRate = 9600;

          setbaud = 1;
          break;
        case 'W': // WRITE EEPROM settings
          EEPROM.write(AUL_EEPROM_PIN, g_signalPinNum);
          EEPROM.write(AUL_EEPROM_BITTIME, AUL_MICROS_TO_TICKS_R(g_bitTimeSend));
          EEWrite32(AUL_EEPROM_BAUD, g_baudRate);
          AUL_SerialWriteStr("saved:");
          break;
#endif // !MULTIWII
        default:
          break;
        }
        
        // Send status afterwards
        char* pos = (char*)&buf[3];
        *pos++ = 'P';
        pos = AUL_itoa(g_signalPinNum, pos);
        pos[0] = ':';
        pos[1] = 'B';
        pos += 2;
        pos = AUL_itoa(AUL_MICROS_TO_TICKS_R(g_bitTimeSend), pos);
        pos[0] = ':';
        pos[1] = 'R';
        pos += 2;
        pos = AUL_itoa(g_baudRate, pos);
        *pos++ = ':';
        
        SignalPinStatus(pos);
        
        AUL_SerialWriteStr((const char*)&buf[3]);
        AUL_SerialWrite('\n');
        
#if !defined(MULTIWII)
        if (setbaud)
        {
          // Arduino Serial.flush does not work correctly
          Serial.flush();
          
          // Temporarily set timer2 to count ticks/128
#if defined(__AVR_ATmega8__)
          TCCR2 = (1 << CS22) | (1 << CS20);  
#else
          TCCR2B = (1 << CS22) | (1 << CS20);  
#endif
          AUL_DELAYTICKS(AUL_SERIALTIMEOUT);
          AUL_DELAYTICKS(AUL_SERIALTIMEOUT);
          AUL_SET_TIMER_MODE;
          
          AUL_SerialInit(port);
        }
#endif // !MULTIWII
      }
      else
      {
        AUL_PINOUTPUT;
        AUL_SYNC_PRESCALER;

        // Send data over signal pin
        for (i = 0; i < buflen; i++)
          SendByte(buf[i]);
    
        // Trailer
        AUL_PINHIGH;
        AUL_DELAYTICKS(g_bitTimeSendHalf);

        AUL_PININPUT; // Pull-up is enabled from previous PINHIGH
        lastPin = 1;
      }
    }
    else
    {
      // Here we look for a low to high transition on the signal pin
      uint8_t curPin = AUL_PINREAD;
      
      if (!lastPin && curPin)
      {
        AUL_SYNC_PRESCALER;
        
        // Buffer data from signal pin then write to serial port
        if (ReadLeader() == 0)
        {
          uint8_t i, byt, b;
          buflen = 3;
          
          // Read bytes until timeout
          while (1)
          {
            for (i = 0, byt = 0; i < 8; i++)
            {
              AUL_READBIT // Sets b to the bit value
              byt |= b << i;
            }
            
            buf[buflen++] = byt;
          }

timeout:
          AUL_SerialWriteBuf(&buf[3], buflen - 3);
        }
      }

      lastPin = curPin;
    }
  }
}

#if !defined(MULTIWII)

int main(int argc, char* argv[])
{
  pinMode(16, OUTPUT);  
  digitalWrite(16, HIGH);   // turn the ESC Power on
  AUL_loop(0);
  return 0;
}

#endif // !MULTIWII



