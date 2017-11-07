const int stepPin = 3;
const int dirPin = 4;

void setup() {
  pinMode(3, OUTPUT);
  pinMode(4, OUTPUT);
}

void loop() {
    digitalWrite(dirPin, LOW);
    for(int x = 0; x < 200; x++){
      digitalWrite(stepPin, HIGH);
      delayMicroseconds(500);
      digitalWrite(stepPin, LOW);
      delayMicroseconds(500);
    }
    
    delay(2000);


}
