**Objectifs du projet**

- Offrir une plateforme web ludique pour renforcer la compréhension de lecture des enfants (6–11 ans) via des histoires intégrant des devinettes.
- Proposer un parcours adaptatif simple : indices progressifs, reconnaissance des réponses proches et suivi de la progression.
- Fournir un back‑office minimal pour créer/éditer des histoires et devinettes, et un tableau de bord de consultation pour parents/enseignants.

**Périmètre du MVP**

- Interface enfant basique (lecture d'histoires, affichage de devinettes, saisie de réponses, demandes d'indices).
- Backend minimal composé de : API Gateway (BFF), Content Service (histoires + devinettes), Progress Service (sessions, tentatives, points) et Auth (JWT).
- Back‑office administrateur simple : créer/éditer/publier histoires et devinettes, définir niveaux d'indices.
- Mécanisme de validation des réponses : règle textuelle + liste de synonymes; AI en mode mock/fallback seulement.


**Fonctionnalités hors scope (pour la phase MVP)**

- Génération avancée d'indices par IA en production (modèles distants ou narrateur intelligent).
- Transcription/voix (TTS) et narration audio dynamique.
- Recommandations ai personnalisées avancées
- Intégration complète multi‑langues.


