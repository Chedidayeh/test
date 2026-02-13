# SPECIFICATIONS DOCUMENT
## Interactive Riddle Game Application Based on Stories for Young Readers

**Project Duration:** 4 months

---

## TABLE OF CONTENTS

1. General Project Presentation
2. Existing Solutions Analysis
3. Expression of Needs
4. User Identification
5. Principal Use Cases
6. Detailed Functional Requirements
7. System Modeling
8. Technical Specifications
9. Project Planning
10. Acceptance Criteria and Validation
11. Limitations and Perspectives
12. General Conclusion

---

## GENERAL INTRODUCTION

The proposed application is an interactive web platform that enables children to strengthen their **reading** and **reasoning** skills through **illustrated stories containing riddles**. The system adapts support mechanisms (textual, visual, and optionally audio hints) based on the child's profile and performance. An administration interface allows teachers and educational managers to create, manage, and analyze stories and riddles.

This specifications document describes in detail the context, functional and non-functional requirements, constraints, target architecture, and acceptance criteria for the project.

---

## 1. GENERAL PROJECT PRESENTATION

### 1.1 Context and Justification

- Many children struggle to sustainably develop their reading comprehension and understanding skills, particularly when faced with unengaging content.
- Teachers lack simple tools to **adapt difficulty levels** and **analyze individual student difficulties**.

In this context, the project aims to propose a modern digital solution, combining **interactive narratives**, **riddle-based challenges**, and **artificial intelligence**, to provide a personalized and motivating learning experience.

### 1.2 Project Objectives

- Strengthen **reading, comprehension, and logical reasoning** skills in children.
- Provide an engaging environment based on **scripted stories** and **progressive challenges**.
- Provide **adaptive hints** to reduce frustration and support perseverance.
- Allow **teachers/parents** to track children's progress (time spent, success rates, types of errors, hint dependency).
- Provide a **secure back-office** for creating, managing, and analyzing content.

### 1.3 Project Scope

The scope covers:
- A web application (front-end) accessible from a modern browser.
- A back-end managing stories, riddles, profiles, game sessions, and statistics.
- An **AI module** for: hint generation, difficulty adaptation, and flexible response validation.
- An **administration dashboard** (content creation/editing, statistics consultation).
- A **consultation dashboard** for parents/teachers (reading indicators, without content modification).

---

## 2. EXISTING SOLUTIONS ANALYSIS

### 2.1 Similar Solutions

- Generic online riddle games (websites or mobile applications).
- Simple reading applications offering standard stories.
- EdTech platforms integrating quizzes or multiple-choice questions for evaluation.

### 2.2 Limitations of Existing Solutions

- Few solutions combine **rich narration + riddles + intelligent adaptation** to the child.
- Hints are often static, not personalized based on errors made.
- Response validation is generally **exact** (strict text matching), poorly adapted to children's natural language.
- Pedagogical dashboards are sometimes limited or too complex for teachers to use.

### 2.3 Added Value of the Proposed Solution

- Riddle engine **integrated within a story**, reinforcing text comprehension.
- **Difficulty adaptation** based on performance (time, errors, hint usage).
- **AI** for: contextual hints, flexible response validation (NLP), recurring difficulty analysis.
- Complete administrator dashboard (creation, testing, monitoring, improvement suggestions).
- Experience designed specifically for young readers (6–11 years) with simple and accessible interface.

---

## 3. EXPRESSION OF NEEDS

### 3.1 Functional Requirements

#### 3.1.1 Child/Learner Side

- Create a simple profile (avatar, age group, optional reading level).
- Browse a story library or follow a suggested learning path.
- Read/listen to a story and answer riddles throughout the narrative.
- Receive progressive hints when facing difficulty.
- Get clear feedback: correct answer, almost correct, incorrect.
- Earn stars/badges and visualize progress.

#### 3.1.2 Parent/Teacher Side

- Create an account and link one or multiple children's profiles.
- Check time spent, number of riddles solved, frequent error types.
- Access **AI insights** (e.g., "difficulty with inference riddles").
- Export progress reports.

#### 3.1.3 Administrator/Content Manager Side

- Manage stories (create, modify, archive).
- Manage associated riddles: statement, accepted responses, difficulty level.
- Define hint strategy (levels, textual/visual/audio types).
- Manage media (images, sounds) and preview narrative flow.
- Test stories as a child (test mode) and simulate different profiles.
- Consult dashboards (most frequently failed riddles, average time, disengagement points).

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance

