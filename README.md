# CASE ZERO — THE VISUAL MYSTERY CHALLENGE
> **“Every Detail Tells a Story. Can You Find the Truth?”**

A complete, production-ready, realistic cinematic mystery investigation platform built from scratch for college students and detective challenges.

---

## 1. PROJECT OVERVIEW

During the annual technology symposium at **Meridian Innovation Hall**, a prized emergency communication prototype called **AURORA** vanishes from its locked acrylic pedestal during a localized **74-second lighting interruption** between `20:14:12` and `20:15:26`. Four individuals have physical proximity and motives.

Participants analyze realistic cinematic CCTV surveillance, examine suspect profiles, cross-reference telemetry graphs, pin evidence on an interactive corkboard, and submit their final case file to a secure Supabase backend.

---

## 2. THE FIVE INVESTIGATION STAGES

* **Stage 1: CASE ZERO — Watch the Story**  
  Cinematic mystery video introducing the setting, the prototype on its pedestal, the 74-second blackout, and the empty display case.
* **Stage 2: Investigate the Scene & CCTV**  
  5 synchronized surveillance cameras (`CAM-01` through `CAM-05`) with 0.5x–2x speed controls, 5s rewind, 2x–4x zoom inspection lens, clickable hotspot annotations, and acoustic intercom logs.
* **Stage 3: Examine the Suspects**  
  In-depth dossiers for the 4 suspects (Mira Sen, Kabir Rao, Rhea Das, Dev Malhotra) with photorealistic portraits, clothing consistency checks against CCTV, belongings, statements, and investigator notes.
* **Stage 4: Interactive Evidence Board**  
  Forensic corkboard containing 8 visual evidence items (`EV-01` to `EV-08`), suspect-to-clue pinning matrix, interactive timestamp scrubber (`20:05` – `20:25`), and contradiction detector.
* **Stage 5: Final Submission & Case Sealing**  
  Structured final verdict form (Suspect responsible, supporting evidence selection, and written forensic explanation). Answers are evaluated server-side, permanently locked, and sealed with an official Case Confirmation Code.

---

## 3. TECH STACK

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Canvas Confetti
* **Audio Engine:** Web Audio API (Synthesized detective drone, CCTV switches, acoustic clicks, radio squelch)
* **Backend & Database:** Supabase (PostgreSQL 15+, Row Level Security, SECURITY DEFINER stored procedures)
* **Video Playback:** HTML5 Video Player with custom HUD, OpenCV video generation engine
* **Testing:** Vitest, Testing Library, JSDOM

---

## 4. DATABASE SCHEMA & SECURITY (SUPABASE)

The database schema and seed migrations are located in `supabase/migrations/`:

1. `20261030000000_case_zero_schema.sql`
   * `participants`: Participant registration with unique client token.
   * `investigation_sessions`: Session lifecycle with state locking (`in_progress` -> `submitted`).
   * `mystery_cases`: Case metadata.
   * `suspects`: 4 suspect profiles and attire records.
   * `evidence`: 8 forensic evidence items with JSONB telemetry.
   * `case_zero_submissions`: Locked participant submissions.
   * `case_solutions`: **PROTECTED SERVER-SIDE TABLE** (never exposed to public queries; holds true solution and rubric).
   * `submit_investigation()`: `SECURITY DEFINER` function that grades submissions objectively and locks the session without leaking answers.
   * Complete Row Level Security (RLS) policies on all tables.
2. `20261030000001_case_zero_seed_data.sql`
   * Populates the mystery case, 4 suspects, 8 evidence records, and the confidential grading rubric.

### Running Migrations in Supabase:
1. Open your Supabase Dashboard: [https://supabase.com/dashboard/project/rlroapuecsibkgedvqbn](https://supabase.com/dashboard/project/rlroapuecsibkgedvqbn)
2. Navigate to **SQL Editor**.
3. Paste the contents of `supabase/migrations/20261030000000_case_zero_schema.sql` and click **Run**.
4. Paste the contents of `supabase/migrations/20261030000001_case_zero_seed_data.sql` and click **Run**.

---

## 5. ORGANIZER DASHBOARD

The platform includes a protected **Organizer Command Console** accessible from the top navigation bar:
* **Authentication Gate:** Protected with organizer passkey (`meridian-zero-2026` or configured in `.env`).
* **Submissions Explorer:** Live view of all student submissions, accused suspects, scores, and explanations.
* **One-Click CSV Export:** Downloads complete submission data for offline analysis or grading.
* **Confidential Solution Inspector:** View the master case solution, timeline events, and scoring rubric.

---

## 6. LOCAL DEVELOPMENT & SETUP

### Prerequisites
* Node.js v18+ (tested on Node v22)
* npm

### Installation
```bash
# Clone the repository
git clone https://github.com/changappa974/case-zero-.git
cd case-zero-

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your Supabase URL and anon public key:
```env
VITE_SUPABASE_URL=https://rlroapuecsibkgedvqbn.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_ORGANIZER_MASTER_KEY=meridian-zero-2026
```
*(Note: If Supabase keys are not set, the application operates in a resilient offline demo mode with complete local storage persistence and server-equivalent grading).*

### Running Tests
```bash
npm test
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 7. VIDEO ASSET SPECIFICATION

Refer to [VIDEO_ASSET_PLAN.md](./VIDEO_ASSET_PLAN.md) for full camera parameters, timecodes, and Unreal Engine 5 production prompts.
All 6 surveillance feeds (`main-story.mp4`, `cam-01` to `cam-05`) are located in `public/video/`.
