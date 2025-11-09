// I had a lot of help from ChatGPT writing this entire javascript code.

// Created constant variables to get access to HTML elements using document.getElementById
const stancePage = document.getElementById('stance-page');
const southpawBtn = document.getElementById('southpaw-btn');
const orthodoxBtn = document.getElementById('orthodox-btn');
const proceedBtn = document.getElementById('proceed-btn');

const settingsPage = document.getElementById('settings-page');
const timerPage = document.getElementById('timer-page');

const startSessionBtn = document.getElementById('start-session-btn');
const startTimerBtn = document.getElementById('start-timer-btn');
const stopTimerBtn = document.getElementById('stop-timer-btn');
const cancelTimerBtn = document.getElementById('cancel-timer-btn');
const generateComboBtn = document.getElementById('generate-combo-btn');
const backToStanceBtn = document.getElementById('back-to-stance-btn');

const timerDisplay = document.getElementById('timer-display');
const phaseTitle = document.getElementById('phase-title');
const comboDisplay = document.getElementById('combo-display');

const bellSound = document.getElementById('bell-sound');
const buzzerSound = document.getElementById('buzzer-sound');

const openingPage = document.getElementById('opening-page');
const enterAppBtn = document.getElementById('enter-app-btn');


// State variables
let stance = null;
let totalRounds = 0;
let currentRound = 1;
let roundTime = 0;
let restTime = 0;
let timeLeft = 0;
let timerInterval = null;
let currentPhase = "ready";

let selectedStance = null;  // for stance selection before proceed

// Initialization -- This is how the page looks upon initialization.
openingPage.style.display = "block";
stancePage.style.display = "none";
settingsPage.style.display = "none";
timerPage.style.display = "none";
proceedBtn.disabled = true;
proceedBtn.setAttribute('aria-disabled', 'true');
generateComboBtn.disabled = true;

// Stance Selection Logic
function selectStance(stanceChoice) {
  selectedStance = stanceChoice;

  if (stanceChoice === "southpaw") {
    southpawBtn.classList.add('selected');
    orthodoxBtn.classList.remove('selected');
  } else if (stanceChoice === "orthodox") {
    orthodoxBtn.classList.add('selected');
    southpawBtn.classList.remove('selected');
  }

  proceedBtn.disabled = false;
  proceedBtn.setAttribute('aria-disabled', 'false');
}

southpawBtn.addEventListener('click', () => selectStance('southpaw'));
orthodoxBtn.addEventListener('click', () => selectStance('orthodox'));

enterAppBtn.addEventListener('click', () => {
  openingPage.style.display = 'none';
  stancePage.style.display = 'block';
});

proceedBtn.addEventListener('click', () => {
  if (!selectedStance) return;  // safety check

  stance = selectedStance;
  stancePage.style.display = 'none';
  settingsPage.style.display = 'block';
});

backToStanceBtn.addEventListener('click', () => {
  // Hide settings page if clicked
  settingsPage.style.display = 'none';

  // Show stance selection page
  stancePage.style.display = 'block';

  // Reset proceed button and stance selection:
  proceedBtn.disabled = true;
  proceedBtn.setAttribute('aria-disabled', 'true');

  // Clear selected stance highlight
  selectedStance = null;
  southpawBtn.classList.remove('selected');
  orthodoxBtn.classList.remove('selected');
});

// Start Session from Settings -- ChatGPT helped a lot with this whole part of the code.
startSessionBtn.addEventListener('click', () => {
  // Parse inputs (no defaulting here!)
  const roundsInput = document.getElementById('num-rounds').value.trim();
  const roundMinsInput = document.getElementById('round-minutes').value.trim();
  const roundSecsInput = document.getElementById('round-seconds').value.trim();
  const restMinsInput = document.getElementById('rest-minutes').value.trim();
  const restSecsInput = document.getElementById('rest-seconds').value.trim();

  const totalRoundsParsed = parseInt(roundsInput);
  const roundMinsParsed = parseInt(roundMinsInput);
  const roundSecsParsed = parseInt(roundSecsInput);
  const restMinsParsed = parseInt(restMinsInput);
  const restSecsParsed = parseInt(restSecsInput);

  // Validate inputs (simple checks)
  if (isNaN(totalRoundsParsed) || totalRoundsParsed < 1) {
    alert("Please enter a valid number of rounds (1 or more).");
    return;
  }

  if (
    isNaN(roundMinsParsed) || roundMinsParsed < 0 ||
    isNaN(roundSecsParsed) || roundSecsParsed < 0 || roundSecsParsed > 59
  ) {
    alert("Please enter a valid round time (minutes >= 0, seconds 0-59).");
    return;
  }

  if (
    isNaN(restMinsParsed) || restMinsParsed < 0 ||
    isNaN(restSecsParsed) || restSecsParsed < 0 || restSecsParsed > 59
  ) {
    alert("Please enter a valid rest time (minutes >= 0, seconds 0-59).");
    return;
  }

  // All good — assign validated values to globals
  totalRounds = totalRoundsParsed;
  roundTime = (roundMinsParsed * 60) + roundSecsParsed;
  restTime = (restMinsParsed * 60) + restSecsParsed;

  if (roundTime <= 0) {
    alert("Round time must be greater than 0 seconds.");
    return;
  }

  currentRound = 1;
  currentPhase = "ready";
  timeLeft = 5;  // ready countdown

  settingsPage.style.display = "none";
  timerPage.style.display = "block";

  fetchCombo(); // initial combo for READY phase
  updateDisplay();
  startCountdown();
});


