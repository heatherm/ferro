function preload(){
  sound = loadSound('taro.mp3');
}

function setup(){
  var cnv = createCanvas(600,600);
  cnv.mouseClicked(togglePlay);
  fft = new p5.FFT(.93,1024);
  sound.amp(0.2);
}

function drawWaveform() {
  var waveform = fft.waveform();
  noFill();
  beginShape();
  stroke(255, 0, 0); // waveform is red
  strokeWeight(1);
  for (var i = 0; i < waveform.length; i++) {
    var x = map(i, 0, waveform.length, 0, width);
    var y = map(waveform[i], -1, 1, 0, height);
    vertex(x, y);
  }
  endShape();
}
function drawSpectrum() {
  var spectrum = fft.analyze();
  noStroke();
  fill(0, 255, 0); // spectrum is green
  for (var i = 0; i < spectrum.length; i++) {
    var x = map(i, 0, spectrum.length, 0, width);
    var h = -height + map(spectrum[i], 0, 255, height, 0);
    rect(x, height, width / spectrum.length, h)
  }
}

function drawSpectrumAsCircle() {
  var spectrum = fft.analyze();
  stroke(0, 0, 255);
  strokeWeight(1);
  for (var i = 0; i < spectrum.length; i++) {
    var h = -height + map(spectrum[i], 0, 255, height, 0);

    var radians=i*Math.PI/180*2;
    var outerX = 300 + h * Math.cos(radians);
    var outerY = 300 + h * Math.sin(radians);

    line(300, 300, outerX, outerY);
  }
}

function drawSpectrumAsPaintBlob() {
  var spectrum = fft.analyze();
  fill(0, 0, 255);

  beginShape();
  stroke(0, 0, 255);
  strokeWeight(1);
  for (var i = 0; i < spectrum.length; i++) {
    var h = -height + map(spectrum[i], 0, 255, height, 0);

    var radians=i*Math.PI/180*4;
    var outerX = 300 + h * Math.cos(radians);
    var outerY = 300 + h * Math.sin(radians);

    curveVertex(outerX, outerY);
  }
  endShape();

}

function draw(){
  background(0);
  drawWaveform();
  drawSpectrumAsPaintBlob();
}

// fade sound if mouse is over canvas
function togglePlay() {
  if (sound.isPlaying()) {
    sound.pause();
  } else {
    sound.loop();
  }
}