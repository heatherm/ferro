// function preload(){
//   sound = loadSound('taro.mp3');
// }
//
// function setup(){
//   var cnv = createCanvas(600,600);
//   cnv.mouseClicked(togglePlay);
//   fft = new p5.FFT(.93,1024);
//   sound.amp(0.2);
// }
//
// function drawWaveform() {
//   var waveform = fft.waveform();
//   noFill();
//   beginShape();
//   stroke(255, 0, 0); // waveform is red
//   strokeWeight(1);
//   for (var i = 0; i < waveform.length; i++) {
//     var x = map(i, 0, waveform.length, 0, width);
//     var y = map(waveform[i], -1, 1, 0, height);
//     vertex(x, y);
//   }
//   endShape();
// }
// function drawSpectrum() {
//   var spectrum = fft.analyze();
//   noStroke();
//   fill(0, 255, 0); // spectrum is green
//   for (var i = 0; i < spectrum.length; i++) {
//     var x = map(i, 0, spectrum.length, 0, width);
//     var h = -height + map(spectrum[i], 0, 255, height, 0);
//     rect(x, height, width / spectrum.length, h)
//   }
// }
//
// function drawSpectrumAsCircle() {
//   var spectrum = fft.analyze();
//   stroke(0, 0, 255);
//   strokeWeight(1);
//   for (var i = 0; i < spectrum.length; i++) {
//     var h = -height + map(spectrum[i], 0, 255, height, 0);
//
//     var radians=i*Math.PI/180*2;
//     var outerX = 300 + h * Math.cos(radians);
//     var outerY = 300 + h * Math.sin(radians);
//
//     line(300, 300, outerX, outerY);
//   }
// }
//
// function drawSpectrumAsPaintBlob() {
//   var spectrum = fft.analyze();
//   fill(0, 0, 255);
//
//   beginShape();
//   stroke(0, 0, 255);
//   strokeWeight(1);
//   for (var i = 0; i < spectrum.length; i++) {
//     var h = -height + map(spectrum[i], 0, 255, height, 0);
//
//     var radians=i*Math.PI/180*4;
//     var outerX = 300 + h * Math.cos(radians);
//     var outerY = 300 + h * Math.sin(radians);
//
//     curveVertex(outerX, outerY);
//   }
//   endShape();
//
// }
//
// function draw(){
//   background(0);
//   drawWaveform();
//   drawSpectrumAsPaintBlob();
// }
//
// // fade sound if mouse is over canvas
// function togglePlay() {
//   if (sound.isPlaying()) {
//     sound.pause();
//   } else {
//     sound.loop();
//   }
// }

var totalVertices = 100,
  canvasHeight = 600,
  canvasWidth = 600,
  spikeHeight = 0.8;

var xPositions = zeroInitializedArrayOfSize(totalVertices+1),
  yPositions = zeroInitializedArrayOfSize(totalVertices+1),
  zPositions = zeroInitializedArrayOfSize(totalVertices+1),
  V = zeroInitializedArrayOfSize(totalVertices+1),
  dV = zeroInitializedArrayOfSize(totalVertices+1);

var L, Lmin, radius, i, j, KX, KY, KZ, KV, KdV, K;
var mic, analyzer, decayRate, minimumThreshold, threshold, fft;


function setup(){
  mic = new p5.AudioIn()
  mic.start();
}

function zeroInitializedArrayOfSize(size){
  return _.range(size).map(function () { return 0 });
}

function assignRandomLocation(n){
  var maxDistance = canvasWidth/2;
  xPositions[n] = random(-maxDistance,+maxDistance) ;
  yPositions[n] = random(-maxDistance,+maxDistance) ;
  zPositions[n] = random(-maxDistance,+maxDistance) ;
}

function setup(){
  background(0,0,0);
  createCanvas(canvasHeight,canvasWidth);
  noSmooth();
  stroke(255,255,255);
  fill(50,50,50);

  mic = new p5.AudioIn()
  analyzer = new p5.Amplitude();
  analyzer.setInput(mic);

  var bands = 1024
  fft = new p5.FFT(.8, bands);

  decayRate = 0.05;
  minimumThreshold = 0.1;
  threshold = minimumThreshold;

  mic.start();
  radius = 2*sqrt(
      (4*PI*(200*200)/totalVertices)/(2*sqrt(3))
    );

  for (i = 0 ; i <= totalVertices ; i++ ){
    assignRandomLocation(i);
  }
}

