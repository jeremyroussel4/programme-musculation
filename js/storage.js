/* Sauvegarde locale : ce fichier ne s’occupe que des performances. */
const STORAGE_KEY = "mon-carnet-sport-v1";
const COMPLETED_SESSIONS_KEY = "mon-carnet-seances-v1";
const SELECTED_SESSION_KEY = "mon-carnet-seance-active-v1";

function getAllRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (error) {
    // Si la sauvegarde est illisible, on repart d'une liste vide.
    return {};
  }
}

function getExerciseRecord(week, session, exerciseIndex) {
  const allRecords = getAllRecords();
  const key = `${week}-${session}-${exerciseIndex}`;

  return allRecords[key] || {
    sets: [{}, {}, {}],
    done: false
  };
}

function saveExerciseRecord(week, session, exerciseIndex, changes) {
  const allRecords = getAllRecords();
  const key = `${week}-${session}-${exerciseIndex}`;
  const oldRecord = getExerciseRecord(week, session, exerciseIndex);

  allRecords[key] = { ...oldRecord, ...changes };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allRecords));
}

function getStartingPoint(session, exerciseIndex) {
  try {
    const savedPoints = JSON.parse(localStorage.getItem("mon-carnet-reperes-v1") || "{}");
    const key = session + "-" + exerciseIndex;
    return savedPoints[key] || window.startingPointDefaults[session][exerciseIndex];
  } catch (error) {
    return window.startingPointDefaults[session][exerciseIndex];
  }
}

function saveStartingPoint(session, exerciseIndex, point) {
  const savedPoints = JSON.parse(localStorage.getItem("mon-carnet-reperes-v1") || "{}");
  const key = session + "-" + exerciseIndex;

  savedPoints[key] = point;
  localStorage.setItem("mon-carnet-reperes-v1", JSON.stringify(savedPoints));
}

function isSessionCompleted(week, session) {
  try {
    const completedSessions = JSON.parse(localStorage.getItem(COMPLETED_SESSIONS_KEY) || "{}");
    return Boolean(completedSessions[week + "-" + session]);
  } catch (error) {
    return false;
  }
}

function saveSessionCompletion(week, session, completed) {
  const completedSessions = JSON.parse(localStorage.getItem(COMPLETED_SESSIONS_KEY) || "{}");
  const key = week + "-" + session;

  if (completed) {
    completedSessions[key] = true;
  } else {
    delete completedSessions[key];
  }

  localStorage.setItem(COMPLETED_SESSIONS_KEY, JSON.stringify(completedSessions));
}

function getSelectedSession() {
  return localStorage.getItem(SELECTED_SESSION_KEY) || "A";
}

function saveSelectedSession(session) {
  localStorage.setItem(SELECTED_SESSION_KEY, session);
}

function getCurrentProgramWeek() {
  const startDateKey = "mon-carnet-date-debut";

  try {
    let startDate = localStorage.getItem(startDateKey);
    if (!startDate) {
      startDate = new Date().toISOString().slice(0, 10);
      localStorage.setItem(startDateKey, startDate);
    }

    const start = new Date(startDate + "T00:00:00");
    const today = new Date();
    const elapsedDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    return Math.min(8, Math.max(1, Math.floor(elapsedDays / 7) + 1));
  } catch (error) {
    return 1;
  }
}