The system must guarantee a response time under 2 seconds for main interactions.

The system must support multiple simultaneous users.

The system must ensure rapid hint generation.

#### 3.2.2 Security

The system must guarantee the confidentiality of children's data.

The system must implement a secure authentication mechanism.

The system must protect data against unauthorized access.

#### 3.2.3 Ergonomics and Accessibility

The system must provide a simple and intuitive interface.

The system must be adapted for children (readability, colors, navigation).

The system must be accessible on different devices (PC, tablet).

#### 3.2.4 Reliability and Availability

The system must ensure regular data backup.

The system must guarantee data consistency.

#### 3.2.5 Scalability

The system must be able to evolve to accommodate growing user numbers.

The system must allow future functionality additions.

#### 3.2.6 Maintainability

The system must be modular and well-structured.

Code must be documented and versioned.

The system must allow easy and evolving maintenance.

---

## 4. USER IDENTIFICATION

### 4.1 User Types

- **Child / Learner** (6–11 years old)
- **Parent / Teacher** (observer profile)
- **Administrator / Content Manager**

### 4.2 Roles and Responsibilities

- **Child**: plays, reads, answers riddles, uses hints, progresses through stories.
- **Parent / Teacher**: consults progress reports, interprets indicators, adjusts pedagogical application usage.
- **Administrator**: creates/edits stories and riddles, validates AI proposals, monitors global statistics, manages media.

### 4.3 Access Rights

