/*
  Repères de départ :
  - le poids est laissé vide, car le PDF ne prescrit pas de poids fixe ;
  - les répétitions commencent au bas de la fourchette du PDF.
  Tu peux modifier ces repères dans l’application.
*/
window.startingPointDefaults = {};

Object.keys(programme.sessions).forEach(function (sessionKey) {
  window.startingPointDefaults[sessionKey] = programme.sessions[sessionKey].exercises.map(function (exercise) {
    const firstNumber = Number(exercise.reps.split("–")[0]);

    return {
      weight: "",
      reps: firstNumber
    };
  });
});
