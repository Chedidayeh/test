# ADR 0001 — Database per Service

## Context

L'application Readdly adopte une architecture microservices avec 5 services principaux : Gateway, Content Service, Progress Service, AI Service, Auth Service.

La question se pose : comment organiser la persistance des données ?

Options :
1. **Monolithic Database** : Une seule base de données partagée par tous les services
2. **Database per Service** : Chaque service possède sa propre base de données (ou schéma)
3. **Hybrid** : Certains services partagent une DB, d'autres ont la leur

## Decision

Nous adoptons le **Database per Service** : chaque microservice gère sa propre base de données (ou schéma PostgreSQL séparé).

### Allocation

- **Content Service** → Schéma `content` : tables `stories`, `riddles`, `hints`, `media`
- **Progress Service** → Schéma `progress` : tables `attempts`, `sessions`, `metrics`
- **AI Service** → Schéma `ai` : tables `validation_cache`, `hint_cache`
- **Auth Service** → Schéma `auth` : tables `users`, `roles`, `sessions`
- **Gateway** → Pas de DB propre ; routage uniquement

## Rationale

### Avantages

1. **Découplage** : Chaque service peut évoluer son schéma indépendamment sans bloquer les autres.
2. **Scalabilité** : Si Progress Service reçoit beaucoup de tentatives, on peut scaler sa DB sans affecter Content Service.
3. **Résilience** : Une panne DB sur Content Service n'impacte pas Progress Service.
4. **Flexibilité technologique** : À l'avenir, on peut remplacer une DB (ex. AI Service → MongoDB pour logs) sans refonte globale.

### Désavantages potentiels

**Joins complexes** : Pas de requête SQL cross-service. Les agrégations doivent se faire au niveau application (Gateway).


## Implementation Details (MVP)

- **SGBDR** : PostgreSQL unique (ou multiples instances)
- **ORM** : Prisma (instance par service)
- **Schémas** : Séparation via schémas PostgreSQL ou bases de données distinctes
- **Seed Data** : Scripts seed par service

