# BRIEFING — 2026-10-16T22:00:00Z

## Mission
Independently review `/Users/phihongthai/tcbs/my-project/GreenLeaf/docs/audit_suburban_worker_families_fit.md` as Reviewer 2 & Critic, focusing on Suburban Worker Reality & Style Compliance (Phùng Quán style, Anti-AI rules, zero fluff, truth-first, adversarial edge-case stress testing).

## 🔒 My Identity
- Archetype: reviewer_critic
- Roles: reviewer, critic
- Working directory: /Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/reviewer_audit_2
- Original parent: da0977c8-4c50-42f5-ae13-8492e62bdf27
- Milestone: Suburban Worker Audit Review
- Instance: 2 of 2

## 🔒 Key Constraints
- Review-only — do NOT modify implementation code
- Strictly enforce Phùng Quán style and Anti-AI writing rules (no fluff, no guru jargon, no "không phải X mà là Y", no exclamation mark overuse, punchy periods)
- Adversarial review: actively search for integrity violations, facades, fake claims, edge-case failure modes
- Deliver verdict: APPROVE or REQUEST_CHANGES with actionable evidence in handoff.md

## Current Parent
- Conversation ID: da0977c8-4c50-42f5-ae13-8492e62bdf27
- Updated: 2026-10-16T22:00:00Z

## Review Scope
- **Files to review**:
  - `/Users/phihongthai/tcbs/my-project/GreenLeaf/docs/audit_suburban_worker_families_fit.md`
  - `/Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/ORIGINAL_REQUEST.md`
- **Code verification targets**:
  - `mobile/src/lib/assess.ts:104-114` (simulated score unmasked)
  - `mobile/src/screens/StudentHomeScreen.tsx:162, 175, 203` (lesson locking & logout)
  - `app/components/Recorder.tsx:52, 59-66` (AudioContext memory leak & rAF volume)
  - `app/lib/audio.ts:8` (audioToWav unclosed context)
  - `app/components/missions/WordsExplorer.tsx:92-95, 48` (422 deadlock skip bug)
  - `app/components/missions/StudentWorldMap.tsx:130-132` (overflow-hidden min-w-[760px])
  - `mobile/src/screens/LessonPlayerScreen.tsx:321-419` (0 Image tags in lesson player)
  - Asset sizes (`hero_wave.webp` 1.0MB) & 404 seed images
- **Review criteria**:
  - Suburban worker family reality fit (12h shifts, 15m² rooms, cheap phones, 3G dropouts, young kids 4-10)
  - Style compliance (prohibited patterns, tone, sentence rhythm, punchiness)
  - Integrity & soundness (no fabricated verifications, real technical recommendations)

## Review Checklist
- **Items reviewed**: `docs/audit_suburban_worker_families_fit.md`, verified against 11 codebase targets.
- **Verdict**: REQUEST_CHANGES (due to 2 negative parallelism violations and 5 unmitigated adversarial operational failure modes).
- **Unverified claims**: None. All code citations and line numbers directly confirmed via inspection.

## Attack Surface
- **Hypotheses tested**:
  1. Negative parallelism / AI clichés check: Found lines 135 & 316 violating "CẤM: 'không phải X, mà là Y'" rule; line 305 violating "Thay vì X, Y" reframe ban.
  2. Zalo Bot feasibility: ZNS message unit costs, OA consent policy, and audio file URL access security.
  3. VAD in 15m² rental rooms: Heavy background noise (tin roof rain, fan) prevents energy silence detection; stuttering kids cut off early.
  4. Lowering Azure Speech threshold to 65%: Noise matching false positives on single words.
  5. Photo homework & Offline queue: Teacher grading bottleneck, Supabase storage explosion, and reconnect flash flooding.
- **Vulnerabilities found**: Style rule violation on lines 135, 305, 316; operational gaps in Action Plan for Zalo, VAD, scoring threshold, and photo submission.
- **Untested angles**: Native Android Java audio buffer behavior on specific MediaTek chipsets (accepted as low priority).

## Key Decisions Made
- Issued REQUEST_CHANGES with drop-in sentence replacements and actionable mitigations for edge cases.

## Artifact Index
- `.agents/teamwork/reviewer_audit_2/handoff.md` — Final review handoff report
- `.agents/teamwork/reviewer_audit_2/progress.md` — Liveness heartbeat
- `.agents/teamwork/reviewer_audit_2/DISPATCH.md` — Log of incoming dispatches
