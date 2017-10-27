var fft,
  numBars = 32,
  song,
  canvas,
  mic;


function setup() {
  song = loadSound("taro.mp3");

  canvas = createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(0);

  if(typeof song != "undefined"
    && song.isLoaded()
    && !song.isPlaying()) {

    song.play();
    song.setVolume(0.5);

    fft = new p5.FFT();
    fft.waveform(numBars);
    fft.smooth(0.9);
  }

  if(typeof fft != "undefined") {
    var spectrum = fft.analyze();
    noStroke();
    fill("rgb(0, 255, 0)");
    for(var i = 0; i < numBars; i++) {
      if(i % 2 == 0){
        var x = map(i, 0, numBars, 0, width);
        var h1 = -height + map(spectrum[i], 0, 255, height, 0);
        var h2 = -height + map(spectrum[i-1], 0, 255, height, 0);
        var h = (h1+h2/2)
        var w = width / numBars*2;
        rect(x-w, height, w, h);
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
