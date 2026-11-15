# Mon carnet d’entraînement

Une petite application web pour consulter le programme de 8 semaines et noter les charges et répétitions de chaque séance.

## Comment lire le code

Le code est séparé par rôle, sans imposer une architecture compliquée :

- js/programme.js contient les données du programme : séances, exercices et consignes.
- js/config.js crée le repère de départ de chaque exercice : répétitions au bas de la fourchette et poids à choisir.
- js/storage.js contient les fonctions qui lisent et enregistrent les performances et les repères modifiés dans le navigateur.
- js/app.js affiche la page et réagit aux choix de séance, de semaine et aux saisies.
- style.css contient la présentation visuelle.
- index.html fournit la structure de départ et charge les fichiers JavaScript dans le bon ordre.

## Quelques notions utilisées

- Une fonction réalise une petite tâche. Par exemple, makeExerciseCard fabrique la carte d’un exercice.
- Un tableau est une liste. Les exercices d’une séance sont parcourus pour afficher leurs cartes.
- addEventListener permet de réagir à une action, comme sélectionner une séance ou modifier un poids.
- localStorage garde les saisies dans le navigateur. Elles restent propres à cet appareil et à ce navigateur.

Pour modifier les exercices, commence dans js/programme.js. Le poids et les répétitions de départ se règlent dans le navigateur avec « Modifier mon repère » ; les changements restent enregistrés sur cet appareil. Pour changer l’apparence, modifie style.css.
