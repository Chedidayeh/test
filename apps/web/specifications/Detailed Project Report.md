## 1. Project Overview

**Project title**: Interactive story-based riddle game for young readers  
**Working name**: Readly (Story-Based Riddle App)  

**Project type**: Standalone web application (modern web app)  

**Core idea**  
The application helps children strengthen **reading and reasoning skills** through **story-based riddles**. Learners progress through interactive narratives where each story leads to one or more riddles. The system provides **adaptive, multimodal hints** (text, image, audio) to support comprehension and maintain engagement.  

In addition to the learner experience, the platform includes a **secure admin/content management area** for educators to create, manage, and analyze riddles and stories, and an optional **API** for integration with external EdTech platforms.

---

## 2. Objectives & Educational Value

- **Primary educational objective**:  
  Strengthen **reading comprehension** and **logical reasoning** for young readers through playful, narrative-based challenges.

- **Secondary objectives**:  
  - Improve **memory and inference skills** (via story context and riddle clues).  
  - Encourage **problem-solving persistence** with supportive hints, not punishment.  
  - Promote **confidence and motivation** through rewards and positive feedback.  
  - Provide **teachers and parents** with insights into a child’s strengths and weaknesses.

- **Why this is more than “just a game”**:  
  - Riddles are intentionally embedded in **stories**, not isolated puzzles.  
  - Hints, difficulty, and feedback are **adaptive**, based on user performance.  
  - Admin and analytics tools make it closer to an **EdTech platform** than a toy.

---

## 3. Target Users & Roles

### 3.1 Child / Learner

- Age range (to be explicitly defined in final spec, examples):  
  - 6–7 years  
  - 8–9 years  
  - 10–11 years  
- Main characteristics:  
  - Early to intermediate readers.  
  - Need simple UI, clear typography, short texts, and strong visual support.  
  - Benefit from encouragement, rewards, and non-judgmental feedback.

### 3.2 Parent / Educator

- Role: Observer and supporter, with **read-only** access to learning analytics.  
- Needs:  
  - Understand reading progress and difficulty areas.  
  - Monitor engagement and time spent.  
  - Receive **AI-powered insights** (e.g., “struggles with inference riddles”).

### 3.3 Admin / Content Manager

- Role: Creator and curator of learning content.  
- Responsibilities:  
  - Create and edit **stories** and **riddles**.  
  - Define difficulty, correct answers, acceptable variations, and hint strategies.  
  - Upload media (images, audio) and organize story flows.  
  - Review AI-suggested content (riddles, hints, difficulty) for quality and bias.

### 3.4 System / AI Services

- Role: Intelligent backend layer that:  
  - Evaluates answers (using NLP similarity).  
  - Generates context-aware hints.  
  - Adjusts difficulty over time.  
  - Produces analytics and learning insights.

---

## 4. Functional Scope

### 4.1 Learner Experience (Game Engine)

- **Story-driven riddle engine** with progressive difficulty.  
- Story presentation: text (and optionally TTS audio) with illustrations.  
- Riddle appearance at key story moments (climax or transition).  
- Multiple interaction modes for answers:  
  - Free text input.  
  - Multiple choice (for younger or lower reading levels).  
- Immediate, adaptive feedback:  
  - Correct / almost correct / incorrect classifications.  
  - Optional follow-up explanations.

### 4.2 Hint System

- Multilevel hints (at least 3 levels), e.g.:  
  1. **Conceptual hint** – subtle guidance.  
  2. **Visual hint** – image or illustration providing a clue.  
  3. **Guided explanation** – almost explicit hint but still not the full answer.
- Hints adapt based on:  
  - Story context.  
  - Child’s age and reading level.  
  - Previous mistakes and hint usage history.

### 4.3 Difficulty Adaptation

- Initial **difficulty baseline** set from profile (age + optional reading level).  
- Real-time adaptation based on:  
  - Time to solve each riddle.  
  - Number of attempts.  
  - Number and level of hints used.  
  - Overall success history.  
