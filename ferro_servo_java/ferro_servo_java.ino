#include <Servo.h>

#define MAX_MILLIS_TO_WAIT 100

Servo servo;
int servoStopSpeed = 90;

int button1;
int button2;
int button3;
int stopButton;
int pot1 = A1;
int pot2 = A2;
int lastPot1Value;
int lastPot2Value;

unsigned long starttime;

//byte outgoing[2];
byte outgoing[1];
byte incoming[2];

int stopId = 251;

void setup() {
  button1 = 4;
  button2 = 5;
  button3 = 6;
  stopButton = 7;
  
  setupSerial(9600);
  setupServo(13);
  setupButton(button1);
  setupButton(button2);
  setupButton(button3);
  setupButton(stopButton);
  
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

  handleButtonClick(button1, 226);
  handleButtonClick(button2, 227);
  handleButtonClick(button3, 228);
  lastPot1Value = handlePotentiometerTurn(240, analogRead(A1), lastPot1Value, 170);
  lastPot2Value = handlePotentiometerTurn(230, analogRead(A2), lastPot2Value, 670);
  handleStopButtonClick();
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
  digitalWrite(buttonPin, HIGH);
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
 return incoming[0] == 217;
}

void stopServo() {
  servo.write(servoStopSpeed);
}

void handleButtonClick(int buttonPin, int uniqueId) {
  if (digitalRead(buttonPin) == HIGH) {
    Serial.println(uniqueId);
    outgoing[0] = byte(uniqueId);
//    outgoing[1] = byte(uniqueId); // cheating since it's reading byte 1?

      writeOutgoing();
   
  } 
}

void handleStopButtonClick() {
   if (digitalRead(stopButton) == LOW) {
    Serial.println(stopId);
    outgoing[0] = byte(stopId);
    writeOutgoing();
    stopServo();
  }  
}

int handlePotentiometerTurn(int uniqueId, int currentRead, int lastValue, int lowRead) {
  bool pastThreshold = abs(currentRead - lastValue) > 100;
  if (pastThreshold == true) {
//    Serial.println(uniqueId);
    Serial.println(currentRead);
    if (currentRead >= lowRead && currentRead <= 1023){
      float val = log(currentRead+1)*10000;
      float lowLogRead = log(lowRead+1)*10000;
      if (val > lowLogRead && val < 69315) { // log(1023+1)*10000
        float scaledOn1k = map(val, lowLogRead, 69315, 1, 9);
//              Serial.println(scaledOn1k);
          if (scaledOn1k > 0 && scaledOn1k < 10) {
            Serial.println(uniqueId + scaledOn1k);
            outgoing[0] = byte(uniqueId + scaledOn1k);
//            outgoing[1] = byte(scaledOn1k);
            writeOutgoing();
            lastValue = currentRead;
        }
      }
    } else {
      return 0;
    }
    return lastValue;
   }
   return lastValue;
}
