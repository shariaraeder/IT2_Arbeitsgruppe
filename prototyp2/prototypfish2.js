/* global createCanvas, background, noStroke, fill, ellipse, triangle, push, pop, translate, width, height, random, map, select, loadSound, FFT */
	
let song;
let fft;
let volumeSlider, bassSlider, playButton, blubToggleBtn;
let blubSound;
let bubbles = [];
let lastBlubTime = 0;
let blubMode = true; // Standard: Blubbermodus AN

function preload() {
  song = loadSound("prototypfish2.mp3");
  blubSound = loadSound("blub.mp3");
}

function setup() {
  let canvas = createCanvas(600, 400);
  canvas.parent("sketch-container");

  fft = new p5.FFT();

  // Buttons und Slider verbinden
  playButton = select("#playBtn");
  blubToggleBtn = select("#blubToggleBtn");
  volumeSlider = select("#volumeSlider");
  bassSlider = select("#bassSlider");

  playButton.mousePressed(togglePlay);
  blubToggleBtn.mousePressed(toggleBlubMode);
}

function draw() {
  background(0, 15);
  noStroke();

  if (song.isPlaying()) {
    let spectrum = fft.analyze();
    let bass = fft.getEnergy("bass");
    let vol = volumeSlider.value();
    song.setVolume(vol);

    let bassScale = bassSlider.value();
    let bodySize = map(bass, 0, 255, 50, 200) * (bassScale / 5);

    // ? Stylischer Rave-Fisch mit dynamischen Farben
push();
translate(width / 2, height / 2);

// Fischgröße hängt vom Bass ab
let scaleFactor = map(bass, 0, 255, 0.8, 1.4) * (bassScale / 5);
let fishLength = 200 * scaleFactor;
let fishHeight = 80 * scaleFactor;

// Farbe ändert sich leicht im Beat
let hueShift = map(bass, 0, 255, 160, 280);

// Glühen im Beat
let glow = map(bass, 0, 255, 0, 100);

// Leichtes Wackeln für Bewegung
let wiggle = sin(frameCount * 0.1) * 5;

// Hauptkörper
noStroke();
fill(hueShift, 100, 255 - glow, 180);
ellipse(0 + wiggle, 0, fishLength, fishHeight);

// Schwanzflosse
fill(hueShift + 60, 180, 255, 150);
triangle(-fishLength / 2, 0, -fishLength / 2 - 50 * scaleFactor, -fishHeight / 3, -fishLength / 2 - 50 * scaleFactor, fishHeight / 3);

// obere Flosse
fill(hueShift + 30, 180, 255, 150);
triangle(0, -fishHeight / 2, -fishLength / 6, -fishHeight / 1.2, fishLength / 6, -fishHeight / 2);

// untere Flosse
fill(hueShift + 30, 180, 255, 150);
triangle(0, fishHeight / 2, -fishLength / 6, fishHeight / 1.2, fishLength / 6, fishHeight / 2);

// Auge
fill(255);
ellipse(fishLength / 3, -fishHeight / 5, 15 * scaleFactor);
fill(0);
ellipse(fishLength / 3, -fishHeight / 5, 7 * scaleFactor);

// Lichtreflex (Glanz)
fill(255, 255, 255, 100);
ellipse(fishLength / 6, -fishHeight / 4, 30 * scaleFactor, 10 * scaleFactor);

pop();


    // Bass-Trigger â†’ Blub + Extra-Blasen nur wenn blubMode aktiviert ist
    if (blubMode && bass > 150 && millis() - lastBlubTime > 400) {
      if (blubSound.isPlaying()) blubSound.stop();
      blubSound.play();
      lastBlubTime = millis();

      // Extra-Blasen bei starkem Bass
      for (let i = 0; i < 10; i++) {
        bubbles.push(new Bubble(random(width), height + random(10, 50)));
      }
    }

    // Normale Blasenbewegung
    for (let i = bubbles.length - 1; i >= 0; i--) {
      bubbles[i].move();
      bubbles[i].show();

      // Entfernen wenn oben raus
      if (bubbles[i].y < -10) {
        bubbles.splice(i, 1);
      }
    }
  }
}

function togglePlay() {
  if (!song.isPlaying()) {
    song.play();
    playButton.html("â¸ Musik pausieren");
  } else {
    song.pause();
    playButton.html("â–¶ Musik abspielen");
  }
}

// ðŸ”˜ Schalter fÃ¼r Blubbermodus
function toggleBlubMode() {
  blubMode = !blubMode;
  if (blubMode) {
    blubToggleBtn.html("ðŸ’§ Blubbermodus: AN");
    blubToggleBtn.style("background-color", "#00ffff");
  } else {
    blubToggleBtn.html("ðŸš« Blubbermodus: AUS");
    blubToggleBtn.style("background-color", "#ff5555");
  }
}

// ðŸ”µ Blasen-Klasse
class Bubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(5, 15);
    this.speed = random(1, 3);
    this.alpha = random(100, 255);
  }

  move() {
    this.y -= this.speed;
    this.x += sin(frameCount / 10 + this.y / 50) * 0.5;
  }

  show() {
    fill(0, 200, 255, this.alpha);
    ellipse(this.x, this.y, this.size);
  }
}
