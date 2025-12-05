let level = 0;
const storageKey = "energy-escape-level";
const timerStartKey = "energy-escape-timer-start";
const timerFinalKey = "energy-escape-timer-final";
const secretKey = 13;
let timerInterval = null;
let timerRunning = false;
let timerFinished = false;
const introHtml = `
  <div class="room intro">
    <h2>🧪 Briefing 202 OS</h2>
    <p>Mission : valider des scénarios énergie–puissance issus de nos bancs d’essai. Pour chaque salle, sélectionnez les forces conservatives / non conservatives, les pertes, puis calculez Ec, Ep ou les distances attendues. Un seul jeu de réponses ouvre la porte.</p>
    <p>Quand vous appuyez sur COMMENCER, le chronomètre global démarre. Terminez toutes les salles pour figer votre temps.</p>
  </div>
`;

function decodeBits(enc) {
  return JSON.parse(atob(enc)).map(v => (v - secretKey) === 1 ? 1 : 0);
}

function decodeNums(enc) {
  return JSON.parse(atob(enc)).map(v => parseFloat(v) / secretKey);
}
const themes = [
  { primary: "#00ffcc", glow: "rgba(0,255,204,0.35)", bg1: "#0a1b1b", bg2: "#000000", accent: "#e0fffb" },
  { primary: "#ff8c42", glow: "rgba(255,140,66,0.35)", bg1: "#1f1208", bg2: "#090402", accent: "#ffe4cf" },
  { primary: "#7a5bff", glow: "rgba(122,91,255,0.35)", bg1: "#0f0b1d", bg2: "#04020b", accent: "#e6e1ff" },
  { primary: "#7aff8a", glow: "rgba(122,255,138,0.35)", bg1: "#0a1c0f", bg2: "#020903", accent: "#e8ffe6" },
  { primary: "#ff4d9a", glow: "rgba(255,77,154,0.35)", bg1: "#1b0a14", bg2: "#0a0407", accent: "#ffe1ef" },
  { primary: "#3ddfff", glow: "rgba(61,223,255,0.35)", bg1: "#0a1620", bg2: "#02070b", accent: "#e2f9ff" }
];


const rooms = [

/* ===============================
   SALLE 1 – QCM ÉNERGIE (concepts)
   =============================== */
{
  html: `
  <div class="room">
    <h2>🧩 SALLE 1</h2>
    <p>QCM ÉNERGIE — cocher toutes les affirmations correctes.</p>

    <label><input type="checkbox" id="h1">
      Le travail d’une force conservative est indépendant du chemin.
    </label><br>

    <label><input type="checkbox" id="h2">
      En champ uniforme (axe vertical vers le haut) : ΔEp = -W_cons.
    </label><br>

    <label><input type="checkbox" id="h3">
      Si ∑W(non conservatives) = 0, l’énergie mécanique se conserve.
    </label><br>

    <label><input type="checkbox" id="h4">
      La puissance instantanée d’une force est P = F·v.
    </label><br>

    <label><input type="checkbox" id="h5">
      Si une force est toujours perpendiculaire à la vitesse, Ec reste constante.
    </label><br>

    <label><input type="checkbox" id="h6">
      Les frottements solides peuvent être modélisés par une énergie potentielle.
    </label><br>

    <label><input type="checkbox" id="h7">
      Si le travail total des forces est nul, la norme de la vitesse ne change pas.
    </label><br>

    <label><input type="checkbox" id="h8">
      Toute force admet une énergie potentielle associée.
    </label>
  </div>
  `,
  check: () =>
    okBits(decodeBits("WzE0LDE0LDE0LDE0LDE0LDEyLDE0LDEyXQ=="))
},

/* ===============================
   SALLE 2 – Cercle rugueux (μ)
   =============================== */
{
  html: `
  <div class="room">
    <h2>🧩 SALLE 2</h2>
    <p>
      Bloc de masse <b>0.30 kg</b> sur table horizontale rugueuse.
      Trajectoire circulaire de rayon <b>1.0 m</b>.
      Vitesse : 5.8 m/s → 4.6 m/s en un tour.
    </p>

    <p>Hypothèses</p>
    <label><input type="checkbox" id="h1"> Force non conservative présente</label>
    <label><input type="checkbox" id="h2"> Énergie mécanique conservée</label>

    <p>Résultat</p>
    μ <input type="text" inputmode="decimal" id="r1">
  </div>
  `,
  check: () =>
    okBits(decodeBits("WzE0LDEyXQ==")) &&
    (() => {
      const [a] = decodeNums("WzEuMjM1XQ==");
      return okNum("r1",a);
    })()
},

/* ===============================
   SALLE 3 – Pente inclinée
   =============================== */
{
  html: `
  <div class="room">
    <h2>🧩 SALLE 3</h2>
    <p>
      Enfant de masse <b>30 kg</b> glissant depuis une hauteur
      <b>2.1 m</b> sur une pente de <b>28°</b>.
      Coefficient de frottement μ = 0.10.
    </p>

    <p>Hypothèses</p>
    <label><input type="checkbox" id="h1"> Force non conservative présente</label>
    <label><input type="checkbox" id="h2"> Énergie mécanique conservée</label>

    <p>Résultat</p>
    v en bas <input type="text" inputmode="decimal" id="r1"> m/s
  </div>
  `,
  check: () =>
    okBits(decodeBits("WzE0LDEyXQ==")) &&
    (() => {
      const [a] = decodeNums("Wzc0LjFd");
      return okNum("r1",a);
    })()
},

/* ===============================
   SALLE 4 – Puissance dissipée
   =============================== */
{
  html: `
  <div class="room">
    <h2>🧩 SALLE 4</h2>
    <p>
      Automobile de masse <b>1400 kg</b> roulant à <b>14.8 m/s</b>
      s’arrête complètement en <b>0.25 s</b>.
    </p>

    <p>Hypothèses</p>
    <label><input type="checkbox" id="h1"> Force non conservative présente</label>
    <label><input type="checkbox" id="h2"> Énergie mécanique conservée</label>

    <p>Résultat</p>
    P moyenne dissipée <input type="text" inputmode="decimal" id="r1"> W
  </div>
  `,
  check: () =>
    okBits(decodeBits("WzE0LDEyXQ==")) &&
    (() => {
      const [a] = decodeNums("Wzc5NTYwMDBd");
      return okNum("r1",a);
    })()
},

/* ===============================
   SALLE 5 – Cercle rugueux (arrêt)
   =============================== */
{
  html: `
  <div class="room">
    <h2>🧩 SALLE 5</h2>
    <p>
      Bloc de masse <b>1.8 kg</b> sur table horizontale rugueuse, trajectoire circulaire de rayon <b>1.0 m</b>.<br>
      Vitesse initiale : <b>7.5 m/s</b>. Après une révolution complète, la vitesse vaut <b>5.9 m/s</b>.
    </p>

    <p>Hypothèses</p>
    <label><input type="checkbox" id="h1"> Force non conservative présente</label>
    <label><input type="checkbox" id="h2"> Énergie mécanique conservée</label>

    <p>Résultat</p>
    Révolutions complètes supplémentaires avant arrêt <input type="text" inputmode="decimal" id="r1">
  </div>
  `,
  check: () =>
    okBits(decodeBits("WzE0LDEyXQ==")) &&
    (() => {
      const [a] = decodeNums("WzIxLjA2XQ==");
      return okNum("r1",a);
    })()
}

];


