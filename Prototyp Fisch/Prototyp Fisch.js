// JavaScript Document

let song;
let fft;
let fishScale = 1;
let bassSensitivity = 2;
let isPlaying = false;

function preload() {
  song = loadsound("Testbeat.mp3")
}

function setup() {
  let canvas = createCanvas(600, 400);
  canvas.parent("sketch-holder");
  fft = new p5.FFT();

  // Button zum Starten
  const playButton = document.getElementById("playButton");
  playButton.addEventListener("click", togglePlay);

  // Regler
  document.getElementById("volumeSlider").addEventListener("input", (e) => {
    song.setVolume(parseFloat(e.target.value));
  });
  document.getElementById("bassSlider").addEventListener("input", (e) => {
    bassSensitivity = parseFloat(e.target.value);
  });
}

function draw() {
  background(10, 20, 30);

  if (!isPlaying) {
    fill(255);
    textAlign(CENTER, CENTER);
    text("Drücke ▶, um die Musik zu starten", width / 2, height / 2);
    return;
  }

  let spectrum = fft.analyze();
  let bass = fft.getEnergy("bass");

  // Bewegung & Skalierung abhängig vom Bass
  let bassBoost = map(bass, 0, 255, 0.8, 1.5) * bassSensitivity;
  fishScale = lerp(fishScale, bassBoost, 0.1);

  drawFish(width / 2, height / 2, 120 * fishScale);
}

// Fisch-Illustration (vereinfachte Zeichnung)
function drawFish(x, y, size) {
  push();
  translate(x, y);

  // Schwanz
  fill(0, 255, 255, 180);
  triangle(-size * 0.6, 0, -size, -size * 0.3, -size, size * 0.3);

  // Körper
  fill(0, 180 + random(-20, 20), 255);
  ellipse(0, 0, size * 1.2, size * 0.7);

  // Auge
  fill(255);
  ellipse(size * 0.3, -size * 0.1, size * 0.15, size * 0.15);
  fill(0);
  ellipse(size * 0.3, -size * 0.1, size * 0.07, size * 0.07);

  // Lichtreflex
  fill(255, 255, 255, 100);
  ellipse(-size * 0.1, -size * 0.2, size * 0.2, size * 0.1);

  pop();
}

function togglePlay() {
  if (song.isPlaying()) {
    song.pause();
    isPlaying = false;
    document.getElementById("playButton").textContent = "▶ Musik abspielen";
  } else {
    song.loop();
    isPlaying = true;
    document.getElementById("playButton").textContent = "⏸ Pause";
  }
}