- Outcomes of adaptation:  
  - Increase difficulty (faster success, few hints).  
  - Maintain current level.  
  - Decrease difficulty (many mistakes, heavy hint usage).  
- Difficulty remains **hidden** from the learner; they only experience smoother progression.

### 4.4 Rewards & Motivation

- Stars, badges, progress meters.  
- Encouraging messages, including AI-generated supportive feedback.  
- Visual progression map showing completed stories and upcoming adventures.

### 4.5 Parent / Educator Dashboard

- Read-only access linked to one or more child profiles.  
- Can view:  
  - Overall reading progress.  
  - Strong vs. weak skill areas (e.g., inference vs. memory).  
  - Time spent per session, number of riddles attempted/solved.  
  - Dependence on hints (frequency and level).
- AI insights, for example:  
  - “Child struggles with inference riddles.”  
  - “Memory-based riddles are solved faster, consider more comprehension tasks.”  
- Optional recommendations:  
  - Suggested stories or riddle types to assign next.

### 4.6 Admin / Content Management

- Secure login with **role-based access control**.  
- Features:  
  - Story management: create, edit, archive stories.  
  - Riddle management: attach riddles to story points, define correct answers and variations.  
  - Hint strategy configuration per riddle (levels, types, AI involvement).  
  - Media management: upload and attach images and audio assets; preview story flow.  
  - Testing mode to experience a riddle/story as a child, including simulated difficulty adaptation.  
  - Versioning of content: track changes, revert to previous versions (recommended).  

### 4.7 Analytics & Insights

- Basic metrics:  
  - Number of riddles solved.  
  - Time spent per story and per session.  
  - Most common wrong answers.  
- Extended analytics:  
  - Engagement metrics (clicks, interactions per minute).  
  - Hint effectiveness (which hint level most often leads to success).  
  - Drop-off points where users leave a story/riddle.  
- Admin analytics dashboard:  
  - Most failed riddles.  
  - Average completion time by riddle and by story.  
  - Difficulty vs. success rate correlation.  
  - AI-driven suggestions, such as:  
    - “This riddle may be too hard for 6–7 age group.”  
    - “Hint level 1 is unclear; many users require level 3.”

### 4.8 External API (Optional)

- Allow external EdTech platforms to:  
  - Fetch lists of available stories/riddles.  
  - Initiate riddle sessions and submit answers.  
  - Retrieve basic performance data (with appropriate auth and privacy controls).  
- Must be **well-documented** and rate-limited for security and maintainability.

---

## 5. AI Features (Detailed)

### 5.1 AI-Generated Hints

- Input to AI:  
  - Riddle text.  
  - Story context snippet.  
  - User profile (age, reading level).  
  - Previous wrong answers or attempts.  
- Output from AI:  
  - Gentle, age-appropriate hint text (never the direct answer).  
  - Potential variants for different hint levels.  
- Possible extensions:  
  - AI-generated or AI-selected images as visual hints.  
  - AI-generated short audio hints (TTS or pre-rendered).

### 5.2 Adaptive Difficulty with AI

- Data collected (per learner):  
  - Time to solve each riddle.  
  - Number of attempts.  
  - Number and level of hints used.  
  - Success/failure history.  
- Approaches:  
  - Start with simple **rule-based** adaptation (threshold-based).  
  - Optionally evolve to ML-based prediction or reinforcement learning (long-term).  
- Goal:  
  - Challenge fast learners without overwhelming them.  
  - Support struggling learners with gentler ramp-up.

### 5.3 NLP-Based Answer Validation

- Problem:  
  - Traditional systems require exact answer matches, which is too strict for children.
- AI/NLP solution:  
  - Use **sentence/word embeddings** and **cosine similarity** between user input and canonical answer.  
  - Accept semantically similar answers, e.g.:  
    - "keyboard", "a keyboard", "computer keyboard", "thing with keys".  
- Simplified logic example (conceptually):  
  - `similarity(userAnswer, correctAnswer) > 0.75` → accept.  
