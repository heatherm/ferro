#include <Servo.h>

#define MAX_MILLIS_TO_WAIT 100

Servo myservo;
int input;
int button1 = 4;
int button2 = 5;

int servoSpeed = 90;
int pot1 = A1;
int lastPot1Value;

unsigned long starttime;

byte outgoing[2];
byte incoming[2];

void setup() {
  Serial.end();
  myservo.attach(13);
  Serial.begin(9600);

  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }

  for (int i=0; i<2; i++) {
    outgoing[i] = byte(0);
    incoming[i] = byte(0);
  }
  
  pinMode(button1, INPUT);
  pinMode(button2, INPUT);

  digitalWrite(button1, LOW);
  digitalWrite(button2, LOW);
  
  myservo.write(servoSpeed);
  lastPot1Value = analogRead(A1);
}

void loop() {
  // receive 2 bytes
  starttime = millis();
  while ( (Serial.available() < 2) && ((millis() - starttime) < MAX_MILLIS_TO_WAIT) ) {
    // hang in this loop until we either get 2 bytes of data or 1 second
    // has gone by
  }
  if (Serial.available() < 2) {
    // the data didn't come in - handle that problem here
    Serial.flush();
  } else {
    for(int n=0; n < 2; n++) {
      incoming[n] = Serial.read(); // Then: Get them.
    }
    if (incoming[0] == 227) {
      myservo.write(servoSpeed);
    }
    else if (incoming[0] == 226) {
      myservo.write(incoming[1]);
    }
  }
  
  // send button presses  
  if (digitalRead(button1) == HIGH) {
    outgoing[0] = byte(236);
    Serial.write(outgoing, sizeof(outgoing));
    delay(300);
  } 
//  else if (digitalRead(button2) == HIGH) {
//    outgoing[0] = byte(237);
//    Serial.write(outgoing, sizeof(outgoing));
//    delay(300);
//  }

  //  check for and send any potentiometer1 changes
  int currentRead = analogRead(A1);
  bool thing = abs(currentRead - lastPot1Value) > 100;
  if (thing > 0) {
    lastPot1Value = currentRead;
    outgoing[0] = byte(238);
//    outgoing[1] = byte(map(lastPot1Value, 0, 1023, 5, 225));
    outgoing[1] = byte(map(lastPot1Value, 0, 1023, 0, 9));

    Serial.write(outgoing, sizeof(outgoing));    
    delay(300);
  }
}