- **Child**: access to game interface only (no access to system parameters or other users' data).
- **Parent / Teacher**: read access to reports and associated children's profiles, no modification rights on narrative content.
- **Administrator**: complete back-office access (content creation, modification, deletion, advanced statistics consultation).

---

## 5. PRINCIPAL USE CASES

### USE CASE 5.1: Child Plays a Story

**Actor:** Child / Learner

**Preconditions:** Child authenticated, profile created

**Main Flow:**
1. Child selects a story from the library
2. Story loads with illustrations and text
3. At each key point, a riddle appears
4. Child submits an answer (text or choice)
5. System validates response and provides feedback
6. If error, child can request a hint
7. Story progresses until the end
8. Progress and rewards are recorded

**Postconditions:** Session ended, statistics updated

### USE CASE 5.2: Parent Checks Child's Progress

**Actor:** Parent / Teacher

**Preconditions:** Parent authenticated, child linked to account

**Main Flow:**
1. Parent accesses the dashboard
2. Selects the child in question
3. Consults statistics (time, success, error types)
4. Reads AI insights on difficulty areas
5. Exports a report if necessary

**Postconditions:** Report generated and consulted

### USE CASE 5.3: Administrator Creates a New Story

**Actor:** Administrator

**Preconditions:** Administrator authenticated

**Main Flow:**
1. Administrator accesses back-office
2. Creates new story (title, description, level)
3. Writes narrative content
4. Adds illustrations and multimedia content
5. Creates associated riddles (statement, accepted responses, difficulty)
6. Defines progressive hints for each riddle
7. Tests story in learner mode (profile simulation)
8. Validates and publishes story

**Postconditions:** Story available for children

---

## 6. DETAILED FUNCTIONAL REQUIREMENTS

### 6.1 User Management

The system must allow user registration and authentication according to their role.

The system must manage multiple user types:
- Learner (child)
- Parent / educator
- Administrator

The system must allow profile management (age, level, preferences).

The system must ensure secure session management.

### 6.2 Learner – Educational Game Interaction

The system must offer interactive stories adapted to the learner's age.

The system must display riddles integrated into the scenario.

The system must allow the learner to submit an answer (text or choice).

The system must evaluate learner-provided responses.

The system must provide immediate feedback (correct, partially correct, incorrect).

The system must offer rewards (points, badges, progression).

### 6.3 Hints Management

The system must provide progressive hints in case of failure.

The system must offer different hint types:
- Text
- Image
- Audio (optional)

The system must adapt hints according to learner performance.

The system must avoid directly revealing the answer.

### 6.4 Intelligent Level Adaptation

The system must analyze learner performance:
- Response time
- Number of attempts
- Hint usage

The system must automatically adjust difficulty level.

The system must guarantee smooth and motivating progression.

### 6.5 Intelligent Response Validation (NLP)

The system must accept equivalent or close responses to the correct answer.

The system must detect partially correct responses.

The system must provide personalized encouragement.

### 6.6 Parent / Educator Dashboard

The system must allow learner progress consultation.

The system must display performance statistics.

The system must provide automatically generated observations (AI insights).

The system must allow PDF report export.

### 6.7 Content Administration

The system must allow administrators to create, modify, and delete:
- Stories
- Riddles
- Hints

The system must allow multimedia content addition.

The system must offer content testing mode.

The system must provide global usage statistics.

---

## 7. SYSTEM MODELING

### 7.1 Global Architecture

The system architecture is organized according to a distributed layered structure, designed to guarantee scalability, performance, and maintainability:

**Presentation Layer (Front-end)**

The front-end application is built with Next.js 14+, TailwindCSS, and TypeScript. It provides three distinct interfaces:
- Child/learner interface: dedicated to interactive games, with stories, riddles, and hint management
- Parent/teacher interface: dashboard for progress consultation and performance statistics
- Administrator interface: back-office for story, riddle, and multimedia content creation/management

**Communication Layer**

Communication between front-end and back-end occurs via:
- REST API (Node.js): for synchronous requests (authentication, content loading, response submission)
- WebSocket: for real-time updates (notifications, progress updates, multi-tab synchronization)

**Business Logic and Services Layer**

The Node.js back-end integrates:
- Game engine: story management, riddle progression, session states
- Authentication service: user management by role (Auth.js)
- AI Services: three specialized modules (hint generation, NLP validation, difficulty adaptation)
- Data access layer: via Prisma ORM

**Persistence Layer**

Data is stored and managed by:
- PostgreSQL (relational database): users, child profiles, stories, riddles, hints, sessions, attempt logs, and analytics

This modular and decoupled architecture enables progressive system evolution, addition of new functionalities without impact on existing modules, and future replacement of AI providers.

### 7.2 Principal Components

1. **Front-end (Next.js)**: Responsive user interface for children, parents, and administrators
2. **REST API (Node.js)**: Endpoints for authentication, game, statistics, admin
3. **Game Engine**: Story management, riddle flow, riddle states, progression
4. **AI Services**: Hint generation, NLP validation, difficulty adaptation
5. **Database (PostgreSQL)**: Users, profiles, stories, riddles, statistics

---

## 8. TECHNICAL SPECIFICATIONS

### 8.1 Technology Choices

**Front-end:**
- Framework: Next.js 14+
- Styling: TailwindCSS
- Language: TypeScript
- State: React Query / Zustand
- Internationalization: i18n for multilingual support

**Back-end:**
- Runtime: Node.js 18+ LTS
- Framework: Next.js API Routes
- Language: TypeScript
- Authentication: Auth.js (NextAuth.js)
- Validation: Zod

**Database:**
- RDBMS: PostgreSQL
- ORM: Prisma

**Artificial Intelligence:**
- Langchain for AI agent orchestration and prompt management
  - Processing Chains: coordination of multiple AI calls
  - Reactive Agents: autonomous decision-making based on performance
  - Memory management: historical context management (session, child profile)
- Provider options:
  - **OpenAI/Gemini** for contextual hint generation
  - **HuggingFace** for open-source NLP and embeddings
  - **Sentence Transformers** for local embeddings

**Authentication:**
- Auth.js with OAuth Google for parents
- Simple authentication (email/password) for children
- Secure session (JWT)

**Deployment:**
- Hosting: Vercel (front-end + serverless API)
- Database: Supabase or Neon (managed PostgreSQL)
- Monitoring: Vercel Analytics

### 8.2 Software Architecture

Clear layer separation:
- **Presentation**: React components, Next.js pages
- **Business Logic**: Game engine, adaptation rules
- **Data Access**: Prisma ORM, queries
- **AI Integration**: Service wrapper, API clients

Use of dedicated services or modules for AI to enable future provider or model changes.

### 8.3 Development Environment

- Source code management via Git/GitHub
- Recent Node.js environment (LTS)
- npm for dependency management
- ESLint + Prettier for code formatting

### 8.4 Version Management

- Git branches: main, develop, feature/*, release/*
- Semantic Versioning for releases

### 8.5 Deployment

- Continuous deployment on Vercel
- Staging environment for pre-production testing

---

## 9. PROJECT PLANNING

### 9.1 Adopted Methodology

The project adopts an **iterative and incremental methodology**, inspired by **Agile** approaches, to enable progressive system evolution and continuous functionality validation.

Development is organized in **short cycles (sprints)**, each cycle resulting in a partial functional version of the system. This approach allows:
- Better risk management
- Progressive integration of complex features (notably AI)
- Continuous adaptation based on project feedback and constraints

### 9.2 Tentative Planning (total duration: 4 months)

#### **Month 1 (2 weeks): Analysis and Design**

- Context and need study
- Requirements document writing and validation
- User and use case analysis
- Global architecture design
- UML modeling (main diagrams)
- Database design (ERD/logical model)
- Initial mockups

**Deliverable:** Validated specifications, mockups, documented architecture

#### **Months 1–2 (5 weeks): Core Application Development (MVP)**

- Development environment setup
- Initial UI implementation (React components)
- Authentication and role implementation (Auth.js)
- Basic game engine development
- Learner flow implementation (reading, riddles, simple responses)
- Minimal back-office creation (story and riddle management)
- MVP functional testing

**Deliverable:** Functional MVP version (child + basic admin)

#### **Months 2–3 (5 weeks): Intelligent Features Integration**

- User performance data collection and structuring
- Intelligent hint integration (AI)
- Response validation implementation via NLP
- Automatic level adaptation setup
- Basic analytics module development
- User experience optimization
- Functional and technical testing

**Deliverable:** AI-enriched version, basic parent dashboard

#### **Month 4 (4 weeks): Finalization, Testing, and Deployment**

- Complete parent/teacher dashboard development
- Administrator dashboard improvement
- Global testing (functional, performance, security, accessibility)
- Bug fixes and optimization
- Vercel deployment (demonstration environment)
- Technical documentation writing
- Final demonstration and report preparation

**Deliverable:** Stable final version deployed

### 9.3 Project Milestones

- **M1**: Specifications validation
- **M2**: Architecture and design models validation
- **M3**: Functional prototype delivery (simple learner flow)
- **M4**: MVP version delivery with back-office
- **M5**: First AI feature integration
- **M6**: Final version delivery candidate for presentation

### 9.4 Expected Deliverables

- Validated specifications
- Design diagrams (UML, architecture)
- Documented and versioned source code (GitHub)
- Functional and deployed web application
- Technical documentation (API, database, AI, deployment)
- Test data set (sample stories and riddles)
- Project final report
- Demo video and presentation slides

---

## 10. ACCEPTANCE CRITERIA AND VALIDATION

### 10.1 Functional Criteria

- A child can play at least one complete story with multiple riddles
- System provides progressive hints in case of error
- Close responses are recognized as "almost correct" with adapted feedback
- An administrator can create/modify a story and associate riddles
- A parent/teacher can consult a child's statistics
- System adapts difficulty over time

### 10.2 Technical Criteria

- Application is deployed and accessible via a modern browser
- Main flows are usable with response times < 2 seconds
- Roles and permissions are correctly applied (child/parent/admin)
- Data is correctly persisted in database
- AI calls respect budget and SLAs

---

## 11. LIMITATIONS AND PERSPECTIVES

### 11.1 Current Limitations

- Initial dependency on external AI services (cost, latency, availability)
- No native mobile application

### 11.2 Future Evolutions

- Enrichment of story catalog and riddle types (visual, audio, multimodal)
- Integration of local or hybrid AI models to reduce costs
- Advanced gamification (challenge systems, competitions)

---

## 12. GENERAL CONCLUSION

This specifications document describes a complete and modern EdTech solution that combines **interactive stories**, **riddle-based challenges**, and **artificial intelligence** to provide personalized learning experience to young readers. The project stands out through:

- **Child-centered approach**: intuitive interface, encouraging feedback, intelligent adaptation
- **Complete educator back-office**: content creation, advanced analytics, AI insights
- **Evolution potential**: modular architecture, AI service wrapper for future flexibility
- **Pragmatic methodology**: iterative approach, rapid MVP, progressive AI integration

Progressive implementation (MVP → enrichments) enables risk mitigation while guaranteeing solid demonstration for jury, investors, or educational partners.

The project is ambitious but realistic over a **4-month** period with dedicated team, and provides solid foundation for future commercialization or academic publication.

---