/* ===============================
   ENGINE
   =============================== */

function loadRoom() {
  applyTheme(level);
  const feedbackEl = document.getElementById("feedback");
  const validateBtn = document.getElementById("validate");
  const started = hasStarted();
  updateProgress();

  if (!started) {
    document.getElementById("room").innerHTML = introHtml;
    feedbackEl.innerText = "Clique sur COMMENCER pour lancer le chrono.";
    setButtons();
    return;
  }

  if (level >= rooms.length) {
    document.body.classList.add("finale");
    document.getElementById("room").innerHTML =
      "<div class='room final-room'><h2>🏁 LABORATOIRE DÉVERROUILLÉ</h2><p>Modélisation maîtrisée.</p><p class='congrats'>Bravo, toutes les portes sont ouvertes.</p></div>";
    feedbackEl.innerText = "Session terminée";
    if (validateBtn) validateBtn.disabled = true;
    finishTimer();
    setButtons();
    updateProgress(true);
    triggerFinale();
    return;
  }

  document.getElementById("room").innerHTML = rooms[level].html;
  feedbackEl.innerText = "";
  setButtons();
}

function okBits(target) {
  for (let i=1; i<=target.length; i++){
    const val = document.getElementById("h"+i).checked ? 1 : 0;
    if (val !== target[i-1]) {
      return false;
    }
  }
  return true;
}

function okNum(id,val) {
  const raw = document.getElementById(id).value.replace(",",".");
  return Math.abs(parseFloat(raw)-val) < 0.1;
}

function applyTheme(idx) {
  const theme = themes[Math.min(idx, themes.length-1)] || themes[0];
  const root = document.documentElement.style;
  root.setProperty("--primary", theme.primary);
  root.setProperty("--glow", theme.glow);
  root.setProperty("--bg1", theme.bg1);
  root.setProperty("--bg2", theme.bg2);
  root.setProperty("--accent", theme.accent);
}

function triggerUnlock() {
  document.body.classList.add("unlocking");
  setTimeout(() => document.body.classList.remove("unlocking"), 850);
}

function triggerFinale() {
  document.body.classList.add("finale");
  document.body.classList.add("flash");
  setTimeout(() => document.body.classList.remove("flash"), 1700);
}

function triggerError() {
  document.body.classList.add("error");
  setTimeout(() => document.body.classList.remove("error"), 650);
}

