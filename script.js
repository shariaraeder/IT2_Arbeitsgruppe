<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<title>Testen1</title>
<link href="Ideen ausprobieren.css" rel="stylesheet" type="text/css">
</head>

<body>
	
	let song;
let fft;
let fishScale = 1;
let bassSensitivity = 2;
let isPlaying = false;

function preload() {
  song = loadSound("Testbeat.mp3");
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
	<!--
  Datei: index.html
  Zweck: Interaktive Campus-Karte mit Hover-/Touch-Sounds für Ideenentwicklung
  Hinweise:
  - Diese Datei ist ein vollständiges Beispiel. Du kannst CSS und JS in separate Dateien
    auslagern: styles.css (CSS) und script.js (JS). Suche nach den Kommentaren "/* EXTRACT */"
    im HTML-Teil, um die Aufteilung vorzunehmen.
  - Lege für jeden Ort ein Audiodatei an (mp3/ogg). Nenne sie z.B. "platz1.mp3" etc.
  - Passe die Hotspot-Positionen (left/top in %) an dein Kartenbild an.
  - Das Script unterstützt Hover (Desktop) und Tippen (Touch). Auf Touch-Geräten musst du
    einmal tippen, um den Sound zu starten; zweiter Tap stoppt ihn.
  - Zugänglichkeit: Hotspots sind fokussierbar (tabindex) und können per Enter/Space aktiviert
    (play/pause) werden. Audio hat Kontroll-UI (Lautstärke / Stummschalten).
  - Achtung: Browser-Policy kann Auto-Playback blockieren; Sounds starten üblicherweise nach
    erstem Nutzer-Interaktion.
-->

<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Campus-Karte — Hover-Sounds (Idee)</title>

  <style>
    /* -----------------------
       Basis-Layout (kann in styles.css)
       ----------------------- */
    :root{
      --map-max-width:1000px;
      --hotspot-size:44px;
      --ui-bg: rgba(255,255,255,0.92);
      --accent: #0b74de;
    }
    body{
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      margin:20px; display:flex; gap:20px; justify-content:center; align-items:flex-start;
      background:linear-gradient(#f7f9fc,#eef3f9);
      color:#1b1b1b;
    }

    .container{max-width:var(--map-max-width); width:100%;}
    .header{display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px}
    h1{font-size:1.1rem; margin:0}
    .description{font-size:0.9rem; color:#444}

    .map-wrap{position:relative; background:var(--ui-bg); padding:12px; border-radius:12px; box-shadow:0 6px 20px rgba(19,40,80,0.08)}
    .map{position:relative; width:100%; height:auto; max-height:70vh; overflow:hidden}
    .map img{display:block; width:100%; height:auto; border-radius:6px}

    /* Hotspots: absolute positioned over the map */
    .hotspot{
      position:absolute; width:var(--hotspot-size); height:var(--hotspot-size);
      transform:translate(-50%,-50%); border-radius:50%; display:flex; align-items:center; justify-content:center;
      cursor:pointer; border:2px solid rgba(255,255,255,0.9); box-shadow:0 4px 12px rgba(0,0,0,0.12);
      background:linear-gradient(180deg, rgba(255,255,255,0.9), rgba(240,240,240,0.9));
      transition:transform .15s ease, box-shadow .15s ease;
    }
    .hotspot:focus, .hotspot:hover{transform:translate(-50%,-50%) scale(1.08); box-shadow:0 8px 20px rgba(11,116,222,0.18); outline:none}

    .hotspot .dot{width:12px; height:12px; border-radius:50%; background:var(--accent)}
    .hotspot[data-playing="true"]{box-shadow:0 10px 30px rgba(11,116,222,0.25)}

    /* Tooltip */
    .tooltip{position:absolute; transform:translate(-50%, calc(-100% - 12px)); background:#fff; border-radius:8px; padding:8px 10px; min-width:160px; font-size:0.85rem; box-shadow:0 6px 20px rgba(0,0,0,0.12); display:none}
    .hotspot:focus .tooltip, .hotspot:hover .tooltip, .hotspot[data-playing="true"] .tooltip{display:block}

    /* Controls */
    .controls{display:flex; gap:8px; align-items:center}
    .controls label{font-size:0.85rem}
    .ui-panel{margin-left:16px; padding:10px; border-radius:8px; background:rgba(255,255,255,0.96); box-shadow:0 6px 20px rgba(19,40,80,0.05)}

    /* mobile tweaks */
    @media (max-width:720px){
      body{margin:8px}
      .header{flex-direction:column; align-items:flex-start}
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1>Interaktive Campus-Karte — Sound-Hotspots</h1>
        <div class="description">Bewege die Maus über einen Punkt oder tippe auf Mobilgeräten, um ein kurzes Klangbeispiel des Ortes zu hören.</div>
      </div>

      <div class="ui-panel">
        <div style="display:flex; gap:12px; align-items:center;">
          <div class="controls">
            <label for="volume">Lautstärke</label>
            <input id="volume" type="range" min="0" max="1" step="0.01" value="0.9">
          </div>
          <button id="muteToggle" aria-pressed="false">Stumm</button>
        </div>
      </div>
    </div>

    <div class="map-wrap">
      <div class="map" id="map">
        <!-- Tausche das Bild src gegen eure Campus-Karte (SVG oder PNG/JPG). Empfohlen: SVG für scharfe Hotspot-Positionen. -->
        <img src="campus-map.jpg" alt="Karte des Campus" id="mapImage">

        <!-- Beispiel-Hotspots: Passe data-* und style left/top (in %) an. -->
        <button class="hotspot" data-audio="platz1.mp3" style="left:22%; top:34%" aria-label="Platz A" tabindex="0">
          <span class="dot"></span>
          <div class="tooltip">Platz A — Cafeteria (Hover/Tipp)</div>
        </button>

        <button class="hotspot" data-audio="platz2.mp3" style="left:58%; top:40%" aria-label="Hörsaal" tabindex="0">
          <span class="dot"></span>
          <div class="tooltip">Hörsaal — Vorlesungsbetrieb</div>
        </button>

        <button class="hotspot" data-audio="platz3.mp3" style="left:38%; top:68%" aria-label="Bibliothek" tabindex="0">
          <span class="dot"></span>
          <div class="tooltip">Bibliothek — leise Arbeitsatmosphäre</div>
        </button>

      </div>
    </div>

    <p style="font-size:0.85rem; color:#666; margin-top:10px">Tipp: Ersetze die Audiodateinamen (data-audio) durch eure realen Dateien. Unterstützte Formate: .mp3, .ogg.</p>
  </div>

  <script>
    /* -----------------------
       Einfaches JS (kann in script.js) — EXTRACT
       Funktionalitäten:
       - preload Audio-Objekte
       - play on pointerenter / stop on pointerleave
       - touch: toggle on click
       - keyboard: Enter/Space toggles
       - global volume + mute
       - sanfte FadeIn/FadeOut
       ----------------------- */

    (function(){
      const container = document.getElementById('map');
      const hotspots = Array.from(container.querySelectorAll('.hotspot'));
      const volumeControl = document.getElementById('volume');
      const muteBtn = document.getElementById('muteToggle');

      // Einstellung: Fade-Dauer in ms
      const FADE_MS = 250;

      // Map: audio element per hotspot
      const audioMap = new Map();

      // Hilfsfunktionen zum Fade
      function fadeIn(audio){
        audio.volume = 0;
        const target = parseFloat(volumeControl.value);
        const start = performance.now();
        audio.play().catch(()=>{}); // play promise may reject before user action
        function step(now){
          const t = Math.min(1,(now-start)/FADE_MS);
          audio.volume = t*target;
          if(t<1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }
      function fadeOut(audio){
        const startVol = audio.volume;
        const start = performance.now();
        function step(now){
          const t = Math.min(1,(now-start)/FADE_MS);
          audio.volume = startVol*(1-t);
          if(t<1) requestAnimationFrame(step);
          else try{ audio.pause(); audio.currentTime = 0; }catch(e){}
        }
        requestAnimationFrame(step);
      }

      // Preload audios
      hotspots.forEach(hs=>{
        const file = hs.dataset.audio;
        if(!file) return;
        const audio = new Audio(file);
        audio.preload = 'auto';
        audio.loop = false; // kurzes Sample — nicht loopen. Setze true wenn du Endlosschleife willst.
        audio.volume = parseFloat(volumeControl.value || 0.9);
        audioMap.set(hs, audio);
      });

      // Event handlers
      hotspots.forEach(hs=>{
        const audio = audioMap.get(hs);
        if(!audio) return;

        // Desktop: pointerenter / leave
        hs.addEventListener('pointerenter', (e)=>{
          // Only trigger hover on non-touch pointer to avoid double-trigger on touch
          if(e.pointerType === 'touch') return;
          hs.dataset.playing = 'true';
          audio.loop = false;
          fadeIn(audio);
        });
        hs.addEventListener('pointerleave', (e)=>{
          if(e.pointerType === 'touch') return;
          hs.dataset.playing = 'false';
          fadeOut(audio);
        });

        // Click / touch: toggle play/pause
        hs.addEventListener('click', (e)=>{
          // On touch devices a click is the expected behavior
          e.preventDefault();
          if(audio.paused){
            hs.dataset.playing = 'true';
            fadeIn(audio);
          } else {
            hs.dataset.playing = 'false';
            fadeOut(audio);
          }
        });

        // Keyboard accessibility: Enter/Space toggles
        hs.addEventListener('keydown', (e)=>{
          if(e.key === 'Enter' || e.key === ' '){
            e.preventDefault(); hs.click();
          }
        });

        // When audio ends, clear state
        audio.addEventListener('ended', ()=>{ hs.dataset.playing = 'false'; });
      });

      // Global volume
      volumeControl.addEventListener('input', ()=>{
        audioMap.forEach((audio)=>{
          audio.volume = parseFloat(volumeControl.value);
        });
      });

      // Mute toggle
      let muted = false;
      muteBtn.addEventListener('click', ()=>{
        muted = !muted; muteBtn.setAttribute('aria-pressed', String(muted));
        audioMap.forEach(a=>{ a.muted = muted; });
        muteBtn.textContent = muted ? 'Unstumm' : 'Stumm';
      });

      // Optional: stop all sounds when user clicks outside
      document.addEventListener('click', (e)=>{
        if(!container.contains(e.target)){
          audioMap.forEach((audio,hs)=>{
            if(!audio.paused){ fadeOut(audio); hs.dataset.playing = 'false'; }
          });
        }
      });

      // Helpful dev logging (deaktivieren für Produktion)
      window.__audioMap = audioMap;

    })();
  </script>

	<!doctype html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Campus Wilhelmshaven — Testkarte</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <h1>Interaktive Campus-Karte – Testgeräusche</h1>
    <div class="map-wrap">
      <div class="map" id="map">
        <!-- Hier dein Campusplan-Bild -->
		  <img src="Lageplan.png"
        <img src="campus-plan.png" alt="Campus Jade Hochschule Wilhelmshaven">

        <!-- Beispiel-Hotspots mit Testgeräuschen -->
        <button class="hotspot" data-audio="test1.mp3" style="left:45%; top:55%" aria-label="Hauptgebäude">
          <span class="dot"></span>
          <div class="tooltip">Hauptgebäude</div>
        </button>

        <button class="hotspot" data-audio="test2.mp3" style="left:60%; top:62%" aria-label="Mensa">
          <span class="dot"></span>
          <div class="tooltip">Mensa</div>
        </button>

        <button class="hotspot" data-audio="test3.mp3" style="left:40%; top:65%" aria-label="Bibliothek">
          <span class="dot"></span>
          <div class="tooltip">Bibliothek</div>
        </button>

        <button class="hotspot" data-audio="test4.mp3" style="left:30%; top:50%" aria-label="Labortrakt">
          <span class="dot"></span>
          <div class="tooltip">Laborgebäude</div>
        </button>

        <button class="hotspot" data-audio="test5.mp3" style="left:70%; top:40%" aria-label="Wohnheim">
          <span class="dot"></span>
          <div class="tooltip">Studentenwohnheim</div>
        </button>
      </div>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>

</body>
</html>

</body>
</html>