- Bonus behavior:  
  - Detect partially correct concepts (e.g., “car” vs “train”):  
    - Provide tailored feedback like:  
      “You’re thinking of something that moves on wheels. Now think of something that moves on tracks.”

### 5.4 AI-Assisted Content Creation (Admin)

- For educators:  
  - Suggest riddle ideas based on topic, age range, and difficulty.  
  - Improve wording for clarity and age-appropriateness.  
  - Propose difficulty level based on riddle complexity.  
- Human-in-the-loop:  
  - Admin must always approve, edit, or reject AI suggestions.  
  - Checks for cultural bias, sensitive content, and appropriateness are essential.

### 5.5 AI Learning Insights

- For teachers and admins:  
  - Identify struggling readers (consistent difficulty at certain riddle types).  
  - Detect pattern types:  
    - Memory vs inference vs vocabulary issues.  
  - Provide concrete, actionable recommendations (e.g., “use more visual riddles”).

---

## 6. Application Flows

### 6.1 Child / Learner Flow

1. **Entry**  
   - Open web app.  
   - Choose:  
     - “Start Playing” (guest).  
     - Or “Login” (for saved progress).

2. **Profile Setup (first time)**  
   - Select avatar.  
   - Choose age range (e.g., 6–7 / 8–9 / 10–11).  
   - Optionally set reading level.  
   - System initializes:  
     - Difficulty baseline.  
     - Preferred hint mode (text / image / audio).

3. **Story & Riddle Loop**  
   - Story intro is displayed (text + optional TTS).  
   - Child reads or listens.  
   - At the right moment, riddle is shown.  
   - Child answers by typing or selecting an option.  
   - System evaluates: correct / almost correct / incorrect.  
   - Feedback is given (with or without hints).  
   - Child proceeds to next part of the story or next story.

4. **Hints**  
   - After a wrong attempt, child can request or automatically receive hints.  
   - Hint level escalates gradually (1 → 2 → 3).  
   - AI personalizes hints based on history and profile.

5. **Difficulty Adaptation**  
   - System continuously tracks performance stats.  
   - Difficulty is adjusted between stories/riddles.  
   - Learner is never shown “level numbers,” only experiences smoother pacing.

6. **Rewards & Progress**  
   - Stars, badges, and visual progress maps.  
   - Positive reinforcement messages to maintain motivation.

### 6.2 Parent / Educator Flow

1. Login as Parent/Educator.  
2. Link to one or more child profiles (with appropriate consent).  
3. View dashboard:  
   - Reading progress, time spent, strengths/weaknesses.  
   - Hint usage and dependency.  
4. Read AI-generated insights about learning patterns and suggestions.

### 6.3 Admin / Content Manager Flow

1. Secure authentication with role-based permissions.  
2. Use admin dashboard to:  
   - Create and edit stories.  
   - Attach riddles and configure difficulty, answers, and hints.  
   - Upload and manage media assets (images, audio).  
   - Preview and play through stories as a child.  
3. Use **Testing Mode** to:  
   - Simulate various learner profiles.  
   - Validate difficulty adaptation and AI hints.  
4. Use analytics dashboard to refine content based on performance and AI suggestions.

### 6.4 System / AI Flow

- Loop:  
  `User Action → Data Capture → AI Decision → UX Adjustment`  
  - Example:  
    - Wrong answer → Data logged → AI generates tailored hint → Difficulty slightly adjusted next time.

---

## 7. Technical Architecture

### 7.1 High-Level Architecture

- **Frontend**:  
  - Next.js (React-based) for SPA/SSR, good SEO and fast UX.  
  - React Query for data fetching and caching.  
  - TailwindCSS for modern, responsive UI.

- **Backend**:  
  - Node.js-based API layer (REST or GraphQL, plus API gateway abstraction).  
  - Game engine logic for story progression, riddle state, and difficulty.  

- **Database**:  
  - PostgreSQL for relational data (users, stories, riddles, stats).  

- **Auth & Security**:  
  - Auth.js for authentication, session management, and role-based access.  

