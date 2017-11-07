
byte sensorByte;
int inputPin = 4;
int ledPin = 13;
int ledValue;


void setup() {
     Serial.begin(9600);
     pinMode(ledPin, OUTPUT);    
}

void loop() {
    byte ledValue;
    
    if(Serial.available()){    
      ledValue = Serial.read();   
//      if(ledValue <= 127) ledValue = 0;
//      else ledValue = 1;
      Serial.println(ledValue);   
      analogWrite(ledPin, ledValue);
      delay(1000);
    }
}
