/*
  Application : affiche le programme et gère les interactions.
  Les données sont dans programme.js. La sauvegarde est dans storage.js.
*/

let currentWeek = 1;
let currentSession = getSelectedSession();

const exerciseImages = {
  "Presse à cuisses": "./assets/pressCuisse.png",
  "Leg curl assis": "./assets/legCurlAssis1.png",
  "Chest press à la machine": "./assets/chestPress.png",
  "Tirage horizontal assis à la machine": "./assets/tirageHorizAssis.png",
  "Élévations latérales aux haltères": "./assets/elevaLateralHaltere.png",
  "Extension triceps à la poulie haute, corde": "./assets/extTricepsPoulie.png",
  "Crunch à la machine": "./assets/CrunchMachine.png",
  "Développé incliné à la machine": "./assets/devIncliné.png",
  "Tirage vertical à la poulie haute": "./assets/tirageVertical.png",
  "Leg extension à la machine": "./assets/legCuisse.png",
  "Leg curl allongé": "./assets/legCurlAllongé.png",
  "Développé épaules à la machine": "./assets/devEpaule.png",
  "Curl biceps à la machine pupitre": "./assets/CurlBiceps.png",
  "Extension lombaire sur banc à 45°": "./assets/ExtLombaire.png",
  "Rowing à la machine, buste calé": "./assets/Rowing.png",
  "Butterfly / Pec deck": "./assets/Butterfly.png",
  "Abduction à la machine": "./assets/Abduction.png",
  "Curl biceps à la poulie basse": "./assets/CurlBicepsPoulieBasse.png",
  "Extension triceps poulie haute à la barre droite": "./assets/ExtenTricepsPoulieHaute.png"
};

const weekPhase = document.querySelector("#week-phase");
const weekNumber = document.querySelector("#week-number");
const weekPicker = document.querySelector("#week-picker");
const progressSummary = document.querySelector("#progress-summary");
const sessionPicker = document.querySelector("#session-picker");
const workout = document.querySelector("#workout");

function startApp() {
  currentWeek = getCurrentProgramWeek();
  addWeekOptions();
  addSessionButtons();
  weekPicker.value = String(currentWeek);
  updatePage();
}

function addWeekOptions() {
  for (let week = 1; week <= 8; week++) {
    const option = document.createElement("option");
    option.value = String(week);
    option.textContent = "Semaine " + week;
    weekPicker.append(option);
  }

  weekPicker.addEventListener("change", function () {
    currentWeek = Number(weekPicker.value);
    updatePage();
  });
}

function addSessionButtons() {
  for (const [sessionKey, session] of Object.entries(programme.sessions)) {
    const button = document.createElement("button");
    button.className = "session-tab";
    button.type = "button";
    button.dataset.session = sessionKey;
    button.innerHTML =
      '<span class="tab-letter">' + sessionKey + '</span>' +
      '<span class="tab-title">' + session.title + '</span>' +
      '<span class="tab-detail">' + session.focus.replace("Full body · ", "") + '</span>';

    button.addEventListener("click", function () {
      handleSessionChange(sessionKey);
    });
    sessionPicker.append(button);
  }
}

function handleSessionChange(sessionKey) {
  currentSession = sessionKey;
  saveSelectedSession(sessionKey);
  updatePage();
}

function updatePage() {
  updateSelectedButtons();
  updateWeekInformation();
  updateProgressSummary();
  showWorkout();
}

function updateSelectedButtons() {
  const buttons = document.querySelectorAll(".session-tab");

  buttons.forEach(function (button) {
    const isSelected = button.dataset.session === currentSession;
    button.setAttribute("aria-selected", isSelected);
  });
}

function updateWeekInformation() {

  const phase = programme.phases.find(function (item) {
    return item.weeks.includes(currentWeek);
  });

  weekPhase.textContent = phase.name;
  weekPhase.title = phase.guidance;
  weekNumber.textContent = "Semaine " + currentWeek + " sur 8";
}

function showWorkout() {
  const session = programme.sessions[currentSession];
  const phase = programme.phases.find(function (item) {
    return item.weeks.includes(currentWeek);
  });
  const exerciseCards = session.exercises.map(makeExerciseCard).join("");

  workout.innerHTML =
    makeWarmupSection() +
    makePhaseSection(phase) +
    makeWorkoutHeading(session) +
    makeSessionActions() +
    '<div class="exercise-list">' + exerciseCards + '</div>' +
    (session.cardio ? makeCardioCard(session.cardio) : "") +
    makeProgressionSection();

  addExerciseListeners();
  addSessionCompletionListener();
  updateProgressCount();
}

