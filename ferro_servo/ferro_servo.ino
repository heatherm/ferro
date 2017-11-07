

#include <Servo.h>

Servo servoMain;  // create servo object to control a servo
// twelve servo objects can be created on most boards


void setup() {
  servoMain.attach(13);  // attaches the servo on pin 9 to the servo object
}

void loop() {
  if(Serial.available()){    
      ledValue = Serial.read();   
//      if(ledValue <= 127) ledValue = 0;
//      else ledValue = 1;
      Serial.println(ledValue);   
      analogWrite(ledPin, 45);
      delay(1000);
    } 
}
