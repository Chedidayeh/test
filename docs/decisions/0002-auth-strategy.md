# ADR 0002 — Authentification & Gestion des Rôles

## Context

Readdly supporte 3 types d'utilisateurs :
1. **Enfants** (6–11 ans) — jouent, avancent, gagnent des étoiles
2. **Parents/Enseignants** — consultent dashboard lecture enfant
3. **Administrateurs** — créent/éditent histoires et devinettes

La question : comment authentiquer et autoriser ces rôles ?

Options :
1. **OAuth uniquement** (Google/Facebook) — limité, pas de rôles granulaires
2. **JWT + Password** — contrôle total, mais gestion complexe mots de passe
3. **JWT + OAuth pour parents/admin, session simple pour enfants** — Hybrid
4. **Session-based (Express-session)** — traditionnel, mais moins scalable

## Decision

Nous adoptons une stratégie **JWT stateless + OAuth optionnel** :

- **Parents/Administrateurs** : Authentification par OAuth Google (+ fallback login/password JWT)
- **Enfants** : Authentification par identifiant simple (pas de mot de passe direct) lié à un parent
- **Tous** : JWT token (24h expiration) stocké côté front-end (localStorage)
- **Gateway** : Valide JWT et injecte userId + role dans les requêtes

### Flux d'authentification

#### Parents/Administrateurs

```
1. Frontend : OAuth button → Google
2. Google retourne ID token
3. Frontend envoie : POST /api/auth/verify-google { idToken: "..." }
4. Auth Service : Vérifie ID token Google, crée/met à jour User en DB
5. Auth Service : Génère JWT { userId, email, role }
6. Frontend : Stocke JWT dans localStorage
7. Requêtes futures : JWT en header Authorization: Bearer <token>
```

#### Enfants

```
1. Parent  crée profil enfant (Dashboard Parent)
2. Frontend : POST /api/auth/create-child-profile { parentId, name, age }
3. Auth Service : Crée enfant avec identifiant unique (ex. avatar + code)
4. Enfant accède via lien/code (ex. code "ABC123") → pas de mot de passe
5. Frontend : Envoie code enfant POST /api/auth/login-child { code }
6. Auth Service : Retourne JWT enfant (role: "child", childId, parentId)
7. Frontend : Stocke JWT
```

### Rôles et Permissions

**3 rôles** :

| Rôle | Droits | Accès |
|------|--------|-------|
| `child` | Jouer, lire histoires, voir sa progression | `/api/stories`, POST `/api/attempts`, GET `/api/progress/self` |
| `parent` | Consulter enfants liés (read-only progress) | GET `/api/progress/:childId` (enfants liés), export rapports |
| `admin` | CRUD complet histoires, devinettes, médias | POST/PUT `/api/stories/*`, GET `/api/stats` globales |

## Implementation Details (MVP)

### Auth Service Structure

```
src/
  routes/
    auth.routes.ts        # POST /register, POST /login, POST /verify-google
    health.routes.ts      # GET /health
  controllers/
    auth.controller.ts    # Login, register, JWT generation
  middleware/
    jwt.middleware.ts     # Valide token, injecte userId/role
  services/
    jwt.service.ts        # generateToken, verifyToken
    google.service.ts     # Vérification ID tokens Google
  db/
    schema.prisma         # Schema auth (users, roles, sessions)
```

### Gateway Integration

```
Request Flow:
1. Frontend → Gateway (authorization: Bearer <JWT>)
2. Gateway middleware : jwt.middleware.ts
   - Extrait token
   - Vérifie signature + expiration
   - Si valide : injecte x-user-id, x-user-role headers
   - Si invalide : retourne 401 Unauthorized
3. Gateway route handler :
   - Forward request à service target avec x-user-id, x-user-role
4. Service target :
   - Relit headers, applique vérifications role-based
   - Ex. POST /stories (admin only) : check role == "admin"
```