function draw(){
  background(0,0,0) ;

  var rms = analyzer.getLevel();

  threshold = lerp(threshold, minimumThreshold, decayRate);

  if(rms > threshold) {
    createRipple();
    threshold = rms;
  }

  for (i = 0 ; i <= totalVertices ; i++ ){
    for (j = i+1 ; j <= totalVertices ; j++ ){
      L = sqrt(((xPositions[i]-xPositions[j])*(xPositions[i]-xPositions[j]))+((yPositions[i]-yPositions[j])*(yPositions[i]-yPositions[j]))) ;
      L = sqrt(((zPositions[i]-zPositions[j])*(zPositions[i]-zPositions[j]))+(L*L)) ;
      if ( L < radius ){
        M = 15;
        xPositions[i] = xPositions[i] - ((xPositions[j]-xPositions[i])*((radius-L)/(2*L))) ;
        yPositions[i] = yPositions[i] - ((yPositions[j]-yPositions[i])*((radius-L)/(2*L))) ;
        zPositions[i] = zPositions[i] - ((zPositions[j]-zPositions[i])*((radius-L)/(2*L))) ;
        xPositions[j] = xPositions[j] + ((xPositions[j]-xPositions[i])*((radius-L)/(2*L))) ;
        yPositions[j] = yPositions[j] + ((yPositions[j]-yPositions[i])*((radius-L)/(2*L))) ;
        zPositions[j] = zPositions[j] + ((zPositions[j]-zPositions[i])*((radius-L)/(2*L))) ;
        dV[i] = dV[i] + ((V[j]-V[i])/M) ;
        dV[j] = dV[j] - ((V[j]-V[i])/M) ;
        stroke(125+(zPositions[i]/2),125+(zPositions[i]/2),125+(zPositions[i]/2)) ;
        line(xPositions[i]*1.2*(200+V[i])/200+300,yPositions[i]*1.2*(200+V[i])/200+300,xPositions[j]*1.2*(200+V[j])/200+300,yPositions[j]*1.2*(200+V[j])/200+300) ;
      }
      if ( zPositions[i] > zPositions[j] ){
        KX = xPositions[i] ;
        KY = yPositions[i] ;
        KZ = zPositions[i] ;
        KV = V[i] ;
        KdV = dV[i] ;
        xPositions[i] = xPositions[j] ;
        yPositions[i] = yPositions[j] ;
        zPositions[i] = zPositions[j] ;
        V[i] = V[j] ; dV[i] = dV[j] ;
        xPositions[j] = KX ; yPositions[j] = KY ; zPositions[j] = KZ ; V[j] = KV ; dV[j] = KdV ;
      }
    }
    L = sqrt((xPositions[i]*xPositions[i])+(yPositions[i]*yPositions[i])) ;
    L = sqrt((zPositions[i]*zPositions[i])+(L*L)) ;
    xPositions[i] = xPositions[i] + (xPositions[i]*(200-L)/(2*L)) ;
    yPositions[i] = yPositions[i] + (yPositions[i]*(200-L)/(2*L)) ;
    zPositions[i] = zPositions[i] + (zPositions[i]*(200-L)/(2*L)) ;
    KZ = zPositions[i] ; KX = xPositions[i] ;
    // zPositions[i] = (KZ*cos(float(300-mouseX)/10000))-(KX*sin(float(300-mouseX)/10000)) ;
    // xPositions[i] = (KZ*sin(float(300-mouseX)/10000))+(KX*cos(float(300-mouseX)/10000)) ;
    KZ = zPositions[i] ; KY = yPositions[i] ;
    // zPositions[i] = (KZ*cos(float(300-mouseY)/10000))-(KY*sin(float(300-mouseY)/10000)) ;
    // yPositions[i] = (KZ*sin(float(300-mouseY)/10000))+(KY*cos(float(300-mouseY)/10000)) ;
    dV[i] = dV[i] - (V[i]*0.01) ;
    V[i] = V[i] + dV[i] ; dV[i] = dV[i] * spikeHeight ;
  }
}

function createRipple(){
  Lmin = 200 ;
  j = 0 ;

  for (i = 0 ; i <= totalVertices ; i++ ){
    L = sqrt(((random(200)-(300+xPositions[i]))*(random(200)-(300+xPositions[i])))+((random(200)-(300+yPositions[i]))*(random(200)-(300+yPositions[i])))) ;
    if ( zPositions[i] > 0 && L < Lmin ){ j = i ; Lmin = L ; }
  }
  if ( K == 0 ){ dV[j] = -200 ; K = 1 ; }
  else{ dV[j] = +200 ; K = 0 ; }

}
