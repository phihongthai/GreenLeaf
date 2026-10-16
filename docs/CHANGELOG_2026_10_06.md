# GreenLeaf Web — Documentation of System Changes & Fixes

**Date**: October 6, 2026  
**Target Environment**: Production ([https://green-leaf-snowy.vercel.app](https://green-leaf-snowy.vercel.app))  
**Audience**: GreenLeaf English Academy — Engineering & Product Team

---

## 1. Executive Summary

This document details the complete set of changes made across the GreenLeaf Web Application, covering:
1. **Interactive World Map & UI Redesign**: Transitioning from a basic vertical list to an illustrated fantasy game map (16:9 interactive landscape with mushroom houses, animations, audio chimes, and mascot interactions).
2. **Authentication & Production Deployment Fixes**: Resolving Supabase Auth production issues (`Invalid API key`, hidden character transformations from Vietnamese input methods, and missing environment variables in local Vercel prebuilt flows).
3. **Database Schema Tolerance & Graceful Fallbacks**: Handling unmigrated Supabase columns (`is_unlocked`) that previously broke lesson content loading (`42703 column does not exist`).
4. **Progressive Unlocking System**: Allowing students who complete preceding lessons (e.g., Demo Lesson 3/3 missions) to automatically unlock and access sequential units without manual teacher intervention.
5. **Unified Navigation & Experience Consistency**: Ensuring that post-lesson celebration flows and level-selection routes (`/missions/[gradeCode]`) consistently route students back to the interactive World Map.

---

## 2. Detailed Change Log by Module

### 2.1. Illustrated World Map & Student Navigation Bar
- **Files Created / Updated**:
  - `app/components/missions/StudentWorldMap.tsx`
  - `app/components/student/StudentNavBar.tsx`
  - `app/components/student/BadgesModal.tsx`
  - `app/public/map/learning_map_clean.jpg`
- **Features Implemented**:
  - **16:9 Interactive Landscape Map**: Custom responsive stage depicting 5 mushroom house landmarks placed along a winding forest trail.
  - **Top Navigation Bar (`StudentNavBar`)**: GreenLeaf dual-leaf branding, 4 tabs (*Learning Map*, *My Progress*, *Badges*, *Library*), background music toggle, streak badge, real-time Leaf counter, and profile dropdown.
  - **Interactive Mascot (Leafy)**: Clicking Leafy triggers Web Audio harmonic chimes and contextual speech bubbles cheering student progress.
  - **Mushroom House States**:
    - **Completed**: Green check badge, glowing ring, and 3-leaf rating display on stone pedestals.
    - **Current / Active**: Vibrant pulsing orange play button inviting student click.
    - **Locked**: Semi-transparent dark overlay with golden padlock and modal dialog explaining prerequisite lessons.
  - **View Switcher**: Allows toggling seamlessly between **World Map** and **Trail View** (list).

---

### 2.2. Login Authentication & Input Protection
- **File Updated**:
  - `app/app/login/page.tsx`
- **Root Cause & Fixes**:
  - **Vietnamese IME Accent Corruption**: Typing `password123` with macOS Telex / EVKey / Unikey frequently resulted in `páswơrd123`. Added an interactive **Eye toggle icon (`Eye` / `EyeOff`)** to allow users to view plain text before signing in.
  - **1-Click Demo Login**: Added a dedicated button `✨ 1-Click Demo Login: student.demo` that auto-fills credentials and signs in immediately.
  - **Raw Error Transparency**: Replaced the generic hardcoded error (`Incorrect username/email or password`) with dynamic error messaging directly from Supabase GoTrue Auth API.

---

### 2.3. Production Supabase Environment & Vercel Deployment
- **Root Cause & Resolution**:
  - During `npx vercel build --prod` on local machines, Vercel CLI downloaded `.vercel/.env.production.local` with `NEXT_PUBLIC_SUPABASE_ANON_KEY="[SENSITIVE]"`. When Next.js compiled static chunks, it baked the literal string `"[SENSITIVE]"` into the client bundle, causing Supabase to reject client requests with `Invalid API key`.
  - **Fix**: Injected the production JWT anon key into the local build environment, rebuilt the client bundles with valid API credentials, and re-aliased the deployment to production at `https://green-leaf-snowy.vercel.app`.

---

### 2.4. Lesson Loading & Database Column Tolerance
- **File Updated**:
  - `app/app/missions/[gradeCode]/[lessonId]/page.tsx`
- **Issue**:
  - When loading `/missions/kids1/f01294c5-4d55-478a-a8df-f6951ab3aee4`, the page ran `.select('id, title, is_unlocked, order_index')`. In the production database, migration `0019_teacher_controlled_lessons.sql` had not yet been executed, resulting in Postgres error `42703 (column greenleaf_lessons.is_unlocked does not exist)` and rendering an empty page *"No content for this lesson yet."*
- **Fix**:
  - Updated the query to `.select('*')` with `.maybeSingle()`.
  - Added safe fallback extraction:
    ```typescript
    const isLessonUnlocked = (lesson as { is_unlocked?: boolean }).is_unlocked ?? (lesson.order_index === 1);
    ```

---

### 2.5. Progressive Unlocking System
- **Files Updated**:
  - `app/components/missions/StudentWorldMap.tsx`
  - `app/components/missions/LessonPathList.tsx`
  - `app/app/missions/[gradeCode]/[lessonId]/page.tsx`
- **Logic Implemented**:
  - Previously, all lessons with `order_index > 1` strictly required teacher unlocking in the database.
  - Implemented **Progressive Unlocking** across all 3 components:
    1. **Lesson 1 (Demo)** is always unlocked by default.
    2. **Sequential Lessons (Unit 1, 2, ...)** automatically unlock if:
       - Teacher explicitly unlocked it in DB, **OR**
       - The student has completed all missions of the previous lesson (`order_index - 1`).
    3. In `LessonPage` (`[lessonId]/page.tsx`), a query verifies `greenleaf_student_progress` for the previous lesson's missions before showing the locked modal.

---

### 2.6. Unified Navigation & Return Flows
- **Files Updated**:
  - `app/components/missions/RewardCelebration.tsx`
  - `app/app/missions/[gradeCode]/page.tsx`
  - `app/app/grades/page.tsx`
- **Improvements**:
  - **Celebration Screen**: Changed button from navigating to `/missions/[gradeCode]` to **`Back to Map 🗺️`** (`/grades`), ensuring students return to the illustrated World Map.
  - **Grade Route (`/missions/[gradeCode]`)**: Integrated `StudentNavBar` and `StudentWorldMap` as the default view, preventing students from landing on a raw list screen.
  - **State Freshness**: Removed static in-memory caching that previously preserved stale lesson progress after completing exercises.

---

## 3. Verification & Live Status

| Route / Feature | Status | Verification Result |
| :--- | :---: | :--- |
| `https://green-leaf-snowy.vercel.app/login` | ✅ Verified | 1-Click Demo Login works; Eye toggle shows password; authenticates with valid Supabase JWT. |
| `https://green-leaf-snowy.vercel.app/grades` | ✅ Verified | Renders full 16:9 interactive World Map, dual-leaf top navbar, Leaf counter, and Leafy mascot. |
| `https://green-leaf-snowy.vercel.app/missions/kids1/f01294c5-...` | ✅ Verified | Demo Unit (Toys) loads Words Explorer, Phonics, and Speaking Challenge without DB column errors. |
| Progressive Unlock (Unit 1: School Things) | ✅ Verified | Unlocks automatically upon completing Demo lesson; direct URL access allowed. |
| Celebration Screen | ✅ Verified | Award celebration awards Leaves and returns directly to the World Map. |

---

## 4. Key Maintenance Recommendations

1. **Database Migration (Optional Clean-up)**:
   - When convenient, execute migration `app/supabase/migrations/0019_teacher_controlled_lessons.sql` in the Supabase SQL Editor:
     ```sql
     ALTER TABLE public.greenleaf_lessons
     ADD COLUMN IF NOT EXISTS is_unlocked BOOLEAN NOT NULL DEFAULT FALSE;

     UPDATE public.greenleaf_lessons
     SET is_unlocked = TRUE
     WHERE order_index = 1;
     ```
2. **Git Commit & Cloud CI/CD**:
   - Ensure local changes are committed and pushed to GitHub (`git push origin main`) to allow Vercel Cloud Git integration to automatically build with server environment variables.
