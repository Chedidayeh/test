# CAHIER DES CHARGES
## Application de Jeu de devinettes interactif basé sur des histoires pour les jeunes lecteurs

**Durée du projet :** 4 mois

---

## TABLE DES MATIÈRES

1. Présentation générale du projet
2. Analyse de l'existant
3. Expression des besoins
4. Identification des utilisateurs
5. Cas d'usage principaux
6. Exigences fonctionnelles détaillées
7. Modélisation du système
8. Spécifications techniques
9. Spécifications de l'intelligence artificielle
10. Spécifications de la base de données
11. Gestion des risques
12. Coûts et ressources
13. Planification du projet
14. Critères d'acceptation et validation
15. Limites et perspectives
16. Conclusion générale

---

## INTRODUCTION GÉNÉRALE

L'application proposée est une plateforme web interactive permettant à des enfants de renforcer leurs compétences en **lecture** et en **raisonnement** à travers des **histoires illustrées contenant des devinettes**. Le système adapte les aides (indices textuels, visuels, et éventuellement audio) en fonction du profil et des performances de l'enfant. Une interface d'administration permet aux enseignants et aux responsables pédagogiques de créer, gérer et analyser les histoires et devinettes.

Ce cahier des charges décrit de manière détaillée le contexte, les besoins fonctionnels et non fonctionnels, les contraintes, l'architecture cible ainsi que les critères d'acceptation du projet.

---

## 1. PRÉSENTATION GÉNÉRALE DU PROJET

### 1.1 Contexte et justification

- De nombreux enfants rencontrent des difficultés à développer durablement leurs compétences de lecture et de compréhension, en particulier lorsqu'ils sont confrontés à des supports peu engageants.
- Les enseignants manquent d'outils simples pour **adapter le niveau** et **analyser les difficultés individuelles** des élèves.

Dans ce contexte, le projet vise à proposer une solution numérique moderne, combinant **récits interactifs**, **défis sous forme de devinettes** et **intelligence artificielle**, afin d'offrir une expérience d'apprentissage personnalisée et motivante.

### 1.2 Objectifs du projet

- Renforcer les compétences de **lecture, compréhension et raisonnement logique** chez des enfants.
- Proposer un environnement ludique, basé sur des **histoires scénarisées** et des **défis progressifs**.
- Fournir des **indices adaptatifs** pour réduire la frustration et soutenir la persévérance.
- Permettre aux **enseignants/parents** de suivre l'évolution des enfants (temps passé, réussite, types d'erreurs, dépendance aux indices).
- Mettre à disposition un **back-office sécurisé** pour créer, gérer et analyser les contenus.

### 1.3 Périmètre du projet

Le périmètre couvre :
- Une application web (front-end) accessible depuis un navigateur récent.
- Un back-end gérant les histoires, devinettes, profils, sessions de jeu et statistiques.
- Un module d'**IA** pour : la génération d'indices, l'adaptation de la difficulté et la validation souple des réponses.
- Un **dashboard d'administration** (création/édition de contenus, consultation de statistiques).
- Un **dashboard de consultation** pour les parents/enseignants (lecture des indicateurs, sans modification de contenu).

---

## 2. ANALYSE DE L'EXISTANT

### 2.1 Solutions similaires

- Jeux de devinettes en ligne génériques (sites ou applications mobiles).
- Applications de lecture simple proposant des histoires standard.
- Plateformes EdTech intégrant des quiz ou QCM pour l'évaluation.

### 2.2 Limites des solutions existantes

- Peu de solutions combinent **narration riche + devinettes + adaptation intelligente** à l'enfant.
- Les indices sont souvent statiques, non personnalisés selon les erreurs commises.
- La validation des réponses est généralement **exacte** (correspondance stricte du texte), peu adaptée au langage naturel d'un enfant.
- Les tableaux de bord pédagogiques sont parfois limités ou trop complexes à exploiter pour les enseignants.

### 2.3 Valeur ajoutée de la solution proposée