// Timer Control Buttons
startTimerBtn.addEventListener('click', () => {
  if (!timerInterval) startCountdown();
});

stopTimerBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
});

cancelTimerBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;

  // Reset and go back to settings
  settingsPage.style.display = "block";
  timerPage.style.display = "none";

  comboDisplay.textContent = "";
  generateComboBtn.disabled = true;
});

// Generate combo button (enabled only during READY or REST phases) -- ChatGPT
generateComboBtn.addEventListener('click', () => {
  if (currentPhase === "rest" || currentPhase === "ready") {
    fetchCombo();
  }
});

// Timer Countdown
function startCountdown() {
  timerInterval = setInterval(() => {
    timeLeft--;
    updateDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      transitionPhase();
    }
  }, 1000);
}

// Phases
function transitionPhase() {
  if (currentPhase === "ready") {
    currentPhase = "round";
    timeLeft = roundTime;

    // Play bell at the start of the first round
    bellSound.currentTime = 0;
    bellSound.play();

  } else if (currentPhase === "round") {
    // Play buzzer at the end of round
    buzzerSound.currentTime = 0;
    buzzerSound.play();

    if (currentRound >= totalRounds) {
      phaseTitle.textContent = "DONE!";
      timerDisplay.textContent = "00:00";
      generateComboBtn.disabled = true;
      return;
    }

    currentPhase = "rest";
    timeLeft = restTime;

    fetchCombo(); // new combo during rest

  } else if (currentPhase === "rest") {
    currentRound++;
    currentPhase = "round";
    timeLeft = roundTime;

    // Play bell at the start of new round
    bellSound.currentTime = 0;
    bellSound.play();
  }

  updateDisplay();
  startCountdown();
}


// Update Timer -- Written with ChatGPT help.
function updateDisplay() {
  // Format mm:ss
  let mins = Math.floor(timeLeft / 60);
  let secs = timeLeft % 60;
  timerDisplay.textContent = `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;

  // Update phases
  if (currentPhase === "ready") {
    phaseTitle.textContent = "READY";
    generateComboBtn.disabled = false;
  } else if (currentPhase === "round") {
    phaseTitle.textContent = `ROUND ${currentRound}`;
    generateComboBtn.disabled = true;
  } else if (currentPhase === "rest") {
    phaseTitle.textContent = "REST";
    generateComboBtn.disabled = false;
  }
}

// Moves that lose prefix
const noPrefixMoves = new Set([
  "lead jab",
  "rear cross",
  "lead body jab",
  "rear body cross"
]);

function formatMove(move, stance) {
  if (noPrefixMoves.has(move)) {
    // Remove prefix from jab/cross
    return move.replace(/^(lead |rear )/, '');
  }
  // orthodox = right handed, southpaw = lefthanded
  if (stance === "orthodox") {
    if (move.startsWith("lead ")) {
      return move.replace("lead", "left");
    } else if (move.startsWith("rear ")) {
      return move.replace("rear", "right");
    }
  } else if (stance === "southpaw") {
    if (move.startsWith("lead ")) {
      return move.replace("lead", "right");
    } else if (move.startsWith("rear ")) {
      return move.replace("rear", "left");
    }
  }

  return move;
}

async function fetchCombo() {
  try {
    const response = await fetch('/combo');
    if (response.ok) {
      const data = await response.json();
      // data is array of moves
      const formattedCombo = data
        .map(move => formatMove(move, stance).toUpperCase())
        .join(' - ');;
      comboDisplay.textContent = formattedCombo;
    } else {
      comboDisplay.textContent = "Error loading combo";
    }
  } catch (err) {
    comboDisplay.textContent = "Error loading combo";
  }
}
