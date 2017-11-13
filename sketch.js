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

// WavesOnSphere_1.0

var mic, analyzer;

function setup(){
  mic = new p5.AudioIn()
  mic.start();
}

var Nmax = 50,
  M = 15,
  H = 0.8,
  HH = 0.01;

var X = _.range(Nmax+1).map(function () { return 0 }),
  Y = _.range(Nmax+1).map(function () { return 0 }),
  Z = _.range(Nmax+1).map(function () { return 0 }),
  V =_.range(Nmax+1).map(function () { return 0 }),
  dV = _.range(Nmax+1).map(function () { return 0 });

var L,
  Lmin,
  R,
  N,
  NN,
  KX,
  KY,
  KZ,
  KV,
  KdV,
  K;

var decayRate, minimumThreshold, threshold, fft;


function setup(){
  mic = new p5.AudioIn()
  analyzer = new p5.Amplitude();
  analyzer.setInput(mic);

  fft = new p5.FFT(.8,1024);


  decayRate = 0.05;
  minimumThreshold = 0.05;
  threshold = minimumThreshold;

  mic.start();
  R = 2*sqrt((4*PI*(200*200)/Nmax)/(2*sqrt(3)));

  createCanvas(600,600);
  background(0,0,0) ;
  noSmooth() ;
  stroke(255,255,255) ;
  fill(50,50,50) ;

  for ( N = 0 ; N <= Nmax ; N++ ){
    X[N] = random(-300,+300) ;
    Y[N] = random(-300,+300) ;
    Z[N] = random(-300,+300) ;
  }

} // setup()



function draw(){

  var rms = analyzer.getLevel();

  threshold = lerp(threshold, minimumThreshold, decayRate);

  if(rms > threshold) {
    mousePressed();
    threshold = rms;
  }
  background(0,0,0) ;

  for ( N = 0 ; N <= Nmax ; N++ ){
    for ( NN = N+1 ; NN <= Nmax ; NN++ ){
      L = sqrt(((X[N]-X[NN])*(X[N]-X[NN]))+((Y[N]-Y[NN])*(Y[N]-Y[NN]))) ;
      L = sqrt(((Z[N]-Z[NN])*(Z[N]-Z[NN]))+(L*L)) ;
      if ( L < R ){
        X[N] = X[N] - ((X[NN]-X[N])*((R-L)/(2*L))) ;
        Y[N] = Y[N] - ((Y[NN]-Y[N])*((R-L)/(2*L))) ;
        Z[N] = Z[N] - ((Z[NN]-Z[N])*((R-L)/(2*L))) ;
        X[NN] = X[NN] + ((X[NN]-X[N])*((R-L)/(2*L))) ;
        Y[NN] = Y[NN] + ((Y[NN]-Y[N])*((R-L)/(2*L))) ;
        Z[NN] = Z[NN] + ((Z[NN]-Z[N])*((R-L)/(2*L))) ;
        dV[N] = dV[N] + ((V[NN]-V[N])/M) ;
        dV[NN] = dV[NN] - ((V[NN]-V[N])/M) ;
        stroke(255);
        stroke(125+(Z[N]/2),125+(Z[N]/2),125+(Z[N]/2)) ;
        line(X[N]*1.2*(200+V[N])/200+300,Y[N]*1.2*(200+V[N])/200+300,X[NN]*1.2*(200+V[NN])/200+300,Y[NN]*1.2*(200+V[NN])/200+300) ;
      }
      if ( Z[N] > Z[NN] ){
        KX = X[N] ; KY = Y[N] ; KZ = Z[N] ; KV = V[N] ; KdV = dV[N] ;
        X[N] = X[NN] ; Y[N] = Y[NN] ; Z[N] = Z[NN] ; V[N] = V[NN] ; dV[N] = dV[NN] ;
        X[NN] = KX ; Y[NN] = KY ; Z[NN] = KZ ; V[NN] = KV ; dV[NN] = KdV ;
      }
    }
    L = sqrt((X[N]*X[N])+(Y[N]*Y[N])) ;
    L = sqrt((Z[N]*Z[N])+(L*L)) ;
    X[N] = X[N] + (X[N]*(200-L)/(2*L)) ;
    Y[N] = Y[N] + (Y[N]*(200-L)/(2*L)) ;
    Z[N] = Z[N] + (Z[N]*(200-L)/(2*L)) ;
    KZ = Z[N] ; KX = X[N] ;
    console.log(mouseX);
    console.log(mouseY);
    Z[N] = (KZ*cos(float(300-303)/10000))-(KX*sin(float(300-303)/10000)) ;
    X[N] = (KZ*sin(float(300-303)/10000))+(KX*cos(float(300-303)/10000)) ;
    KZ = Z[N] ; KY = Y[N] ;
    Z[N] = (KZ*cos(float(300-303)/10000))-(KY*sin(float(300-303)/10000)) ;
    Y[N] = (KZ*sin(float(300-303)/10000))+(KY*cos(float(300-303)/10000)) ;
    dV[N] = dV[N] - (V[N]*HH) ;
    V[N] = V[N] + dV[N] ; dV[N] = dV[N] * H ;
  }



} // draw()



function mousePressed(){

  Lmin = 200 ; NN = 0 ;
  for ( N = 0 ; N <= Nmax ; N++ ){
    L = sqrt(((random(200)-(300+X[N]))*(random(200)-(300+X[N])))+((random(200)-(300+Y[N]))*(random(200)-(300+Y[N])))) ;
    if ( Z[N] > 0 && L < Lmin ){ NN = N ; Lmin = L ; }
  }
  if ( K == 0 ){ dV[NN] = -200 ; K = 1 ; }
  else{ dV[NN] = +200 ; K = 0 ; }

} // mousePressed()
