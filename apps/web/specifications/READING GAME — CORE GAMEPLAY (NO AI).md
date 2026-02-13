

# 🎮 READING GAME — CORE GAMEPLAY (NO AI)

This is **v1.0 without AI**.
Everything here is **rule-based**, **admin-driven**, and **predictable**.

---

Age Group
 └── story theme (multiple for each group)
    └── Story World (multiple for each theme)
      └── Story Arc (multiple for each World)
           └── Chapter (multiple for each Story)
                └── Reading Segment (pages) (multiple for each Chapter)
                     └── Riddle / Challenge (one for some pages and one at the last )

## 1️⃣ WHAT THIS GAME IS (IN ONE SENTENCE)

A **progression-based reading adventure** where children unlock stories, solve challenges, earn XP, level up, and collect badges by following a **fixed roadmap designed by admins**.

---

## 2️⃣ GAME ENTITIES

You will implement **exactly these**.

### Core Data Models (can be adjusted more)

* `AgeGroup`
* `Roadmap`
* `World`
* `Story`
* `Chapter`
* `Challenge`
* `Answer`
* `ChildProfile`
* `Progress`
* `Session`
* `XPEvent`
* `Level`
* `Milestone`
* `Badge`

No AI. No dynamic creation.

---

## 3️⃣ ADMIN GAME DESIGN FLOW (ONCE)

### Step 1: Define Age Group

Example:

```
AgeGroup: 6–7 years
```

---

### Step 2: Build Roadmap (Fixed Graph)

```
Roadmap (Age 6–7)
 ├─ World 1: Enchanted Forest (Level 1)
 │   ├─ Story 1 (mandatory)
 │   └─ Story 2 (optional)
 ├─ World 2: Ocean Quest (Level 3)
 └─ World 3: Space Buddies (Level 5)
```

Each node has:

* Required Level
* Required Milestones
* Order (linear or branching)

---

### Step 3: Create Stories

Each Story:

* Has 2–5 Chapters
* Belongs to ONE World
* Has a fixed difficulty (1–5)

---

### Step 4: Create Chapters

Each Chapter:

* Text content
* Media (image/audio optional)
* 1–3 Challenges

---

### Step 5: Create Challenges

Challenge types:

* Multiple choice
* True / False
* Short answer (exact match or keywords)
* Meaning-based riddles
* Choose-the-right-ending
* Logic puzzles
* Moral decision questions

Each Challenge has:

* Correct answer(s)
* Max attempts
* Fixed XP reward

---

### Step 6: Configure Rewards

#### Levels

```
Level 1 → 0 XP
Level 2 → 100 XP
Level 3 → 250 XP
Level 4 → 450 XP
```

#### Milestones

* Finish first Story
* Finish first World
* 5 chapters completed
* “Completed First Story World”
* “Solved 10 riddles without hints”
* “Read 20 minutes in one session”
more

#### Badges

* First Reader
* Brave Thinker
* Consistent Reader
* Explorer (progress)
* Thinker (logic)
 more
---

## 4️⃣ CHILD ONBOARDING (STRICT FLOW)

### First Login

1. Avatar selection
2. AgeGroup assignment
3. Start at:

```
Level = 1
XP = 0
World 1 unlocked
```

No tests. No adaptation.

---

## 5️⃣ MAIN GAME LOOP (THIS IS THE GAME)

This loop is **identical for every child**.

---

### 🗺️ STEP 1: Roadmap Screen

Child sees:

* Current World (active)
* Locked Worlds (with required level)
* Progress percentage per World

Action:
➡️ Tap **Continue**

---

### 📖 STEP 2: Story Screen

* Shows current Story
* Shows chapters list
* Only next chapter is playable

Action:
➡️ Tap **Start Chapter**

---

### 📚 STEP 3: Reading Screen

* Chapter text
* “Next” button enabled only after scrolling
* Optional audio

Action:
➡️ Tap **Answer Challenges**

---

### 🧩 STEP 4: Challenge Loop

For EACH challenge:

```
Attempt 1 → check answer
Attempt 2 → check answer
Attempt 3 → show simple hint (pre-written)
Attempt 4 → auto reveal
```

Hints are **written by admin**, not generated.

Wrong answers:

* Do NOT block progress
* Reduce XP bonus

---

### 🎉 STEP 5: Chapter Completion

System calculates:

```
XP gained
Stars earned (1–3)
```

Show:

* Progress bar update
* Badge progress

Action:
➡️ Next Chapter OR Exit

---

## 6️⃣ PROGRESSION SYSTEM (DETERMINISTIC)

### XP Formula

```
XP = baseXP
   + noHintBonus
   + firstTryBonus
```

Example:

* Base XP: 20
* No hint: +10
* First try correct: +5

---

### Level Up

```
If totalXP ≥ threshold → Level++
```

On Level Up:

* Unlock Worlds or Stories
* Show animation (mandatory)

---

### World Completion

World is complete when:

* All mandatory Stories completed

Reward:

* World badge
* XP bonus

---

## 7️⃣ SESSION END

When child exits:

* Save Progress
* Save Session time
* Show summary

No penalties.

---

## 8️⃣ FAILURE & REPLAY RULES

* Child can replay chapters
* Replays give:

  * 50% XP
* Progress is never lost

---

## 9️⃣ PARENT VIEW (READ-ONLY)

Parents see:

* Time spent
* Stories completed
* Badges earned

Parents cannot modify progression.

---

## 🔐 10️⃣ ADMIN CONTROL (NO AI)

Admin can:

* Edit stories
* Adjust XP values
* Lock/unlock worlds manually
* Disable problematic content

Admin cannot:

* Edit child progress retroactively (audit safety)

---

## 11️⃣ MVP CONTENT REQUIREMENT

To ship v1:

* 1 AgeGroup
* 2 Worlds
* 3 Stories
* 8–10 Chapters total
* 15–20 Challenges

That’s it.

---

## 🧠 FINAL TRUTH

This core is:

* **Simple**
* **Fun**
* **Safe**
* **Buildable**
* **Extendable**

AI can later plug into:

* Hint system
* Difficulty tuning
* Story selection

But **this game already works without it**.


