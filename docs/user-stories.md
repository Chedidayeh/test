# User Stories — Readly (jeu de lecture)

## 1. Enfant — Jouer une histoire et répondre à une devinette

En tant qu'**enfant** (6–11 ans), je veux pouvoir sélectionner une histoire, la lire et répondre aux devinettes intégrées pour progresser et gagner des récompenses.

Critères d'acceptation
- L'enfant peut lister les histoires disponibles et en sélectionner une.
- L'histoire se charge avec texte et la lecture reprend là où elle s'était arrêtée (si session précédente existante).
- À chaque point clé, une devinette apparaît avec un espace du réponse basant sur le type du devinette
- Après soumission, le système affiche immédiatement le résultat : `Correct`, `Presque correct` ou `Incorrect`.
- Si l'enfant est en difficulté, il peut demander un indice. Au maximum 3 niveaux d'indices sont disponibles.
- La tentative et le résultat sont enregistrés dans le `Progress Service`.

## 2. Enfant — Utiliser les indices et voir la progression

En tant qu'**enfant**, je veux demander des indices progressifs et voir mes étoiles/badges pour rester motivé.

Critères d'acceptation
- L'enfant peut demander un indice depuis l'interface de la devinette.
- L'interface affiche une barre de progression et le total d'étoiles gagnées sur la session.
- Les actions (demande d'indice, réussite) sont persistées et visibles dans le tableau de bord parent (read-only).

## 3. Administrateur — Créer/éditer une histoire et des devinettes

En tant qu'**administrateur**, je veux pouvoir créer, modifier et publier des histoires et leurs devinettes via un back‑office pour enrichir le catalogue pédagogique.

Critères d'acceptation
- L'administrateur peut créer une nouvelle histoire (titre, description, niveau d'âge, médias associés).
- Pour chaque node narratif, l'administrateur peut ajouter une devinette avec : énoncé, réponses acceptées, niveau de difficulté, et jusqu'à 3 indices.
- L'administrateur peut prévisualiser l'histoire en mode `Simuler enfant` et tester les devinettes.
- L'histoire peut être `Draft` ou `Published` ; seules les histoires `Published` sont visibles par les enfants.

## 4. Progression / Parent — Consulter la progression d'un enfant

En tant que **parent/enseignant**, je veux consulter la progression d'un enfant pour suivre ses forces et faiblesses.

Critères d'acceptation
- Le parent peut sélectionner un enfant lié à son compte.
- Le tableau de bord montre : temps total de lecture, nombre de devinettes tentées, taux de réussite global, devinettes les plus échouées, nombre d'indices utilisés, histoires completées, histoire roadmap
