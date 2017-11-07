import processing.serial.*;

import ddf.minim.*;
import ddf.minim.spi.*;
import ddf.minim.signals.*;
import ddf.minim.analysis.*;
import ddf.minim.ugens.*;
import ddf.minim.effects.*;
import ddf.minim.analysis.*;
import ddf.minim.analysis.FFT;

public static final int MAX_MILLIS_TO_WAIT = 300;

Serial myPort;
int val;

Minim minim;
Minim minim2;

AudioPlayer song;
AudioInput in;

//FFT fft;
//int sampleRate=44100;
//int timeSize=1024;
boolean playing;
boolean playingLive;
BeatDetect beat;
BeatListener bl;
float movement;

byte[] bytes = new byte[2];
int[] incoming = new int[2];

float kickSize,snareSize,hatSize;

long starttime;

class BeatListener implements AudioListener {
    private BeatDetect beat;
    private AudioPlayer source;

    BeatListener(BeatDetect beat, AudioPlayer source) {
        this.source = source;
        this.source.addListener(this);
        this.beat = beat;
    }

    void samples(float[] samps) {
        beat.detect(source.mix);
    }

    void samples(float[] sampsL, float[] sampsR) {
        beat.detect(source.mix);
    }
}

void setup() {
    size(500, 200);
    
    for (int i=0; i<2; i++) {
      bytes[i] = byte(0);
    }

    smooth();
    minim = new Minim(this);
    minim2 = new Minim(this);

    song = minim.loadFile("data/taro.mp3", 1024);

    in = minim2.getLineIn(Minim.STEREO, 2048);
    in.mute();
    in.disableMonitoring();
    //fft = new FFT(in.bufferSize(), in.sampleRate());

    String portName = Serial.list()[1];
    println(portName);
    myPort = new Serial(this, portName, 9600);
    myPort.clear();

    playing = false;
    beat = new BeatDetect(song.bufferSize(), song.sampleRate());
    beat.detectMode(BeatDetect.FREQ_ENERGY);
    beat.setSensitivity(10);
    kickSize = snareSize = hatSize = 16;
    bl = new BeatListener(beat, song);
    textFont(createFont("Helvetica", 16));
    textAlign(CENTER);
}

void draw() {
    background(0);

// receive 2 bytes
  starttime = millis();
  println(myPort.available());
  while ( (myPort.available() < 2) && ((millis() - starttime) < MAX_MILLIS_TO_WAIT) ) {
    // hang in this loop until we either get 2 bytes of data or 1 second
    // has gone by
  }
  if (myPort.available()  < 2) {
    // the data didn't come in - handle that problem here
    //myPort.clear();
  } else {
    print("incoming");
    println(incoming[0]);
    for(int n=0; n < 2; n++) {
      incoming[n] = myPort.read(); // Then: Get them.
    }
  }
  
        
   if (playing == false) {
        if (incoming[0] == 236) {
            println("playing");
            song.play();
            playing = true;
            playingLive = false;
        }

        if (incoming[0] == 237) {
            song.pause();
            playing = false;
            playingLive = true;
        }
    }

    if (playing == true) {

       if (incoming[0] == 238) {
          println("setting sensitivity to " + incoming[1]*3);
          beat.setSensitivity(incoming[1]*3);
             beat.setSensitivity(10);
        }
        
        // draw a green rectangle for every detect band
        // that had an onset this frame
        float rectW = width / beat.detectSize();
        for (int i = 0; i < beat.detectSize(); ++i) {
            // test one frequency band for an onset
            if (beat.isOnset(i)) {
                fill(0, 200, 0);
                rect(i * rectW, 0, rectW, height);
            }
        }

        // draw an orange rectangle over the bands in
        // the range we are querying
        int lowBand = 5;
        int highBand = 15;
        // at least this many bands must have an onset
        // for isRange to return true
        int numberOfOnsetsThreshold = 4;
        if (beat.isRange(lowBand, highBand, numberOfOnsetsThreshold)) {
            fill(232, 179, 2, 200);
            rect(rectW * lowBand, 0, (highBand - lowBand) * rectW, height);
        }

        if (beat.isKick()) kickSize = 32;
        if (beat.isSnare()) snareSize = 32;
        if (beat.isHat()) hatSize = 32;

        fill(255);

        textSize(kickSize);
        text("KICK", width / 4, height / 2);

        textSize(snareSize);
        text("SNARE", width / 2, height / 2);

        textSize(hatSize);
        text("HAT", 3 * width / 4, height / 2);

        kickSize = constrain(kickSize * 0.95, 0, 45);
        snareSize = constrain(snareSize * 0.95, 0, 45);
        hatSize = constrain(hatSize * 0.95, 0, 45);

        if (snareSize > 25) {
            bytes[0] = byte(226);
            int dir = 90 - (int) snareSize * 2;
            bytes[1] = byte(dir);
            myPort.write(bytes);

        } else {
            bytes[0] = byte(226);
            int dir = 90 + (int) snareSize;
            bytes[1] = byte(dir);
            myPort.write(bytes);
        }

        delay(250);
    }

//    if (playingLive == true) {
//        fft.forward(in.mix);
//        stroke(255);
//        // frequency bands
//        for (int i = 0; i < fft.specSize(); i++) {
//            line(i, height, i, height - fft.getBand(i) * 4);
//        }
//
//        stroke(0);
//
//        // left and right input waveform
//        for (int i = 0; i < in.left.size() - 1; i++) {
//            line(i, 50 + in.left.get(i) * 50, i + 1, 50 + in.left.get(i + 1) * 50);
//            line(i, 150 + in.right.get(i) * 50, i + 1, 150 + in.right.get(i + 1) * 50);
//        }
//    }

}

void stop() {
    bytes[0] = byte(227);
    myPort.write(bytes);
    song.close();
    in.close();
    minim.stop();
    minim2.stop();
    super.stop();
    playing = false;
    playingLive = false;
}