- Moteur de devinettes **intégré dans une histoire**, renforçant la compréhension de texte.
- **Adaptation de la difficulté** en fonction des performances (temps, erreurs, usage des indices).
- **IA** pour : indices contextuels, validation souple des réponses (NLP), analyse de difficultés récurrentes.
- Dashboard administrateur complet (création, test, suivi, suggestions d'amélioration).
- Expérience pensée spécifiquement pour de jeunes lecteurs (6–11 ans) avec une interface simple et accessible.

---

## 3. EXPRESSION DES BESOINS

### 3.1 Besoins fonctionnels

#### 3.1.1 Côté enfant (Apprenant)

- Créer un profil simple (avatar, tranche d'âge, niveau de lecture optionnel).
- Parcourir une bibliothèque d'histoires ou suivre un parcours suggéré.
- Lire/écouter une histoire et répondre à des devinettes au fil du récit.
- Recevoir des indices progressifs en cas de difficulté.
- Obtenir un feedback clair : bonne réponse, presque correct, incorrect.
- Gagner des étoiles/badges et visualiser sa progression.

#### 3.1.2 Côté parent/enseignant

- Créer un compte et lier un ou plusieurs profils d'enfants.
- Consulter le temps passé, le nombre de devinettes réussies, les types d'erreurs fréquentes.
- Accéder à des **insights IA** (ex. « difficulté avec les devinettes d'inférence »).
- Exporter des rapports de progression.

#### 3.1.3 Côté administrateur/gestionnaire de contenu

- Gérer les histoires (créer, modifier, archiver).
- Gérer les devinettes associées : énoncé, réponse(s) acceptées, niveau de difficulté.
- Définir la stratégie d'indices (niveaux, type textuel/visuel/audio).
- Gérer les médias (images, sons) et prévisualiser le flux narratif.
- Tester les histoires comme un enfant (mode test) et simuler différents profils.
- Consulter des tableaux de bord (devinettes les plus ratées, temps moyen, points de décrochage).

### 3.2 Besoins non fonctionnels

#### 3.2.1 Performance

Le système doit garantir un temps de réponse inférieur à 2 secondes pour les interactions principales.

Le système doit supporter plusieurs utilisateurs simultanés.

Le système doit assurer une génération rapide des indices.

#### 3.2.2 Sécurité

Le système doit garantir la confidentialité des données des enfants.

Le système doit implémenter un mécanisme d'authentification sécurisé.

Le système doit protéger les données contre les accès non autorisés.

#### 3.2.3 Ergonomie et accessibilité

Le système doit proposer une interface simple et intuitive.

Le système doit être adapté aux enfants (lisibilité, couleurs, navigation).

Le système doit être accessible sur différents supports (PC, tablette).

#### 3.2.4 Fiabilité et disponibilité


Le système doit assurer la sauvegarde régulière des données.

Le système doit garantir la cohérence des données stockées.

#### 3.2.5 Scalabilité

Le système doit pouvoir évoluer pour accueillir un nombre croissant d'utilisateurs.

Le système doit permettre l'ajout futur de nouvelles fonctionnalités.

#### 3.2.6 Maintenabilité

Le système doit être modulaire et bien structuré.

Le code doit être documenté et versionné.

Le système doit permettre une maintenance facile et évolutive.

---

## 4. IDENTIFICATION DES UTILISATEURS

### 4.1 Types d'utilisateurs

- **Enfant / Apprenant** (6–11 ans)
- **Parent / Enseignant** (profil observateur)
- **Administrateur / Gestionnaire de contenu**

### 4.2 Rôles et responsabilités

- **Enfant** : joue, lit, répond aux devinettes, utilise les indices, progresse dans les histoires.
- **Parent / Enseignant** : consulte les rapports de progression, interprète les indicateurs, ajuste l'usage pédagogique de l'application.
- **Administrateur** : crée/édite les histoires et devinettes, valide les propositions de l'IA, surveille les statistiques globales, gère les médias.

### 4.3 Droits d'accès

- **Enfant** : accès à l'interface de jeu uniquement (pas d'accès aux paramètres système ni aux données des autres utilisateurs).
- **Parent / Enseignant** : accès en lecture aux rapports et aux profils d'enfants associés, aucun droit de modification sur les contenus narratifs.
- **Administrateur** : accès complet au back-office (création, modification, suppression de contenus, consultation avancée des statistiques).

---

## 5. CAS D'USAGE PRINCIPAUX

### CAS 5.1 : Enfant joue à une histoire

**Acteur :** Enfant / Apprenant

**Préconditions :** Enfant authentifié, profil créé

**Flux principal :**
1. Enfant sélectionne une histoire dans la bibliothèque
2. Histoire se charge avec illustrations et texte
3. À chaque point clé, une devinette apparaît
4. Enfant soumet une réponse (texte ou choix)
5. Système valide la réponse et fournit un feedback
6. En cas d'erreur, enfant peut demander un indice
7. Histoire progresse jusqu'à la fin
8. Progression et récompenses sont enregistrées

**Postconditions :** Session terminée, statistiques mises à jour

### CAS 5.2 : Parent consulte les progrès de son enfant

**Acteur :** Parent / Enseignant

**Préconditions :** Parent authentifié, enfant lié à son compte

**Flux principal :**
1. Parent accède au tableau de bord
2. Sélectionne l'enfant concerné
3. Consulte les statistiques (temps, réussite, types d'erreurs)
4. Lit les insights IA sur les domaines de difficulté
5. Exporte un rapport si nécessaire

**Postconditions :** Rapport généré et consulté

### CAS 5.3 : Administrateur crée une nouvelle histoire

**Acteur :** Administrateur

**Préconditions :** Administrateur authentifié

**Flux principal :**
1. Administrateur accède au back-office
2. Crée une nouvelle histoire (titre, description, niveau)
3. Rédige le contenu narratif
4. Ajoute illustrations et contenus multimédias
5. Crée des devinettes associées (énoncé, réponses acceptées, difficulté)
6. Définit les indices progressifs pour chaque devinette
7. Teste l'histoire en mode apprenant (simulation de profils)
8. Valide et publie l'histoire

**Postconditions :** Histoire disponible pour les enfants

---

## 6. EXIGENCES FONCTIONNELLES DÉTAILLÉES

### 6.1 Gestion des utilisateurs

Le système doit permettre l'inscription et l'authentification des utilisateurs selon leur rôle.

Le système doit gérer plusieurs types d'utilisateurs :
- Apprenant (enfant)
- Parent / éducateur
- Administrateur

Le système doit permettre la gestion des profils (âge, niveau, préférences).

Le système doit assurer une gestion sécurisée des sessions utilisateur.

### 6.2 Interaction apprenant – jeu éducatif

Le système doit proposer des histoires interactives adaptées à l'âge de l'apprenant.

Le système doit afficher des énigmes intégrées au scénario.

Le système doit permettre à l'apprenant de soumettre une réponse (texte ou choix).

Le système doit évaluer les réponses fournies par l'apprenant.

Le système doit fournir un retour immédiat (correct, partiellement correct, incorrect).

Le système doit proposer des récompenses (points, badges, progression).

### 6.3 Gestion des indices (Hints)

Le système doit fournir des indices progressifs en cas d'échec.

Le système doit proposer différents types d'indices :
- Texte
- Image
- Audio (optionnel)

Le système doit adapter les indices selon les performances de l'apprenant.

Le système doit éviter de révéler directement la réponse.

### 6.4 Adaptation intelligente du niveau

Le système doit analyser les performances de l'apprenant :
- Temps de réponse
- Nombre de tentatives
- Utilisation des indices

Le système doit ajuster automatiquement le niveau de difficulté.

Le système doit garantir une progression fluide et motivante.

### 6.5 Validation intelligente des réponses (NLP)

Le système doit accepter des réponses équivalentes ou proches de la réponse correcte.

Le système doit détecter les réponses partiellement correctes.

Le système doit fournir des encouragements personnalisés.

### 6.6 Tableau de bord Parent / Éducateur

Le système doit permettre la consultation des progrès de l'apprenant.

Le système doit afficher des statistiques de performance.

Le système doit fournir des observations générées automatiquement (insights IA).

Le système doit permettre l'export de rapports en PDF.

### 6.7 Administration du contenu

Le système doit permettre à l'administrateur de créer, modifier et supprimer :
- Histoires
- Énigmes
- Indices

Le système doit permettre l'ajout de contenus multimédias.

Le système doit offrir un mode de test des contenus.

Le système doit fournir des statistiques globales d'utilisation.

---

## 7. MODÉLISATION DU SYSTÈME

### 7.1 Architecture globale

L'architecture du système est organisée selon une structure en couches distribuées, conçue pour garantir scalabilité, performance et maintenabilité :

**Couche Présentation (Front-end)**

L'application front-end est construite avec Next.js 14+, TailwindCSS et TypeScript. Elle fournit trois interfaces distinctes :
- Interface enfant/apprenant : dédiée au jeu interactif, avec des histoires, devinettes et gestion des indices
- Interface parent/enseignant : dashboard de consultation des progrès et statistiques de performance
- Interface administrateur : back-office pour création/gestion des histoires, devinettes et contenus multimédias

**Couche Communication**

La communication entre front-end et back-end s'effectue via :
- API REST (Node.js) : pour les requêtes synchrones (authentification, chargement de contenu, soumission de réponses)
- WebSocket : pour les mises à jour en temps réel (notifications, mises à jour de progression, synchronisation multi-onglets)

**Couche Métier et Services**

Le back-end Node.js intègre :
- Moteur de jeu : gestion des histoires, progression des devinettes, états de session
- Service d'authentification : gestion des utilisateurs par rôle (Auth.js)
- Services IA : trois modules spécialisés (génération d'indices, validation NLP, adaptation de difficulté)
- Couche d'accès aux données : via ORM Prisma

**Couche Persistance**

Les données sont stockées et gérées par :
- PostgreSQL (base de données relationnelle) : utilisateurs, profils enfants, histoires, devinettes, indices, sessions, logs de tentatives et analytics


Cette architecture modulaire et découplée permet une évolution progressive du système, l'ajout de nouvelles fonctionnalités sans impact sur les modules existants, et le remplacement futur des fournisseurs IA.

### 7.2 Composants principaux

1. **Front-end (Next.js)** : Interface utilisateur responsive pour enfants, parents et administrateurs
2. **API REST (Node.js)** : Endpoints pour authentification, jeu, statistiques, admin
3. **Moteur de jeu** : Gestion des histoires, défilement, états des devinettes, progression
4. **Services IA** : Génération d'indices, validation NLP, adaptation de difficulté
5. **Base de données (PostgreSQL)** : Utilisateurs, profils, histoires, devinettes, statistiques

---

## 8. SPÉCIFICATIONS TECHNIQUES

### 8.1 Choix technologiques

**Front-end :**
- Framework : Next.js 14+
- Styling : TailwindCSS
- Langage : TypeScript
- État : React Query / Zustand
- Internationalisation : i18n pour support multilingue

**Back-end :**
- Runtime : Node.js 18+ LTS
- Framework : Next.js API Routes
- Langage : TypeScript
- Authentification : Auth.js (NextAuth.js)
- Validation : Zod

**Base de données :**
- SGBDR : PostgreSQL
- ORM : Prisma

**Intelligence Artificielle :**
- Langchain pour orchestration des agents IA et gestion des prompts
  - Chaînes de traitement (Chains) : coordination des appels IA multiples
  - Agents réactifs : prise de décision autonome basée sur les performances
  - Memory management : gestion du contexte historique (session, profil enfant)
- Options de fournisseurs :
  - **OpenAI/Gemini** pour génération d'indices contextuels
  - **HuggingFace** pour NLP open-source et embeddings
  - **Sentence Transformers** pour embeddings

**Authentification :**
- Auth.js avec OAuth Google pour parents
- Authentification simple (email/mot de passe) pour enfants
- Session sécurisée (JWT)

**Déploiement :**
- Hosting : Vercel (front-end + serverless API)
- Base de données : Supabase ou Neon (PostgreSQL managée)
- Monitoring : Vercel Analytics


### 8.2 Environnement de développement

- Gestion du code source via Git/GitHub
- Environnement Node.js récent (LTS)
- Utilisation de npm pour la gestion des dépendances
- ESLint + Prettier pour formatage du code

### 8.3 Gestion des versions

- Utilisation de branches Git : main, develop, feature/*, release/*
- Semantic Versioning pour les releases

### 8.4 Déploiement

- Déploiement continu sur Vercel
- Environnement de staging pour tests pré-production

---

## 9. SPÉCIFICATIONS DE L'INTELLIGENCE ARTIFICIELLE

### 9.1 Objectifs de l'IA

- Générer des indices contextuels et progressifs
- Adapter dynamiquement la difficulté aux performances de l'enfant
- Valider les réponses en langage naturel de manière souple (NLP)
- Produire des insights pédagogiques pour les adultes

### 9.2 Composants IA

#### 9.2.1 Module de génération d'indices

**Fonction :** Génère des indices progressifs à partir du texte de la devinette, du contexte narratif et des erreurs de l'enfant.

**Entrées :**
- Énoncé de la devinette
- Contexte de l'histoire
- Réponses incorrectes précédentes
- Profil de l'enfant (âge, niveau)
- Tentative actuelle (1er indice, 2e indice, etc.)

**Sorties :**
- Indice textuel progressif (moins révélateur → plus révélateur)
- Indice visuel (image/illustration)
- Indice audio (optionnel)

**Stratégie :**
- Niveau 1 : Indice thématique
- Niveau 2 : Indice contextuel plus précis
- Niveau 3 : Presque la réponse (sans la révéler)

#### 9.2.2 Module d'adaptation de difficulté

**Fonction :** Ajuste automatiquement le niveau de difficulté en fonction des performances.

**Métriques analysées :**
- Temps de réponse (seuil : <10s = facile, >30s = difficile)
- Nombre de tentatives (1 tentative = augmenter difficulté, >3 tentatives = diminuer)
- Utilisation d'indices (usage fréquent = réduire difficulté)
- Taux de réussite global (viser 70–80%)

**Décisions :**
- Augmenter difficulté : énigmes plus complexes
- Maintenir : continuer au même niveau
- Diminuer difficulté : énigmes plus simples, plus d'indices disponibles

**Implémentation :**
- Règles heuristiques (première phase)
- Modèle ML optionnel (deuxième phase)

#### 9.2.3 Module NLP pour validation des réponses

**Fonction :** Valide les réponses en langage naturel avec flexibilité.

**Approche :**
- Embeddings textuels (Sentence Transformers ou OpenAI embeddings)
- Similarité cosinus entre réponse utilisateur et réponses correctes acceptées
- Seuil de similarité : 0.7 = correct, 0.5–0.7 = partiellement correct, <0.5 = incorrect

**Gestion des variations :**
- Minuscules/majuscules
- Accents et caractères spéciaux
- Pluriels et flexions
- Synonymes proches

**Fallback :**
- Si NLP incertain, demander confirmation humaine (admin)

#### 9.2.4 Module d'analyse des données pour insights pédagogiques

**Fonction :** Génère des observations automatiques sur les difficultés de l'enfant.

**Exemples d'insights :**
- "Difficulté avec les devinettes d'inférence"
- "Réussite progressive en compréhension de texte"
- "Dépendance aux indices décroissante"

**Données exploitées :**
- Taux de réussite par type de devinette
- Temps moyen par devinette
- Nombre d'indices utilisés
- Progression sur 1 semaine, 1 mois

### 9.3 Flux de décision IA

Flux type :
1. **Action utilisateur** (réponse, demande d'indice) → capture des données
2. **Envoi au service IA concerné** (validation, indice, adaptation)
3. **Retour de la décision ou du contenu** (indice, classification de la réponse, mise à jour de la difficulté)
4. **Mise à jour de l'interface et des statistiques**

### 9.4 Données exploitées

- Texte des devinettes et des histoires
- Profil de l'enfant (âge, niveau, préférences)
- Historique des tentatives (temps, nombre d'essais, indices utilisés)
- Historique de réussite/échec par type de devinette
- Sessionshistoriques (pour analytics)

### 9.5 Limites et risques

| Risque | Mitigation |
|--------|-----------|
| Coût et latence des appels IA | Caching d'indices, fallback hors ligne |
| Génération de contenus inappropriés | Validation humaine, filtrage des prompts |
| Dépendance à un fournisseur IA | Service wrapper abstrait, contrats multi-fournisseurs |
| Biais ou stéréotypes | Review humaine, tests de bias |
| Perte de service IA | Mode dégradé avec indices pré-générés en DB |

---

## 10. SPÉCIFICATIONS DE LA BASE DE DONNÉES

### 10.1 Modélisation relationnelle

**Système de gestion :** PostgreSQL 14+

**ORM :** Prisma

### 10.2 Tables principales

#### users
- id (UUID, PK)
- email (unique)
- password_hash
- role (child, parent, admin)
- created_at
- updated_at

#### child_profiles
- id (UUID, PK)
- user_id (FK)
- age
- reading_level
- avatar_url
- preferences (JSON)
- created_at
- updated_at

#### stories
- id (UUID, PK)
- title
- description
- content (text)
- age_group
- difficulty_level
- created_by (FK users)
- published_at
- archived_at
- created_at
- updated_at

#### riddles
- id (UUID, PK)
- story_id (FK)
- sequence_number
- question_text
- correct_answers (array)
- difficulty
- type (text, multiple_choice, drag_drop)
- created_at
- updated_at

#### hints
- id (UUID, PK)
- riddle_id (FK)
- level (1, 2, 3)
- hint_text
- hint_image_url
- hint_audio_url
- created_at
- updated_at

#### user_sessions
- id (UUID, PK)
- child_id (FK)
- story_id (FK)
- started_at
- ended_at
- completed (boolean)

#### attempt_logs
- id (UUID, PK)
- session_id (FK)
- riddle_id (FK)
- user_answer
- is_correct (boolean)
- classification (correct, partial, incorrect)
- hints_used
- time_taken
- attempted_at

#### analytics
- id (UUID, PK)
- child_id (FK)
- metric_name
- metric_value
- calculated_at

---

## 11. GESTION DES RISQUES

### Risques identifiés et stratégies de mitigation

| # | Risque | Impact | Probabilité | Stratégie de mitigation |
|---|--------|--------|-------------|------------------------|
| R1 | Dépassement du budget AI | Élevé | Moyen | Caching agressif, limite quotidienne d'appels IA, fallback hors ligne |
| R2 | Latence IA excessive | Moyen | Moyen | Tests de performance préalables, SLA négocié, queue asynchrone |
| R3 | Qualité des indices générés | Moyen | Moyen | Validation humaine, filtrage des prompts, tests de bias |
| R4 | Perte de données utilisateur | Critique | Très bas | Backups quotidiens, réplication, ACID compliance |
| R5 | Sécurité des données enfant | Critique | Bas | Chiffrement, auth.js, GDPR/COPPA compliance, audit logs |
| R6 | Surcharge serveur (scalabilité) | Moyen | Bas | Auto-scaling Vercel, CDN, DB read replicas |
| R7 | Dépendance à un fournisseur IA | Moyen | Moyen | Service wrapper abstrait, contrats d'alternative |
| R8 | Manque d'adoption utilisateurs | Moyen | Moyen | Tests utilisateurs précoces, feedback parents, itérations rapides |

---

## 12. COÛTS ET RESSOURCES

### 12.1 Ressources nécessaires

**Équipe de développement :**
- 1 Product Manager / Chef de projet
- 2 Développeurs Full-Stack (Next.js + Node.js)
- 1 Designer UX/UI
- 1 QA / Testeur

**Ressources externes :**
- Services cloud (Vercel, Supabase/Railway, OpenAI/Claude)
- Outils de monitoring (Sentry, Vercel Analytics)

### 12.2 Estimation budgétaire (4 mois)

| Catégorie | Coût estimé |
|-----------|------------|
| Salaires équipe (4 mois) | 40 000–50 000 € |
| Services cloud & hosting | 500–1 000 € |
| APIs IA (développement + tests) | 1 000–2 000 € |
| Outils & licences logicielles | 500–1 000 € |
| **TOTAL** | **42 000–54 000 €** |

**Note :** Une réduction significative est possible avec une équipe freelance / offshore ou une infrastructure open-source partiellement.

---

## 13. PLANIFICATION DU PROJET

### 13.1 Méthodologie adoptée

Le projet adopte une **méthodologie itérative et incrémentale**, inspirée des approches **Agile**, afin de permettre une évolution progressive du système et une validation continue des fonctionnalités.

Le développement est organisé en **cycles courts (sprints)**, chaque cycle donnant lieu à une version fonctionnelle partielle du système. Cette approche permet :
- Une meilleure gestion des risques
- Une intégration progressive des fonctionnalités complexes (notamment l'IA)
- Une adaptation continue en fonction des retours et contraintes du projet

### 13.2 Planning prévisionnel (durée totale : 4 mois)

#### **Mois 1 (2 semaines) : Analyse et conception**

- Étude du contexte et des besoins
- Rédaction et validation du cahier des charges
- Analyse des utilisateurs et des cas d'utilisation
- Conception de l'architecture globale
- Modélisation UML (diagrammes principaux)
- Conception de la base de données (MCD/MLD)
- Réalisation de maquettes initiales

**Livrable :** Cahier des charges validé, maquettes, architecture documentée

#### **Mois 1–2 (5 semaines) : Développement du noyau applicatif (MVP)**

- Mise en place de l'environnement de développement
- Implémentation de l'UI initiale (composants React)
- Implémentation de l'authentification et des rôles (Auth.js)
- Développement du moteur de jeu basique
- Implémentation du flux apprenant (lecture, énigmes, réponses simples)
- Création du back-office minimal (gestion des histoires et énigmes)
- Tests fonctionnels du MVP

**Livrable :** Version MVP fonctionnelle (enfant + admin basique)

#### **Mois 2–3 (5 semaines) : Intégration des fonctionnalités intelligentes**

- Collecte et structuration des données de performance utilisateur
- Intégration des indices intelligents (AI)
- Implémentation de la validation des réponses par NLP
- Mise en place de l'adaptation automatique du niveau
- Développement du module d'analytics basic
- Optimisation de l'expérience utilisateur
- Tests fonctionnels et techniques

**Livrable :** Version enrichie avec IA, premier dashboard parent basic

#### **Mois 4 (4 semaines) : Finalisation, tests et déploiement**

- Développement du tableau de bord parent/enseignant complet
- Amélioration du tableau de bord administrateur
- Tests globaux (fonctionnels, performance, sécurité, accessibilité)
- Correction des bugs et optimisation
- Déploiement sur Vercel (environnement de démonstration)
- Rédaction de la documentation technique
- Préparation de la démonstration finale et du rapport

**Livrable :** Version finale stable et déployée

### 13.3 Jalons du projet

- **J1** : Validation du cahier des charges
- **J2** : Validation de l'architecture et des modèles de conception
- **J3** : Livraison du prototype fonctionnel (flux apprenant simple)
- **J4** : Livraison de la version MVP avec back-office
- **J5** : Intégration des premières fonctionnalités IA
- **J6** : Livraison de la version finale candidate à la soutenance

### 13.4 Livrables attendus

- Cahier des charges validé
- Diagrammes de conception (UML, architecture)
- Code source documenté et versionné (GitHub)
- Application web fonctionnelle et déployée
- Documentation technique (API, base de données, IA, déploiement)
- Jeu de données de test (histoires et énigmes d'exemple)
- Rapport final du projet
- Vidéo de démonstration et slides de présentation

---

## 14. CRITÈRES D'ACCEPTATION ET VALIDATION

### 14.1 Critères fonctionnels

- Un enfant peut jouer au moins une histoire complète avec plusieurs devinettes
- Le système fournit des indices progressifs en cas d'erreur
- Les réponses proches sont reconnues comme « presque correctes » avec un feedback adapté
- Un administrateur peut créer/modifier une histoire et y associer des devinettes
- Un parent/enseignant peut consulter les statistiques d'un enfant
- Le système adapte la difficulté au fil du temps

### 14.2 Critères techniques

- L'application est déployée et accessible via un navigateur moderne (Chrome, Safari, Firefox, Edge)
- Les principaux parcours sont utilisables avec des temps de réponse < 2 secondes
- Les rôles et permissions sont correctement appliqués (enfant/parent/admin)
- Les données sont persistées correctement en base de données
- Les appels IA respectent le budget et les SLAs

### 14.3 Critères de qualité

- Couverture de tests unitaires > 70%
- Pas de failles de sécurité critique (OWASP Top 10)
- Accessibilité WCAG 2.1 (niveau AA) sur les parcours critiques
- Performance : First Contentful Paint < 1.5s, Largest Contentful Paint < 2.5s

### 14.4 Tests de validation

- Tests fonctionnels sur les principaux cas d'utilisation (CU 1–3)
- Tests d'accessibilité de base (navigation clavier, contrastes, lecteur d'écran)
- Tests de charge simples sur 50–100 utilisateurs concurrents
- Tests de sécurité (injection SQL, XSS, CSRF)
- Retours utilisateurs (test avec enfants réels et parents)

---

## 15. LIMITES ET PERSPECTIVES

### 15.1 Limites actuelles

- Dépendance initiale à des services d'IA externes (coût, latence, disponibilité)
- Périmètre fonctionnel limité pour la première version (MVP)
- Absence d'intégrations profondes avec des ENT/LMS spécifiques
- Support multilingue limité à la première langue
- Pas d'application mobile native

### 15.2 Évolutions futures

**Court terme (6–12 mois après MVP) :**
- Enrichissement du catalogue d'histoires et des types de devinettes (visuelles, audio, multimodales)
- Intégration de modèles IA locaux ou hybrides pour réduire les coûts
- Gamification avancée (systèmes de défis, compétitions)
- Support multilingue complet

**Moyen terme (1–2 ans) :**
- Application mobile dédiée (React Native ou Flutter)
- API publique pour intégration avec ENT/LMS
- Connecteurs spécifiques (Google Classroom, Microsoft Teams, etc.)
- Tableau de bord pédagogique avancé (ML pour prédictions)

**Long terme (2+ ans) :**
- Apprentissage fédéré (privacy-preserving ML)
- Réalité augmentée (AR) pour illustrations
- Tutoriat IA conversationnel (chatbot apprenant)
- Intégration avec dispositifs IoT éducatifs

---

## 16. CONCLUSION GÉNÉRALE

Ce cahier des charges décrit une solution EdTech complète et moderne qui combine **histoires interactives**, **défis sous forme de devinettes** et **intelligence artificielle** pour offrir une expérience d'apprentissage personnalisée aux jeunes lecteurs. Le projet se distingue par :

- **Approche centrée sur l'enfant** : interface intuitive, feedback encourageant, adaptation intelligente
- **Back-office complet pour les éducateurs** : création de contenus, analytics avancés, insights IA
- **Potentiel d'évolution** : architecture modulaire, service wrapper IA pour flexibilité future
- **Méthodologie pragmatique** : approche itérative, MVP rapide, intégration progressive de l'IA

La mise en œuvre progressive (MVP → enrichissements) permet de sécuriser les risques tout en garantissant une démonstration solide pour un jury, des investisseurs ou des partenaires éducatifs.

Le projet est ambitieux mais réaliste sur une durée de **4 mois** avec une équipe dédiée, et offre un fondement solide pour une commercialisation future ou une publication académique.

---

**Document rédigé le :** 3 février 2026  
**Version :** 1.0 (Final)  
**Statut :** Validé pour développement
