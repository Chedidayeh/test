# Architecture Microservices — Readdly

## Vue d'ensemble

L'application Readdly est organisée selon une architecture **microservices** avec API REST. Chaque service gère un domaine métier distinct et communique via HTTP. Une **API Gateway** centralise le routage et l'authentification.

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                        │
│              (Interface enfant + Admin + Parent)            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓ (HTTP/REST + JWT)
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (BFF)                        │
│              Port 4000, Routage + Auth JWT                  │
└──────┬──────────┬──────────────┬────────────────────────────┘
       │          │              │
       ↓          ↓              ↓
┌────────────┐ ┌─────────────┐ ┌──────────────┐ ┌────────────┐
│  Content   │ │  Progress   │ │      AI      │ │   Auth     │
│  Service   │ │   Service   │ │   Service    │ │  Service   │
│ (Port 3001)│ │ (Port 3002) │ │ (Port 3003)  │ │(Port 3004) │
└─────┬──────┘ └──────┬──────┘ └──────┬───────┘ └────┬───────┘
      │               │               │              │
      ↓               ↓               ↓              ↓
   ┌──────────────────────────────────────────────────┐
   │        PostgreSQL (ou schémas séparés)           │
   │   DB_CONTENT   DB_PROGRESS   DB_AI    DB_AUTH    │
   └──────────────────────────────────────────────────┘
```

---

## Services

### 1. API Gateway (BFF)

**Port :** 3000

**Description :** Point d'entrée unique pour le front-end. Gère :
- Routage des requêtes vers les services internes
- Validation et décodage JWT
- Injection du contexte utilisateur (userId, role) dans les headers
- Gestion des erreurs centralisée

**Responsabilités :**
- Authentification par JWT (vérification du token, extraction du userId et role)
- Routage intelligent : `/api/content/*` → Content Service, `/api/progress/*` → Progress Service, etc.
- Logging structuré des requêtes
- CORS et sécurité headers

**Endpoints clés :**
- `POST /api/auth/login` → Auth Service (création token JWT)
- `POST /api/auth/register` → Auth Service
- `GET /health` → réponse 200 OK

---

### 2. Content Service

**Port :** 3001

**Description :** Gère tout le contenu narratif (histoires, devinettes, indices, médias).

**Responsabilités :**
- CRUD histoires (create, read, update, publish, archive)
- Gestion des devinettes (énoncés, réponses acceptées, niveaux de difficulté)
- Gestion des 3 niveaux d'indices par devinette
- Gestion des médias (images, sons) — stockage local ou S3
- Endpoint `/health`

**Endpoints clés :**
- `GET /stories` — lister histoires publiées
- `GET /stories/:storyId` — détail + devinettes
- `POST /stories` — créer (admin only)
- `PUT /stories/:storyId` — éditer (admin only)
- `GET /riddles/:riddleId` — détail devinette
- `GET /health`

---

### 3. Progress Service

**Port :** 3002

**Description :** Enregistre et agrège les données de progression (tentatives, sessions, statistiques).

**Responsabilités :**
- Créer et mettre à jour les tentatives (`attempts`) — chaque réponse d'enfant
- Calculer les métriques : taux de réussite, temps moyen, décompte indices utilisés
- Fournir les agrégations pour le dashboard parent/admin
- Endpoint `/health`


**Endpoints clés :**
- `POST /attempts` — enregistrer une tentative
- `GET /users/:userId/metrics` — agrégation par enfant
- `GET /stories/:storyId/top-failed` — top N devinettes échouées
- `GET /health`

---

### 4. AI Service

**Port :** 3003

**Description :** Assistance IA pour la génération d'indices, validation sémantique et adaptation (mode mock au démarrage).

**Responsabilités :**
- Validation sémantique des réponses (NLP léger) — fallback sur règle simple
- Génération d'indices contextuels (mock au MVP)
- Génération du contenu des histoires et assistance suplémentaire pour la gestion des devinette (optionnel au MVP)
- Endpoint `/health`


**Endpoints clés :**
- `POST /validate-answer` — validation sémantique d'une réponse
- `POST /generate-hint` — génération indice (mock provider)
- `GET /health`

---

### 5. Auth Service

**Port :** 3004

**Description :** Gère l'authentification et les sessions utilisateur.

**Responsabilités :**
- Enregistrement utilisateur (parent/admin)
- Authentification (JWT token generation/validation)
- Gestion des rôles (enfant, parent, admin)
- Endpoint `/health`

**Base de données :** Schéma `auth` (tables : `users`, `roles`)

**Endpoints clés :**
- `POST /register` — créer compte
- `POST /login` — obtenir JWT token
- `GET /verify-token` — vérificateur pour Gateway
- `GET /health`

---

## Flux de communication

### Flux 1 : Enfant joue une histoire et répond à une devinette

```
Frontend (Enfant)
  │ POST /api/attempts { storyId, nodeId, answer }
  ↓ (JWT en header)
Gateway (port 3000)
  │ Valide JWT, injecte userId et role
  │ Route vers Progress Service + appelle AI Service
  ↓
Progress Service (port 3002)
  │ POST /attempts
  └─→ Enregistre tentative en DB (content.attempts)

AI Service (port 3003)
  │ POST /validate-answer { riddleId, answer }
  └─→ Retourne { isCorrect, similarity, feedback }

Gateway
  │ Agrège résultat (result + feedback)
  ↓
Frontend
  │ Affiche résultat : "Correct", "Presque", "Incorrect"
  └─→ Enregistre étoiles/XP dans Progress Service
```

### Flux 2 : Parent consulte la progression d'un enfant

```
Frontend (Parent)
  │ GET /api/progress/:childId
  ↓ (JWT + role=parent)
Gateway (port 3000)
  │ Valide JWT, vérifie que parent est lié à cet enfant
  ↓
Progress Service (port 3002)
  │ GET /users/:userId/metrics
  └─→ Agrège attempts, calcule taux de réussite, temps moyen

Gateway
  ↓
Frontend
  │ Affiche tableau de bord (progress, top failed riddles, etc.)
```

### Flux 3 : Admin crée une histoire

```
Frontend (Admin)
  │ POST /api/stories { title, description, riddles [...] }
  ↓ (JWT + role=admin)
Gateway (port 3000)
  │ Valide JWT et role
  ↓
Content Service (port 3001)
  │ POST /stories (admin only)
  └─→ Stocke histoire + devinettes + indices en DB

Gateway
  ↓
Frontend
  │ Affiche confirmation
```

---

## Rôle de la Gateway

La Gateway est un **BFF (Backend for Frontend)** qui :

1. **Centralise l'authentification** : Valide tous les JWT et enrichit les requêtes avec le contexte utilisateur (userId, role).
2. **Orchestre les appels microservices** : Certaines requêtes front demandent des données de plusieurs services (ex. afficher une histoire + les tentatives antérieures) → Gateway agrège les appels.
3. **Expose une API unifiée** : Le front-end ne connaît qu'une URL (Gateway), pas les ports internes des services.
4. **Gère les erreurs** : Fallback en cas d'indisponibilité d'un service (ex. si AI Service est down, on continue sans validation sémantique).

---

## Isolement des données

Chaque service possède **sa propre base de données** (ou schéma séparé) :

- **Content DB** : Tables pour histoires, devinettes, indices, médias
- **Progress DB** : Tables pour tentatives, sessions, statistiques
- **AI DB** : Tables pour cache validations, logs IA
- **Auth DB** : Tables pour utilisateurs, rôles, sessions JWT

**Avantage** : Services indépendants, scalabilité par service, facile remplacement d'un service.

