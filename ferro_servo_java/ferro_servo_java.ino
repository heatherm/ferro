#include <Servo.h>

#define MAX_MILLIS_TO_WAIT 100

Servo servo;
int servoStopSpeed = 90;

int input;
int button1 = 4;
int button2 = 5;

int pot1 = A1;
int lastPot1Value;

unsigned long starttime;

byte outgoing[2];
byte incoming[2];

void setup() {
  setupSerial(9600);
  setupServo(13);
  setupButton(button1);
  setupButton(button2);
  
  lastPot1Value = analogRead(A1);
}

void loop() {
  receiveTwoBytes();
    if (shouldStopServo()) {
      stopServo();
    else if (receivedServoDirection()) {
      servo.write(incoming[1]);
    }
  }

  handleButtonClick(button1, 236);
  handleButtonClick(button2, 237);

  handlePotentiometerTurn(238);
}

void setupSerial(int baud) {
  Serial.end();
  Serial.begin(baud);
  while (!Serial) {};

  for (int i=0; i<2; i++) {
    outgoing[i] = byte(0);
    incoming[i] = byte(0);
  }
}

void setupServo(int servoPin) {
  myservo.attach(13);
  myservo.write(servoStopSpeed);
}

void setupButton(int buttonPin){
  pinMode(buttonPin, INPUT);
  digitalWrite(buttonPin, LOW);
}

void receiveTwoBytes() {
  starttime = millis();
  while ( (Serial.available() < 2) && ((millis() - starttime) < MAX_MILLIS_TO_WAIT) ) {
    //wait for bytes
  }
  if (Serial.available() < 2) {
    // the data didn't come in - flush the port
    Serial.flush();
  } else {
    for(int i=0; i<2; i++) {
      incoming[i] = Serial.read();
    }
  }
}

void writeOutgoing() {
  Serial.write(outgoing, sizeof(outgoing));    
  delay(300);
}

boolean receivedServoDirection() {
  return incoming[0] == 226;
}

boolean shouldStopServo() {
 return incoming[0] == 227;
}

void stopServo() {
  servo.write(servoStopSpeed);
}

void handleButtonClick(int buttonPin, int buttonUniqueId) {
  if (digitalRead(buttonPin) == HIGH) {
    outgoing[0] = byte(buttonUniqueId);
    writeOutgoing();
  }  
}

void handlePotentiometerTurn(int uniqueId) {
  int currentRead = analogRead(A1);
  bool pastThreshold = abs(currentRead - lastPot1Value) > 100;
  if (pastThreshold == true) {
    lastPot1Value = currentRead;
    outgoing[0] = byte(uniqueId);
//    outgoing[1] = byte(map(lastPot1Value, 0, 1023, 5, 225));
    outgoing[1] = byte(map(lastPot1Value, 0, 1023, 0, 9));
    writeOutgoing();
   }
}
