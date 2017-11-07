#include <Servo.h>

Servo myservo;
int input;
int button1 = 4;
int button2 = 5;
int press1 = 0;
int press2 = 0;

void setup()
{
  myservo.attach(13);
  Serial.begin(9600);
  myservo.write(45);
  pinMode(button1, INPUT);
  pinMode(button2, INPUT);

  digitalWrite(button1, HIGH);
  digitalWrite(button2, HIGH);
}

void loop() {
    press1 = digitalRead(button1);
    press2 = digitalRead(button2);
    Serial.println(press1);
    
    if (press1 == LOW){
        press1 = 3;
        press2 = 0;
    } else if (press2 == LOW) {
      press1 = 0;  
      press2 = 3;
    }

    if (press1 == 3) {
      int bytesSent = Serial.println("3");
      String beat = "x..x..x..x..x....";
      delay(300);

      myservo.write(0);
      delay(340);
      myservo.write(45);
      delay(340);
      myservo.write(90);
      delay(340);
      myservo.write(0);
      delay(340);
      myservo.write(45);
      delay(340);
      myservo.write(90);
      delay(340);
      myservo.write(0);
      delay(340);
      myservo.write(45);
      delay(340);
      myservo.write(90);
      delay(340);
      myservo.write(0);
      delay(340);
      myservo.write(45);
      delay(340);
      myservo.write(90);
      delay(340);
      myservo.write(0);
      delay(340);
      myservo.write(20);
      delay(340);
      myservo.write(40);
      delay(340);
      myservo.write(60);
      delay(340);
      myservo.write(80);
      delay(340);
    } 
}

