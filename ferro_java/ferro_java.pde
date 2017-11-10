import processing.serial.*;

import ddf.minim.*;
import ddf.minim.spi.*;
import ddf.minim.signals.*;
import ddf.minim.analysis.*;
import ddf.minim.ugens.*;
import ddf.minim.effects.*;
import ddf.minim.analysis.*;

public static final int MAX_MILLIS_TO_WAIT = 100;

Serial myPort;
int val;

Minim minim;
Minim minim2;
BeatDetect beat;
BeatDetect inBeat;

AudioPlayer song;
AudioPlayer song2;
AudioPlayer playingSong;
AudioInput in;

boolean playing;
boolean liveInput;

byte[] bytes = new byte[2];
int[] incoming = new int[2];

float kickSize,snareSize,hatSize;

long starttime;
int lowBand = 10;
int highBand = 15;
int incomingByte = 0;

void setup() {
    size(200, 50);
    
    for (int i=0; i<2; i++) {
      bytes[i] = byte(0);
      incoming[i] = byte(0);
    }
    
    minim = new Minim(this);

    song = minim.loadFile("data/fade.mp3", 1024);
    song2 = minim.loadFile("data/work.mp3", 1024);
    playingSong = song;

    in = minim.getLineIn();
    in.mute();
    in.disableMonitoring();

    String portName = Serial.list()[1];
    println(portName);
    myPort = new Serial(this, portName, 9600);

    playing = false;
    liveInput = false;
    beat = new BeatDetect();
    //println("songBeat = " + System.identityHashCode(beat));
    inBeat = new BeatDetect();
    //println("inBeat = " + System.identityHashCode(inBeat));

    beat.detectMode(BeatDetect.FREQ_ENERGY);
    inBeat.detectMode(BeatDetect.FREQ_ENERGY);
    
    beat.setSensitivity(5);
    inBeat.setSensitivity(10);
    
    kickSize = snareSize = hatSize = 16;
}

void draw() {
    incomingByte = 0;
    background(0);
    receiveTwoBytes();
    
  if (!liveInput){
    beat.detect(playingSong.mix);
  } else if (liveInput){
    inBeat.detect(in.mix);
  }

  if (inputReceivedFrom(236)) {
     playSong(song);
  } else if (inputReceivedFrom(237)){
     playSong(song2);
  } else if (inputReceivedFrom(238)){
    println("switching to live");
    song.pause();
    song2.pause();
    playing = true;
    liveInput = true;
  }

  if (playing == true) {
      if(!liveInput){
        detectWith(beat, 2);
      } else {
        detectWith(inBeat, 2);
      }
    }
}

void detectWith(BeatDetect detector, int numberOfOnsetsThreshold){
  println("analyzing with " + System.identityHashCode(detector));
  println("detector.iskKick" + detector.isKick());
  println("inbeat.iskKick" + inBeat.isKick());
    println("beat.iskKick" + beat.isKick());

  if (detector.isKick()) kickSize = 32;
  if (detector.isSnare()) snareSize = 32;
  if (detector.isHat()) hatSize = 32;

  fill(255);
  textSize(kickSize);
  text("KICK", width / 4, height / 2);
  textSize(snareSize);
  text("SNARE", width / 2, height / 2);

  textSize(hatSize);
  text("HAT", 3 * width / 4, height / 2);

  kickSize = constrain(kickSize * 0.95, 0, 45);
  snareSize = constrain(snareSize * 0.95, 0, 40);
  hatSize = constrain(hatSize * 0.95, 0, 35);

 if (inputReceivedFrom(239)) {
    lowBand = 1;
    highBand = 3 * incoming[1];
    println("listening for beats between " + lowBand + " and " + highBand);
    println("setting song sensitivity to " + incoming[1]  + "ms between beats");
    println("setting input sensitivity to " + incoming[1]*10 + "ms between beats");
    beat.setSensitivity(incoming[1]);
    inBeat.setSensitivity(incoming[1] * 10);
  } else if (inputReceivedFrom(240)) {
    int surroundBands = beat.detectSize()-(highBand-lowBand);
    int bandStart = constrain(incoming[1], 0, surroundBands);
    lowBand = lowBand + bandStart;
    highBand = highBand + bandStart;
  }
  
  boolean beatsDetectedInRange = detector.isRange(lowBand, highBand, numberOfOnsetsThreshold);
  if (beatsDetectedInRange){
    rotateCounterClockwise((int)kickSize * 2);
  } else if (hatSize > snareSize){
    rotateClockwise((int) (10 + hatSize/2));
  } else if (snareSize > hatSize){
    rotateClockwise((int) (5 + snareSize/2));
  }
}

void receiveTwoBytes() {
  if (myPort.available() > 1) {
    if (incomingByte >= 2) {
      println("clearing? = " + myPort.available());
      myPort.clear();
      for (int i=0; i<2; i++) {
        incoming[i] = byte(0);
      }
      println(myPort.available());
      
    } else {
      incoming[incomingByte] = myPort.read();
    }
    println(incoming[0] + " " + incoming[1]);
    incomingByte++;
  }
}

boolean inputReceivedFrom(int inputId){
  return incoming[0] == inputId;
}

void playSong(AudioPlayer newSong){
  if (newSong.isPlaying()){
    return;
  } else {
    song.pause();
    song2.pause();
  } 

  playingSong = newSong;
  playingSong.play();
  playingSong.loop();
  println("Playing: " + playingSong.getMetaData().title());
  playing = true;
  liveInput = false;
}

void rotateCounterClockwise(int intensity){
  bytes[0] = byte(226);
  int dir = 90 - intensity;
  bytes[1] = byte(dir);
  myPort.write(bytes);
}

void rotateClockwise(int intensity){
  rotateCounterClockwise(intensity * -1);
}

void stop() {
    bytes[0] = byte(227);
    myPort.write(bytes);
    myPort.stop();
    song.close();
    song2.close();
    in.close();
    minim.stop();
    minim2.stop();
    super.stop();
    playing = false;
}