- **AI Services**:  
  - Initially via external AI APIs (e.g., OpenAI, other providers).  
  - Later, optional migration to **local models** for cost/privacy.  

- **Deployment**:  
  - Vercel for frontend (and potentially serverless backend).  
  - Managed Postgres instance (e.g., Supabase, Railway, or similar).  

- **Version Control**:  
  - Git/GitHub for code hosting and collaboration.

### 7.2 System Diagram (Conceptual)

- Child UI → Next.js Frontend → API Gateway → Game Engine → AI Services → Database.  
- Admin/Parent UIs follow similar patterns through the frontend and API gateway.

---

## 8. Non-Functional Requirements & Quality Attributes

- **Usability & Accessibility**:  
  - Child-friendly UI with large buttons, clear fonts, and consistent navigation.  
  - Accessibility features: screen reader support, keyboard navigation, proper contrast, optional dyslexia-friendly fonts.  
  - Simple language and short sentences for younger users.

- **Performance**:  
  - Snappy interactions; use frontend caching (React Query) and backend caching where appropriate.  
  - Efficient image/audio loading, possibly via CDN.

- **Reliability & Logging**:  
  - Robust error handling around AI calls and network issues.  
  - Centralized logging for debugging and monitoring (e.g., per-request logs, AI usage logs).

- **Security**:  
  - Strong auth for admin and parent areas.  
  - Proper authorization checks on every protected route.  
  - Protection against XSS, CSRF, and injection attacks.  
  - Respect for child data privacy and relevant regulations (e.g., COPPA/GDPR-K if applicable).

- **Scalability**:  
  - Backend services and database should be able to scale with increased usage.  
  - AI calls might need rate limiting, caching, or batching to control cost.

---

## 9. Risks, Challenges, and Mitigations

- **AI cost and latency**:  
  - Mitigation: Cache hints where possible; limit calls; start with smaller usage; consider local models later.

- **Inappropriate or biased AI content**:  
  - Mitigation: Human review for AI-generated content; content filters; strict prompts; block-lists.

- **Over-complexity for first version**:  
  - Mitigation: Start with a **MVP**:  
    - Fixed set of stories and riddles.  
    - Simple hint system (partly static, partly AI).  
    - Basic analytics only.  
    - Expand feature set iteratively.

- **Data privacy (children)**:  
  - Mitigation: Minimal data collection; anonymization where possible; transparent privacy policy; parental consent flows.

---

## 10. Roadmap & Implementation Phases (Suggested)

**Phase 1 – MVP (Core Game + Basic Admin)**  
- Basic child flow (login/guest, story → riddle → feedback).  
- Hard-coded difficulty levels (no AI adaptation yet).  
- Simple, manually authored hints.  
- Minimal admin dashboard to create stories and riddles.  
- Basic analytics (riddles solved, time spent).

**Phase 2 – AI & Adaptivity**  
- Integrate AI-generated hints.  
- Add NLP-based answer validation.  
- Introduce rule-based difficulty adaptation.  
- Expand analytics with hint usage and drop-off analysis.

**Phase 3 – Advanced Analytics & Parent Dashboard**  
- Parent/educator dashboards with AI learning insights.  
- More granular analytics for admins and teachers.  
- A/B testing for riddle variants and hints.

**Phase 4 – API & Scaling**  
- Public/partner API for external EdTech integration.  
- Optimization of AI usage, possible experimentation with local models.  
- Performance, scalability, and cost tuning.

---

## 11. Key Message for Jury / Recruiters

- Recommended framing sentence:  
  > “AI is not used to replace learning, but to **adapt the experience to each child**, making reading more engaging, fair, and effective.”  

- Emphasize that the project combines:  
  - **Strong educational foundations** (reading, reasoning, comprehension).  
  - **Thoughtful interaction design** for children.  
  - **Modern web technologies** and scalable architecture.  
  - **Ethical, supportive AI** that personalizes learning without replacing teachers.

This report consolidates the ideas in `Project Analysis` into a structured, detailed specification you can show to supervisors, juries, or recruiters, or use as the foundation for your functional and technical documentation.

