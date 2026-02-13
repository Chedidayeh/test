# Implementation Plan - Readly Platform

## Interactive Story-Based Riddle Game for Young Readers

**Project Duration:** 4 months  
**Version:** 1.0  
**Last Updated:** 2026-02-06

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technical Architecture](#2-technical-architecture)
3. [Database Schema](#3-database-schema)
4. [Implementation Phases](#4-implementation-phases)
5. [Milestones & Timeline](#5-milestones--timeline)
6. [Feature Breakdown](#6-feature-breakdown)
7. [API Endpoints](#7-api-endpoints)
8. [Testing Strategy](#8-testing-strategy)
9. [Deployment Plan](#9-deployment-plan)
10. [Risk Mitigation](#10-risk-mitigation)

---

## 1. Project Overview

### 1.1 Vision
Readly is an interactive web platform that helps children (6-11 years) strengthen reading and reasoning skills through story-based riddles with AI-powered adaptive features.

### 1.2 User Types
| User Type | Age | Access Level |
|-----------|-----|--------------|
| Child/Learner | 6-11 | Game interface only |
| Parent/Educator | Adult | Read-only dashboard |
| Administrator | Adult | Full back-office access |

### 1.3 Core Features Priority

**Phase 1 (MVP):**
- User authentication & role management
- Story browsing and reading
- Basic riddle system
- Simple hint system (static)
- Admin story/riddle management

**Phase 2 (AI Integration):**
- AI-powered hint generation
- NLP-based answer validation
- Adaptive difficulty system
- Basic analytics

**Phase 3 (Complete):**
- Parent/educator dashboard
- Advanced analytics & AI insights
- Rewards & achievements system
- Performance optimization

---

## 2. Technical Architecture

### 2.1 Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Next.js 14+ (App Router)                             │   │
│  │ ├── /app/(child)/ - Child interface                   │   │
│  │ ├── /app/(parent)/ - Parent dashboard                 │   │
│  │ ├── /app/(admin)/ - Admin back-office                 │   │
│  │ └── /app/(auth)/ - Authentication pages               │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ TailwindCSS + TypeScript                              │   │
│  │ React Query + Zustand (State Management)              │   │
│  │ Lucide Icons + Custom Components                      │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                     BACKEND LAYER                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Next.js API Routes / Server Actions                   │   │
│  │ ├── /api/auth/* - Authentication endpoints            │   │
│  │ ├── /api/stories/* - Story CRUD                      │   │
│  │ ├── /api/riddles/* - Riddle operations               │   │
│  │ ├── /api/game/* - Game engine logic                   │   │
│  │ └── /api/ai/* - AI services integration              │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Prisma ORM + PostgreSQL                               │   │
│  │ ├── Zod (Input Validation)                            │   │
│  │ └── Auth.js (Authentication)                         │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                     AI SERVICES                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐     │
│  │ OpenAI/     │  │ Sentence    │  │ Langchain       │     │
│  │ Gemini      │  │ Transformers│  │ Orchestration   │     │
│  └─────────────┘  └─────────────┘  └─────────────────┘     │
├─────────────────────────────────────────────────────────────┤
│                     DEPLOYMENT                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐     │
│  │ Vercel      │  │ Supabase/   │  │ Vercel          │     │
│  │ (Frontend)  │  │ Neon (DB)   │  │ Analytics      │     │
│  └─────────────┘  └─────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Project Directory Structure

```
pfe-app/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── (auth)/            # Authentication routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   ├── (child)/           # Child interface
│   │   │   ├── dashboard/
│   │   │   ├── stories/
│   │   │   ├── story/
│   │   │   │   └── [id]/
│   │   │   ├── riddle/
│   │   │   │   └── [id]/
│   │   │   ├── rewards/
│   │   │   ├── profile/
│   │   │   └── layout.tsx
│   │   ├── (parent)/          # Parent dashboard
│   │   │   ├── dashboard/
│   │   │   ├── children/
│   │   │   │   └── [childId]/
│   │   │   ├── insights/
│   │   │   ├── settings/
│   │   │   └── layout.tsx
│   │   ├── (admin)/           # Admin back-office
│   │   │   ├── dashboard/
│   │   │   ├── stories/
│   │   │   │   ├── create/
│   │   │   │   └── [id]/
│   │   │   ├── riddles/
│   │   │   ├── users/
│   │   │   ├── analytics/
│   │   │   ├── settings/
│   │   │   └── layout.tsx
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   ├── stories/
│   │   │   ├── riddles/
│   │   │   ├── game/
│   │   │   ├── hints/
│   │   │   ├── analytics/
│   │   │   └── ai/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                # Base UI components
│   │   ├── child/             # Child-specific components
│   │   ├── parent/            # Parent-specific components
│   │   ├── admin/             # Admin-specific components
│   │   └── shared/            # Shared components
│   ├── lib/
│   │   ├── auth.ts            # Auth configuration
│   │   ├── db.ts              # Database client
│   │   ├── ai.ts              # AI service wrappers
│   │   ├── utils.ts           # Utility functions
│   │   └── constants.ts       # App constants
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript types
│   └── styles/                # Global styles
├── public/
│   ├── images/                # Static images
│   └── assets/                 # Other assets
├── specifications/            # Project documentation
├── .env                       # Environment variables
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Database Schema

### 3.1 Core Tables

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER MANAGEMENT
// ============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String?
  role          UserRole  @default(CHILD)
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  childProfile   ChildProfile?
  parentLink     ParentChildLink[]  @relation("ParentLinks")
  adminSessions  AdminSession[]

  @@index([email])
  @@index([role])
}

enum UserRole {
  CHILD
  PARENT
  ADMIN
}

model ChildProfile {
  id              String    @id @default(cuid())
  userId          String    @unique
  nickname        String
  ageRange        AgeRange  @default(AGE_6_7)
  readingLevel    Int       @default(1)  // 1-5 scale
  preferredMode   String?   // text, audio, both
  ttsEnabled      Boolean   @default(true)
  totalStars      Int       @default(0)
  currentStreak  Int       @default(0)
  longestStreak   Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  progress        StoryProgress[]
  attempts        RiddleAttempt[]
  hintUsages      HintUsage[]
  rewards         ChildReward[]
  sessions        GameSession[]

  @@index([userId])
}

enum AgeRange {
  AGE_6_7
  AGE_8_9
  AGE_10_11
}

model ParentChildLink {
  id              String    @id @default(cuid())
  parentId        String
  childId         String
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())

  // Relations
  parent          User      @relation(fields: [parentId], references: [id], onDelete: Cascade)
  child           User      @relation(fields: [childId], references: [id], onDelete: Cascade)

  @@unique([parentId, childId])
  @@index([parentId])
  @@index([childId])
}

// ============================================
// CONTENT MANAGEMENT
// ============================================

model Story {
  id              String    @id @default(cuid())
  title           String
  description     String
  coverImageUrl   String?
  difficulty      Difficulty @default(EASY)
  ageRange        AgeRange[]
  estimatedTime   Int       // in minutes
  status          StoryStatus @default(DRAFT)
  publishedAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  pages           StoryPage[]
  riddles         Riddle[]
  progress        StoryProgress[]

  @@index([difficulty])
  @@index([status])
  @@index([ageRange])
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

enum StoryStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model StoryPage {
  id              String    @id @default(cuid())
  storyId         String
  pageNumber      Int
  title           String?
  content         String    // Text content
  backgroundColor String?
  imageUrl        String?
  audioUrl        String?   // TTS audio
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  story           Story     @relation(fields: [storyId], references: [id], onDelete: Cascade)

  @@unique([storyId, pageNumber])
  @@index([storyId])
}

model Riddle {
  id              String    @id @default(cuid())
  storyId         String?
  question        String
  correctAnswer   String
  acceptedAnswers String[] // Variations accepted
  difficulty      Difficulty @default(MEDIUM)
  hintStrategy    String?   // JSON config for hints
  order           Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  story           Story?    @relation(fields: [storyId], references: [id], onDelete: SetNull)
  attempts        RiddleAttempt[]
  hints           Hint[]

  @@index([storyId])
  @@index([difficulty])
}

model Hint {
  id              String    @id @default(cuid())
  riddleId        String
  level           Int       // 1, 2, 3
  content         String    // Text hint
  imageUrl        String?
  audioUrl        String?
  createdAt       DateTime  @default(now())

  // Relations
  riddle          Riddle    @relation(fields: [riddleId], references: [id], onDelete: Cascade)
  usages          HintUsage[]

  @@unique([riddleId, level])
  @@index([riddleId])
}

// ============================================
// GAME & PROGRESS
// ============================================

model GameSession {
  id              String    @id @default(cuid())
  childId         String
  startTime       DateTime  @default(now())
  endTime         DateTime?
  totalTime       Int?      // in seconds
  createdAt       DateTime  @default(now())

  // Relations
  child           ChildProfile @relation(fields: [childId], references: [id], onDelete: Cascade)
  attempts        RiddleAttempt[]

  @@index([childId])
  @@index([startTime])
}

model RiddleAttempt {
  id              String    @id @default(cuid())
  sessionId       String
  riddleId        String
  childId         String
  answer          String
  isCorrect       Boolean
  timeSpent       Int       // in seconds
  attemptNumber   Int       @default(1)
  createdAt      DateTime  @default(now())

  // Relations
  session         GameSession  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  riddle          Riddle       @relation(fields: [riddleId], references: [id], onDelete: Cascade)
  child           ChildProfile @relation(fields: [childId], references: [id], onDelete: Cascade)

  @@index([sessionId])
  @@index([riddleId])
  @@index([childId])
  @@index([createdAt])
}

model HintUsage {
  id              String    @id @default(cuid())
  childId         String
  riddleId        String
  hintId          String
  levelUsed       Int
  timeBeforeRequest Int     // seconds from riddle shown to hint request
  createdAt       DateTime  @default(now())

  // Relations
  child           ChildProfile @relation(fields: [childId], references: [id], onDelete: Cascade)
  riddle          Riddle     @relation(fields: [riddleId], references: [id], onDelete: Cascade)
  hint            Hint       @relation(fields: [hintId], references: [id], onDelete: Cascade)

  @@index([childId])
  @@index([riddleId])
  @@index([createdAt])
}

model StoryProgress {
  id              String    @id @default(cuid())
  childId         String
  storyId         String
  status          ProgressStatus @default(NOT_STARTED)
  currentPage     Int       @default(0)
  riddlesSolved   Int       @default(0)
  starsEarned     Int       @default(0)
  startedAt       DateTime?
  completedAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  child           ChildProfile @relation(fields: [childId], references: [id], onDelete: Cascade)
  story           Story      @relation(fields: [storyId], references: [id], onDelete: Cascade)

  @@unique([childId, storyId])
  @@index([childId])
  @@index([storyId])
}

enum ProgressStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
}

// ============================================
// REWARDS & ACHIEVEMENTS
// ============================================

model Reward {
  id              String    @id @default(cuid())
  name            String    // e.g., "Star Collector"
  description     String
  iconUrl         String?
  type            RewardType
  requirement     String    // JSON criteria
  createdAt       DateTime  @default(now())

  // Relations
  children        ChildReward[]

  @@index([type])
}

enum RewardType {
  BADGE
  ACHIEVEMENT
  LEVEL
}

model ChildReward {
  id              String    @id @default(cuid())
  childId         String
  rewardId        String
  earnedAt        DateTime  @default(now())

  // Relations
  child           ChildProfile @relation(fields: [childId], references: [id], onDelete: Cascade)
  reward          Reward      @relation(fields: [rewardId], references: [id], onDelete: Cascade)

  @@unique([childId, rewardId])
  @@index([childId])
}

// ============================================
// ANALYTICS
// ============================================

model AnalyticsEvent {
  id              String    @id @default(cuid())
  eventType       String    // e.g., "riddle_solved", "hint_used"
  userId          String?
  sessionId       String?
  data            Json      // Event-specific data
  timestamp       DateTime  @default(now())

  @@index([eventType])
  @@index([userId])
  @@index([timestamp])
}

// ============================================
// ADMIN
// ============================================

model AdminSession {
  id              String    @id @default(cuid())
  adminId         String
  action          String    // e.g., "create_story", "delete_riddle"
  targetId        String?
  oldValue        Json?
  newValue        Json?
  ipAddress       String?
  createdAt       DateTime  @default(now())

  // Relations
  admin           User      @relation(fields: [adminId], references: [id], onDelete: Cascade)

  @@index([adminId])
  @@index([action])
  @@index([createdAt])
}
```

---

## 4. Implementation Phases

### Phase 1: Foundation (Weeks 1-4)

#### Week 1: Project Setup & Database
| Task | Description | Duration |
|------|-------------|----------|
| 1.1 | Initialize Next.js 14 project with TypeScript | 2 hours |
| 1.2 | Configure TailwindCSS with design system | 2 hours |
| 1.3 | Set up Prisma with PostgreSQL schema | 3 hours |
| 1.4 | Create base folder structure | 1 hour |
| 1.5 | Configure ESLint & Prettier | 30 min |
| 1.6 | Set up Git workflow | 30 min |
| 1.7 | Create environment configuration | 30 min |

**Deliverable:** Working project structure with database connection

#### Week 2: Authentication System
| Task | Description | Duration |
|------|-------------|----------|
| 2.1 | Configure Auth.js with multiple providers | 3 hours |
| 2.2 | Create child authentication (nickname-based) | 2 hours |
| 2.3 | Create parent/educator authentication | 2 hours |
| 2.4 | Create admin authentication | 1 hour |
| 2.5 | Implement role-based route protection | 2 hours |
| 2.6 | Create auth API endpoints | 2 hours |
| 2.7 | Build login/register UI for all roles | 4 hours |

**Deliverable:** Working authentication system with three login flows

#### Week 3: Base UI Components
| Task | Description | Duration |
|------|-------------|----------|
| 3.1 | Create design system tokens (colors, typography) | 2 hours |
| 3.2 | Build base button components | 2 hours |
| 3.3 | Build input, card, modal components | 3 hours |
| 3.4 | Build navigation components | 2 hours |
| 3.5 | Create loading & error states | 2 hours |
| 3.6 | Build form components | 2 hours |
| 3.7 | Create avatar & progress components | 2 hours |

**Deliverable:** Reusable component library

#### Week 4: Child Profile Management
| Task | Description | Duration |
|------|-------------|----------|
| 4.1 | Create child profile creation flow | 3 hours |
| 4.2 | Build avatar selection UI | 2 hours |
| 4.3 | Implement age range selection | 1 hour |
| 4.4 | Create profile editing UI | 2 hours |
| 4.5 | Build parent linking mechanism | 3 hours |
| 4.6 | Create reading preferences settings | 2 hours |
| 4.7 | Implement TTS settings | 2 hours |

**Deliverable:** Complete profile management system

---

### Phase 2: Core Game Engine (Weeks 5-7)

#### Week 5: Story Content Management
| Task | Description | Duration |
|------|-------------|----------|
| 5.1 | Create admin story creation form | 4 hours |
| 5.2 | Build story page editor | 3 hours |
| 5.3 | Implement media upload for stories | 3 hours |
| 5.4 | Create story listing & filtering UI | 2 hours |
| 5.5 | Build story preview functionality | 2 hours |
| 5.6 | Implement story status workflow | 2 hours |
| 5.7 | Create story API endpoints | 3 hours |

**Deliverable:** Admin can create and manage stories

#### Week 6: Riddle System
| Task | Description | Duration |
|------|-------------|----------|
| 6.1 | Create riddle data model in admin | 3 hours |
| 6.2 | Build riddle editor UI | 3 hours |
| 6.3 | Implement accepted answer variations | 2 hours |
| 6.4 | Create hint management for riddles | 3 hours |
| 6.5 | Build riddle API endpoints | 2 hours |
| 6.6 | Create riddle-story linking UI | 2 hours |
| 6.7 | Implement difficulty settings | 2 hours |

**Deliverable:** Complete riddle creation system

#### Week 7: Child Story Experience
| Task | Description | Duration |
|------|-------------|----------|
| 7.1 | Build story library/browse UI | 3 hours |
| 7.2 | Create story card components | 2 hours |
| 7.3 | Implement story reading view | 4 hours |
| 7.4 | Build page navigation system | 2 hours |
| 7.5 | Implement TTS integration | 3 hours |
| 7.6 | Create story progress tracking | 2 hours |
| 7.7 | Build story completion flow | 2 hours |

**Deliverable:** Children can read stories with progress tracking

---

### Phase 3: Game Mechanics (Weeks 8-10)

#### Week 8: Riddle Interaction
| Task | Description | Duration |
|------|-------------|----------|
| 8.1 | Build riddle display component | 3 hours |
| 8.2 | Create answer input interface | 2 hours |
| 8.3 | Implement multiple choice mode | 2 hours |
| 8.4 | Build basic answer validation | 2 hours |
| 8.5 | Create feedback UI (correct/incorrect) | 2 hours |
| 8.6 | Implement hint request system | 3 hours |
| 8.7 | Build attempt tracking | 2 hours |

**Deliverable:** Core riddle interaction system

#### Week 9: Game Engine Logic
| Task | Description | Duration |
|------|-------------|----------|
| 9.1 | Implement game session management | 3 hours |
| 9.2 | Create time tracking for attempts | 2 hours |
| 9.3 | Build riddle-to-story integration | 2 hours |
| 9.4 | Implement story progression logic | 3 hours |
| 9.5 | Create game state management | 2 hours |
| 9.6 | Build answer submission API | 2 hours |
| 9.7 | Implement session persistence | 2 hours |

**Deliverable:** Complete game engine with session management

#### Week 10: Rewards System
| Task | Description | Duration |
|------|-------------|----------|
| 10.1 | Create stars/points system | 2 hours |
| 10.2 | Build badge/achievement system | 3 hours |
| 10.3 | Implement progress visualization | 3 hours |
| 10.4 | Create rewards dashboard UI | 2 hours |
| 10.5 | Build unlock criteria logic | 2 hours |
| 10.6 | Implement celebration animations | 2 hours |
| 10.7 | Create rewards API endpoints | 2 hours |

**Deliverable:** Gamification system with rewards

---

### Phase 4: AI Integration (Weeks 11-13)

#### Week 11: NLP Answer Validation
| Task | Description | Duration |
|------|-------------|----------|
| 11.1 | Set up sentence embeddings service | 2 hours |
| 11.2 | Implement similarity calculation | 3 hours |
| 11.3 | Create validation API endpoint | 3 hours |
| 11.4 | Build "almost correct" detection | 2 hours |
| 11.5 | Implement partial credit system | 2 hours |
| 11.6 | Create encouragement messages | 2 hours |
| 11.7 | Test and tune similarity thresholds | 2 hours |

**Deliverable:** NLP-based answer validation

#### Week 12: AI Hint Generation
| Task | Description | Duration |
|------|-------------|----------|
| 12.1 | Set up Langchain integration | 2 hours |
| 12.2 | Create hint generation prompt templates | 2 hours |
| 12.3 | Build contextual hint API | 3 hours |
| 12.4 | Implement hint personalization | 3 hours |
| 12.5 | Create hint caching system | 2 hours |
| 12.6 | Build admin hint configuration | 2 hours |
| 12.7 | Test hint quality | 2 hours |

**Deliverable:** AI-powered adaptive hint system

#### Week 13: Adaptive Difficulty
| Task | Description | Duration |
|------|-------------|----------|
| 13.1 | Define difficulty metrics | 2 hours |
| 13.2 | Create performance tracking system | 3 hours |
| 13.3 | Implement difficulty calculation logic | 3 hours |
| 13.4 | Build adaptation API | 3 hours |
| 13.5 | Create difficulty visibility toggle | 2 hours |
| 13.6 | Implement smooth progression | 2 hours |
| 13.7 | Test and tune algorithms | 2 hours |

**Deliverable:** Dynamic difficulty adaptation

---

### Phase 5: Analytics & Dashboards (Weeks 14-16)

#### Week 14: Basic Analytics
| Task | Description | Duration |
|------|-------------|----------|
| 14.1 | Set up analytics event tracking | 2 hours |
| 14.2 | Create basic metrics API | 3 hours |
| 14.3 | Build time tracking dashboard | 2 hours |
| 14.4 | Implement success rate tracking | 2 hours |
| 14.5 | Create hint usage analytics | 2 hours |
| 14.6 | Build drop-off point tracking | 2 hours |
| 14.7 | Create admin analytics overview | 3 hours |

**Deliverable:** Basic analytics system

#### Week 15: Parent Dashboard
| Task | Description | Duration |
|------|-------------|----------|
| 15.1 | Build parent dashboard layout | 2 hours |
| 15.2 | Create child progress charts | 3 hours |
| 15.3 | Implement time spent visualization | 2 hours |
| 15.4 | Build success rate display | 2 hours |
| 15.5 | Create hint dependency analysis | 2 hours |
| 15.6 | Implement child selector | 1 hour |
| 15.7 | Build report export (PDF) | 3 hours |

**Deliverable:** Complete parent dashboard

#### Week 16: AI Insights
| Task | Description | Duration |
|------|-------------|----------|
| 16.1 | Design insight generation prompts | 2 hours |
| 16.2 | Create strength detection logic | 3 hours |
| 16.3 | Implement weakness identification | 3 hours |
| 16.4 | Build recommendation engine | 3 hours |
| 16.5 | Create natural language summaries | 2 hours |
| 16.6 | Implement insights caching | 2 hours |
| 16.7 | Build insights UI for parents | 2 hours |

**Deliverable:** AI-powered learning insights

---

## 5. Milestones & Timeline

### Gantt Chart Overview

```
Phase 1: Foundation     [======] Weeks 1-4
  Week 1: Setup        [██    ]
  Week 2: Auth        [  ██  ]
  Week 3: Components   [    ██]
  Week 4: Profiles     [    ██]

Phase 2: Game Engine   [======] Weeks 5-7
  Week 5: Stories      [██    ]
  Week 6: Riddles      [  ██  ]
  Week 7: Reading UI   [    ██]

Phase 3: Game Mechanics[======] Weeks 8-10
  Week 8: Interaction  [██    ]
  Week 9: Engine       [  ██  ]
  Week 10: Rewards     [    ██]

Phase 4: AI Integration[======] Weeks 11-13
  Week 11: NLP         [██    ]
  Week 12: Hints       [  ██  ]
  Week 13: Difficulty  [    ██]

Phase 5: Dashboards    [======] Weeks 14-16
  Week 14: Analytics   [██    ]
  Week 15: Parent     [  ██  ]
  Week 16: Insights   [    ██]
```

### Key Deliverables

| Milestone | Date | Deliverables |
|-----------|------|--------------|
| M1 | End Week 2 | Auth system, route protection |
| M2 | End Week 4 | Complete profile system |
| M3 | End Week 7 | Story reading experience |
| M4 | End Week 10 | Core game mechanics, rewards |
| M5 | End Week 13 | AI features working |
| M6 | End Week 16 | Full application complete |
| M7 | Week 17 | Testing & bug fixes |
| M8 | Week 18 | Deployment & documentation |

---

## 6. Feature Breakdown

### 6.1 Authentication Features

#### Child Login Flow
```
1. Landing page → "Start Playing"
2. Nickname input screen
3. Avatar selection (8 options)
4. Optional: Add password (parent-controlled)
5. Success → Child Dashboard
```

#### Parent Login Flow
```
1. Landing page → "Parent Login"
2. Email + Password
3. Dashboard → Link child profile
4. View child progress
```

#### Admin Login Flow
```
1. /admin/login
2. Email + Password + 2FA
3. Admin Dashboard
```

### 6.2 Story Reading Features

#### Story Card (Child View)
```
┌─────────────────────────────────┐
│  🖼️ Cover Image                │
│  Title: "The Forest Adventure" │
│  ⭐ 3/5 riddles solved          │
│  ⏱️ 10 min                     │
│  🔒 Locked / ✅ Completed       │
└─────────────────────────────────┘
```

#### Story Reading Interface
```
┌─────────────────────────────────────────┐
│  Back   Adventure Continues...   📖 🔊 │
├─────────────────────────────────────────┤
│                                         │
│     Once upon a time, in a magical      │
│     forest, there lived a little rabbit  │
│     named Pip...                        │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │         🖼️ Illustration           │  │
│  └───────────────────────────────────┘  │
│                                         │
│           ⏸️ Pause   ▶️ Play            │
│                                         │
│         [Next →] (after 3s)              │
└─────────────────────────────────────────┘
```

### 6.3 Riddle Interface

```
┌─────────────────────────────────────────┐
│  🧩 Riddle 2 of 3                        │
├─────────────────────────────────────────┤
│                                         │
│  "I have keys but no locks,             │
│   I have space but no room,             │
│   You can enter but can't go            │
│   inside. What am I?"                   │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │     🖼️ Keyboard Illustration     │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────┐     │
│  │  Type your answer here...     │     │
│  └───────────────────────────────┘     │
│                                         │
│  [Check Answer]  [💡 Get a Hint]       │
│                                         │
└─────────────────────────────────────────┘
```

### 6.4 Hint System Levels

| Level | Type | Example |
|-------|------|---------|
| 1 | Conceptual | "Think about something you use every day with buttons..." |
| 2 | Visual | 🖼️ Image of a keyboard |
| 3 | Guided | "It's what you use to type on a computer..." |

### 6.5 Parent Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  📊 Emma's Progress                    👤 Parent  ⎋    │
├─────────────────────────────────────────────────────────┤
│  📅 Last 30 days                                              │
│                                                          │
│  ⭐ Success Rate: 78%                            ████░░░  │
│  ⏱️  Time Spent: 4h 32m                         ████░░░  │
│  💡 Hint Usage: 2.3 per riddle                  ██░░░░░░  │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  🤖 AI Insights                                            │
│  ───────────────────────────────────────                  │
│  ✅ Strengths:                                             │
│     • Excellent vocabulary comprehension                  │
│     • Fast solving on memory-based riddles               │
│                                                          │
│  ⚠️ Areas to Improve:                                     │
│     • Struggles with inference-type riddles              │
│     • Sometimes rushes without reading fully             │
│                                                          │
│  💡 Recommendations:                                        │
│     • Try riddles about animals and nature next          │
│     • Encourage reading question twice before answering   │
└─────────────────────────────────────────────────────────┘
```

### 6.6 Admin Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  📊 Dashboard                    👤 Admin      ⚙️ Settings│
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Stories │ │ Riddles │ │ Learners │ │ Success │       │
│  │    12   │ │    48   │ │    24   │ │   76%   │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  📚 Stories                                [+ New Story] │
│  ─────────────────────────────────────────────────────   │
│  Title                    Status    Riddles   Updated    │
│  The Forest Adventure    ✅ Live       5      2d ago    │
│  Space Explorer          ✅ Live       4      1w ago    │
│  Ocean Mysteries         📝 Draft      3      3w ago    │
│  [View All]                                               │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  📈 Analytics                               [View More]  │
│  ─────────────────────────────────────────────────────   │
│  🔴 Most Failed Riddles:                                 │
│     1. "I have keys..." (keyboard) - 45% fail rate       │
│     2. "What has hands..." (clock) - 38% fail rate        │
│                                                          │
│  💡 AI Suggestion:                                        │
│     "Riddle 'I have keys' may be too hard for 6-7 age     │
│      group. Consider adding more contextual hints."       │
└─────────────────────────────────────────────────────────┘
```

---

## 7. API Endpoints

### 7.1 Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register/child` | Register child | Public |
| POST | `/api/auth/register/parent` | Register parent | Public |
| POST | `/api/auth/login` | Login | Public |
| POST | `/api/auth/logout` | Logout | Required |
| GET | `/api/auth/me` | Get current user | Required |
| POST | `/api/auth/link-child` | Link child to parent | Parent |
| POST | `/api/auth/unlink-child` | Unlink child | Parent |

### 7.2 Stories

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/stories` | List stories | Public |
| GET | `/api/stories/:id` | Get story details | Public |
| POST | `/api/stories` | Create story | Admin |
| PUT | `/api/stories/:id` | Update story | Admin |
| DELETE | `/api/stories/:id` | Delete story | Admin |
| GET | `/api/stories/:id/pages` | Get story pages | Public |
| POST | `/api/stories/:id/pages` | Add story page | Admin |
| PUT | `/api/stories/:id/publish` | Publish story | Admin |
| GET | `/api/stories/:id/progress` | Get user's progress | Child |

### 7.3 Riddles

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/riddles` | List riddles (admin) | Admin |
| GET | `/api/riddles/:id` | Get riddle details | Public |
| POST | `/api/riddles` | Create riddle | Admin |
| PUT | `/api/riddles/:id` | Update riddle | Admin |
| DELETE | `/api/riddles/:id` | Delete riddle | Admin |
| GET | `/api/riddles/story/:storyId` | Get riddles for story | Public |

### 7.4 Game

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/game/session/start` | Start game session | Child |
| POST | `/api/game/session/end` | End game session | Child |
| POST | `/api/game/answer` | Submit riddle answer | Child |
| GET | `/api/game/attempts/:riddleId` | Get attempt history | Child |
| GET | `/api/game/session/:sessionId` | Get session details | Child |

### 7.5 Hints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/hints/request` | Request hint for riddle | Child |
| GET | `/api/hints/:riddleId` | Get available hints | Child |
| POST | `/api/hints/generate` | AI generate hint | Child |

### 7.6 Progress & Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/progress/child/:childId` | Get child progress | Parent/Admin |
| GET | `/api/progress/story/:storyId` | Get story progress | Child |
| POST | `/api/progress/complete` | Mark story complete | Child |
| GET | `/api/analytics/overview` | Get analytics overview | Admin |
| GET | `/api/analytics/riddles` | Riddle analytics | Admin |
| GET | `/api/analytics/users` | User analytics | Admin |
| GET | `/api/insights/:childId` | AI insights for child | Parent |

### 7.7 Rewards

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/rewards` | Get all rewards | Child |
| GET | `/api/rewards/child/:childId` | Get child's rewards | Child |
| POST | `/api/rewards/earn` | Award reward | System |
| GET | `/api/rewards/progress` | Get reward progress | Child |

---

## 8. Testing Strategy

### 8.1 Testing Pyramid

```
        /\
       /  \        E2E Tests
      /____\       (Playwright)
     /      \
    /        \     Integration Tests
   /__________\    (Vitest + React Testing Library)
  /            \
 /              \   Unit Tests
/________________\ (Vitest)
```

### 8.2 Test Coverage Goals

| Type | Coverage Goal | Tools |
|------|---------------|-------|
| Unit Tests | 80% | Vitest |
| Component Tests | 70% | React Testing Library |
| Integration Tests | 60% | Vitest |
| E2E Tests | Critical paths | Playwright |

### 8.3 Testing Priorities

1. **Critical Path Tests**
   - Authentication flows (all 3 roles)
   - Story reading flow
   - Riddle answering and validation
   - Answer submission and feedback

2. **User Journey Tests**
   - Child: Login → Story → Riddle → Answer → Reward
   - Parent: Login → View Child → See Insights
   - Admin: Login → Create Story → Create Riddle → Preview

3. **Edge Case Tests**
   - Invalid answers
   - Timeout scenarios
   - Network failures
   - Session expiry

### 8.4 Test Environments

| Environment | Purpose | URL |
|-------------|---------|-----|
| Development | Local development | localhost:3000 |
| Staging | Pre-production testing | staging.readly.app |
| Production | Live users | readly.app |

---

## 9. Deployment Plan

### 9.1 Infrastructure

```
┌─────────────────────────────────────────────────────────┐
│                   Vercel Platform                        │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Frontend (Next.js)                                 ││
│  │ - Auto-scaling                                     ││
│  │ - Edge network                                     ││
│  │ - Serverless functions                             ││
│  └─────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────┐│
│  │ Database (Supabase/Neon)                            ││
│  │ - PostgreSQL 15                                     ││
│  │ - Auto-scaling connection pool                      ││
│  │ - Daily backups                                     ││
│  └─────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────┤
│                   External Services                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ OpenAI API  │  │ Auth.js     │  │ Vercel      │     │
│  │ (AI Hints)  │  │ (Auth)      │  │ Analytics   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### 9.2 Deployment Steps

#### Step 1: Pre-deployment (Week 17)
- [ ] Complete all feature implementation
- [ ] Pass all unit tests (>80% coverage)
- [ ] Complete E2E test suite
- [ ] Security audit
- [ ] Performance audit

#### Step 2: Staging Deployment
- [ ] Deploy to Vercel preview
- [ ] Configure environment variables
- [ ] Run integration tests
- [ ] Bug fixing sprint
- [ ] Stakeholder review

#### Step 3: Production Deployment
- [ ] Configure production database
- [ ] Set up monitoring (Vercel Analytics)
- [ ] Configure error tracking
- [ ] Blue/green deployment
- [ ] Smoke tests
- [ ] Go-live announcement

### 9.3 Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_URL="https://..."
NEXTAUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# AI Services
OPENAI_API_KEY="..."
HUGGINGFACE_API_KEY="..."

# App Config
NEXT_PUBLIC_APP_URL="https://..."
NEXT_PUBLIC_APP_NAME="Readly"
```

---

## 10. Risk Mitigation

### 10.1 Risk Register

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| AI API costs exceed budget | Medium | High | Implement caching, set usage limits, use cheaper models |
| NLP accuracy issues | Medium | Medium | Use proven embeddings, manual review of edge cases |
| Performance issues | Low | High | Optimize queries, implement caching, CDN |
| Security vulnerabilities | Low | High | Regular security audits, input validation, Auth.js |
| Scope creep | High | Medium | Strict sprint planning, MVP focus |
| Database scalability | Low | Medium | Proper indexing, connection pooling |
| AI content inappropriate | Medium | High | Content filters, human review for AI output |
| Child data privacy | Medium | High | GDPR compliance, minimal data collection |

### 10.2 Contingency Plans

| Scenario | Trigger | Response |
|----------|---------|----------|
| AI API down | API returns error | Fallback to static hints |
| Database unavailable | Connection fails | Show offline mode UI |
| Poor answer validation | >10% false negatives | Lower similarity threshold, manual review |
| Slow page loads | >3s load time | Optimize images, implement lazy loading |
| Security breach | Unauthorized access detected | Revoke tokens, notify users, audit logs |

---

## Appendices

### A. Design System Reference
See `specifications/x` for complete design tokens and component specifications.

### B. API Documentation
See `specifications/API.md` for detailed API documentation.

### C. Database ER Diagram
See `specifications/ERD.png` for visual database schema.

### D. UI Mockups
See `specifications/UI/` for wireframes and mockups.

---

**Document Version:** 1.0  
**Created:** 2026-02-06  
**Next Review:** 2026-02-13