function makeSessionActions() {
  const completed = isSessionCompleted(currentWeek, currentSession);
  const label = completed ? "Séance validée · Annuler" : "Valider la séance";

  return '<div class="session-actions">' +
    '<button class="complete-session" type="button" aria-pressed="' + completed + '">' +
    label + "</button>" +
    "</div>";
}

function addSessionCompletionListener() {
  const button = workout.querySelector(".complete-session");

  button.addEventListener("click", function () {
    const completed = !isSessionCompleted(currentWeek, currentSession);
    saveSessionCompletion(currentWeek, currentSession, completed);
    updatePage();
  });
}

function makeWarmupSection() {
  const listItems = programme.warmup.map(function (tip) {
    return "<li>" + tip + "</li>";
  }).join("");

  return '<details class="guidance" open>' +
    "<summary>Avant de commencer</summary>" +
    "<ul>" + listItems + "</ul>" +
    "</details>";
}

function makePhaseSection(phase) {
  const progressionTips = programme.progression.map(function (tip) {
    return "<li>" + tip + "</li>";
  }).join("");

  return '<details class="progress-guidance" open>' +
    "<summary>Repère de progression · " + phase.name + "</summary>" +
    "<p>" + phase.guidance + "</p>" +
    "<details open><summary>Voir les repères du programme</summary>" +
    "<ul>" + progressionTips + "</ul></details>" +
    "</details>";
}

function makeWorkoutHeading(session) {
  return '<div class="workout-head">' +
    "<div>" +
    '<h2 class="workout-title">' + session.title +
    ' <span class="period">·</span> ' + session.focus + "</h2>" +
    '<p class="workout-subtitle">' + session.exercises.length +
    " exercices · 21 séries · " + session.duration +
    " · Semaine " + currentWeek + "</p>" +
    "</div>" +
    '<span class="workout-progress" id="progress-label"></span>' +
    "</div>";
}

function makeExerciseCard(exercise, index) {
  const record = getExerciseRecord(currentWeek, currentSession, index);
  const startingPoint = getStartingPoint(currentSession, index);
  const sets = makeSetFields(exercise, record);
  const doneClass = record.done ? " done" : "";
  const checked = record.done ? "checked" : "";

  return '<article class="exercise-card' + doneClass + '" data-exercise="' + index + '">' +
    '<div class="exercise-top">' +
    '<span class="exercise-number">' + String(index + 1).padStart(2, "0") + "</span>" +
    '<div class="exercise-info">' +
    '<h3 class="exercise-name">' + exercise.name + "</h3>" +
    '<div class="prescription">' + exercise.sets + " séries × " +
    exercise.reps + " répétitions · repos " + exercise.rest + "</div>" +
    "</div>" +
    '<input class="exercise-done" type="checkbox" aria-label="Marquer ' +
    exercise.name + ' comme terminé" ' + checked + ">" +
    "</div>" +
    makeExerciseImage(exercise) +
    makeStartingPointPanel(startingPoint) +
    '<div class="sets">' + sets + "</div>" +
    '<details class="exercise-details" open>' +
    "<summary>Muscles et consignes</summary>" +
    "<p><strong>Muscles principaux</strong> " + exercise.muscles + "</p>" +
    "<p><strong>Mise en place et exécution</strong> " + exercise.setup + "</p>" +
    "<p><strong>Respiration et repères</strong> " + exercise.breathing + "</p>" +
    "</details>" +
    "</article>";
}

function makeExerciseImage(exercise) {
  const imagePath = exerciseImages[exercise.name];
  if (!imagePath) return "";

  return '<details class="exercise-visual" open>' +
    "<summary>Illustration du mouvement</summary>" +
    '<img src="' + imagePath + '" alt="Illustration : ' + exercise.name + '">' +
    "</details>";
}

function makeStartingPointPanel(point) {
  const weightText = point.weight ? point.weight + " kg" : "à choisir";
  return '<div class="starting-point">' +
    '<p>Repère de départ : <strong class="starting-point-label">' +
    weightText + " · " + point.reps + " répétitions</strong></p>" +
    '<details class="starting-point-editor">' +
    "<summary>Modifier mon repère</summary>" +
    '<div class="starting-point-fields">' +
    '<label>Poids de départ (kg)' +
    '<input type="number" min="0" step="0.5" data-start-field="weight" value="' + point.weight + '">' +
    "</label>" +
    "<label>Répétitions de départ" +
    '<input type="number" min="1" step="1" data-start-field="reps" value="' + point.reps + '">' +
    "</label></div>" +
    '<button class="save-starting-point" type="button">Enregistrer</button>' +
    "</details></div>";
}

