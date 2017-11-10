#include <Servo.h>

#define MAX_MILLIS_TO_WAIT 100

Servo servo;
int servoStopSpeed = 90;

int button1;
int button2;
int button3;
int pot1 = A1;
int pot1 = A2;
int lastPot1Value;
int lastPot2Value;

unsigned long starttime;

byte outgoing[2];
byte incoming[2];

void setup() {
  button1 = 4;
  button2 = 5;
  button3 = 5;
  
  setupSerial(9600);
  setupServo(13);
  setupButton(button1);
  setupButton(button2);
  setupButton(button3);

  
  lastPot1Value = analogRead(A1);
  lastPot2Value = analogRead(A2);
}

void loop() {
  receiveTwoBytes();
    if (shouldStopServo()) {
      stopServo();
    } else if (receivedServoDirection()) {
      servo.write(incoming[1]);
    }

  handleButtonClick(button1, 236);
  handleButtonClick(button2, 237);
  handleButtonClick(button3, 238);
  lastPot1Value = handlePotentiometerTurn(239, analogRead(A1), lastPot1Value);
  lastPot2Value = handlePotentiometerTurn(240, analogRead(A2), lastPot2Value);
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
  servo.attach(13);
  servo.write(servoStopSpeed);
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

void handleButtonClick(int buttonPin, int uniqueId) {
  if (digitalRead(buttonPin) == HIGH) {
    Serial.println(uniqueId);
    outgoing[0] = byte(uniqueId);
    writeOutgoing();
  }  
}

void handlePotentiometerTurn(int uniqueId, int currentRead, int lastValue) {
  bool pastThreshold = abs(currentRead - lastValue) > 100;
  if (pastThreshold == true) {
    Serial.println(uniqueId);
    outgoing[0] = byte(uniqueId);
    outgoing[1] = byte(map(lastValue, 0, 1023, 0, 9));
    writeOutgoing();
    return currentRead;
   }
   return lastvalue;
}