function setTimerDisplay(text) {
  const el = document.getElementById("timer");
  if (el) el.innerText = text;
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerRunning = false;
}

function hasStarted() {
  const start = parseInt(localStorage.getItem(timerStartKey));
  return timerRunning || timerFinished || (!Number.isNaN(start));
}

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
}

function updateTimer() {
  if (!timerRunning) return;
  const start = parseInt(localStorage.getItem(timerStartKey));
  if (Number.isNaN(start)) return;
  const elapsed = Date.now() - start;
  setTimerDisplay(formatTime(elapsed));
}

function startTimer(startAt) {
  if (timerFinished) return;
  stopTimer();
  document.body.classList.remove("timeup");
  const timerEl = document.getElementById("timer");
  if (timerEl) timerEl.classList.remove("warning");
  const start = startAt ?? Date.now();
  timerRunning = true;
  document.body.classList.add("started");
  localStorage.setItem(timerStartKey, String(start));
  localStorage.removeItem(timerFinalKey);
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
  setButtons();
  loadRoom();
}

function finishTimer() {
  if (timerFinished) return;
  const start = parseInt(localStorage.getItem(timerStartKey));
  stopTimer();
  timerFinished = true;
  if (!Number.isNaN(start)) {
    const elapsed = Date.now() - start;
    localStorage.setItem(timerFinalKey, String(elapsed));
    setTimerDisplay(formatTime(elapsed));
  }
  setButtons();
}

function restoreTimerState() {
  const final = parseInt(localStorage.getItem(timerFinalKey));
  if (!Number.isNaN(final)) {
    timerFinished = true;
    timerRunning = false;
    setTimerDisplay(formatTime(final));
    setButtons();
    return;
  }
  const start = parseInt(localStorage.getItem(timerStartKey));
  if (!Number.isNaN(start)) {
    startTimer(start);
  } else {
    timerRunning = false;
    setTimerDisplay("00:00");
    setButtons();
  }
}

function setButtons() {
  const startBtn = document.getElementById("start");
  const validateBtn = document.getElementById("validate");
  const started = hasStarted();
  const finished = timerFinished || level >= rooms.length;

  if (startBtn) {
    startBtn.style.display = started ? "none" : "inline-flex";
    startBtn.disabled = started || finished;
  }
  if (validateBtn) {
    validateBtn.style.display = (!started || finished) ? "none" : "inline-flex";
    validateBtn.disabled = !timerRunning || finished;
  }
}

function updateProgress(forceComplete=false) {
  const bar = document.getElementById("progress-bar");
  if (!bar) return;
  const total = rooms.length;
  const pct = forceComplete ? 1 : Math.min(level / total, 1);
  bar.style.width = `${(pct*100).toFixed(1)}%`;
}

function resetGame() {
  const ok = confirm("Valider pour remettre toute la session à zéro ?");
  if (!ok) return;
  stopTimer();
  timerFinished = false;
  timerRunning = false;
  level = 0;
  localStorage.removeItem(storageKey);
  localStorage.removeItem(timerStartKey);
  localStorage.removeItem(timerFinalKey);
  setTimerDisplay("00:00");
  const timerEl = document.getElementById("timer");
  if (timerEl) timerEl.classList.remove("warning");
  document.body.classList.remove("timeup");
  document.body.classList.remove("finale");
  document.body.classList.remove("started");
  setButtons();
  updateProgress();
  loadRoom();
}

function skipLevel() {
  const code = prompt("Mot de passe ?");
  if (code !== "yan98") return;
  if (!hasStarted()) {
    startTimer();
  }
  level = Math.min(level + 1, rooms.length);
  saveProgress();
  if (level >= rooms.length) {
    finishTimer();
  }
  loadRoom();
}

function clearInputs() {
  const inputs = document.querySelectorAll("#room input");
  inputs.forEach((el) => {
    if (el.type === "checkbox") {
      el.checked = false;
    } else {
      el.value = "";
    }
  });
}

function saveProgress() {
  try {
    localStorage.setItem(storageKey, String(level));
  } catch (e) {
    // ignore storage failures
  }
}

function restoreProgress() {
  try {
    const saved = parseInt(localStorage.getItem(storageKey));
    if (!Number.isNaN(saved) && saved >= 0 && saved <= rooms.length) {
      level = saved;
    }
  } catch (e) {
    level = 0;
  }
}

function check() {
  if (!timerRunning || timerFinished) return;
  if (level >= rooms.length) return;

  if (rooms[level].check()) {
    triggerUnlock();
    document.getElementById("feedback").innerText = "✅ Accès autorisé";
    level++;
    saveProgress();
    if (level >= rooms.length) {
      finishTimer();
    }
    setTimeout(loadRoom, 450);
  } else {
    document.getElementById("feedback").innerText = "❌ Porte verrouillée";
    triggerError();
    clearInputs();
  }
}

restoreProgress();
restoreTimerState();
loadRoom();