function makeSetFields(exercise, record) {
  let fields = "";

  for (let setIndex = 0; setIndex < exercise.sets; setIndex++) {
    const set = record.sets[setIndex] || {};

    fields += '<div class="set-field">' +
      "<label>POIDS · SÉRIE " + (setIndex + 1) + "</label>" +
      '<div class="field-wrap">' +
      '<input inputmode="decimal" type="number" min="0" step="0.5" ' +
      'placeholder="—" aria-label="Poids série ' + (setIndex + 1) + '" ' +
      'data-field="weight" data-set="' + setIndex + '" value="' + (set.weight || "") + '">' +
      "<span>kg</span></div></div>" +
      '<div class="set-field">' +
      "<label>RÉP. · SÉRIE " + (setIndex + 1) + "</label>" +
      '<div class="field-wrap">' +
      '<input inputmode="numeric" type="number" min="0" step="1" ' +
      'placeholder="' + exercise.reps + '" aria-label="Répétitions série ' + (setIndex + 1) + '" ' +
      'data-field="reps" data-set="' + setIndex + '" value="' + (set.reps || "") + '">' +
      "</div></div>";
  }

  return fields;
}

function makeCardioCard(cardio) {
  const details = cardio.details.map(function (tip) {
    return "<li>" + tip + "</li>";
  }).join("");

  return '<article class="cardio-card">' +
    '<p class="eyebrow">SÉANCE C · FIN DE SÉANCE</p>' +
    "<h3>" + cardio.title + "</h3>" +
    "<ul>" + details + "</ul>" +
    "</article>";
}

function makeProgressionSection() {
  return '<section class="progression-note">' +
    "<strong>Double progression</strong>" +
    "<p>" + programme.progression[0] + "</p>" +
    "</section>";
}

function addExerciseListeners() {
  const cards = workout.querySelectorAll(".exercise-card");

  cards.forEach(function (card) {
    addListenersToCard(card);
  });
}

function addListenersToCard(card) {
  const exerciseIndex = Number(card.dataset.exercise);
  const numberInputs = card.querySelectorAll('input[type="number"][data-field]');
  const doneCheckbox = card.querySelector(".exercise-done");
  const saveButton = card.querySelector(".save-starting-point");

  numberInputs.forEach(function (input) {
    input.addEventListener("input", function () {
      saveSetInput(input, exerciseIndex);
    });
  });

  doneCheckbox.addEventListener("change", function () {
    saveDoneStatus(doneCheckbox, card, exerciseIndex);
  });

  saveButton.addEventListener("click", function () {
    saveStartingPointFromForm(card, exerciseIndex);
  });
}

function saveStartingPointFromForm(card, exerciseIndex) {
  const weightInput = card.querySelector('[data-start-field="weight"]');
  const repsInput = card.querySelector('[data-start-field="reps"]');
  const details = card.querySelector(".starting-point-editor");
  const label = card.querySelector(".starting-point-label");
  const point = {
    weight: weightInput.value,
    reps: Number(repsInput.value)
  };

  saveStartingPoint(currentSession, exerciseIndex, point);
  label.textContent = (point.weight ? point.weight + " kg" : "à choisir") +
    " · " + point.reps + " répétitions";
  details.open = false;
}

function saveSetInput(input, exerciseIndex) {
  const record = getExerciseRecord(currentWeek, currentSession, exerciseIndex);
  const sets = record.sets.slice();
  const setIndex = Number(input.dataset.set);
  const fieldName = input.dataset.field;

  sets[setIndex] = Object.assign({}, sets[setIndex], {
    [fieldName]: input.value
  });

  saveExerciseRecord(currentWeek, currentSession, exerciseIndex, { sets: sets });
}

function saveDoneStatus(checkbox, card, exerciseIndex) {
  saveExerciseRecord(currentWeek, currentSession, exerciseIndex, {
    done: checkbox.checked
  });
  card.classList.toggle("done", checkbox.checked);
  updateProgressCount();
}

function updateProgressCount() {
  const exercises = programme.sessions[currentSession].exercises;
  let completed = 0;

  exercises.forEach(function (exercise, index) {
    const record = getExerciseRecord(currentWeek, currentSession, index);
    if (record.done) completed++;
  });

  const label = document.querySelector("#progress-label");
  if (label) label.textContent = completed + " / " + exercises.length + " terminés";
}

function updateProgressSummary() {
  let completedSessions = 0;
  const totalSessions = Object.keys(programme.sessions).length * 8;

  for (let week = 1; week <= 8; week++) {
    for (const sessionKey of Object.keys(programme.sessions)) {
      if (isSessionCompleted(week, sessionKey)) completedSessions++;
    }
  }

  const completedThisWeek = Object.keys(programme.sessions).filter(function (sessionKey) {
    return isSessionCompleted(currentWeek, sessionKey);
  }).length;

  progressSummary.textContent =
    completedSessions + " / " + totalSessions + " séances · " +
    completedThisWeek + " cette semaine";
}

document.addEventListener("DOMContentLoaded", startApp);
