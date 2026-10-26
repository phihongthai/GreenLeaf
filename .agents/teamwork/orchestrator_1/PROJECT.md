# Project: GreenLeaf Codebase Audit for Suburban Worker Families

## Architecture Overview
GreenLeaf is a dual-platform English learning application:
- Web Application: Next.js / React under `app/`, `src/`, `components/`, `lib/`
- Mobile Application: React Native / Expo under `mobile/`
- Deliverable: `docs/audit_suburban_worker_families_fit.md`

## Feature Inventory & Audit Targets
| # | Feature / Area | Scope | Target Milestone | Source |
|---|----------------|-------|------------------|--------|
| 1 | R1: Child Zero-Friction UX (Web) | Auth, onboarding, learning path, lesson launch on Web | M1 (Survey) | ORIGINAL_REQUEST §R1 |
| 2 | R1: Child Zero-Friction UX (Mobile) | Splash, auth, navigation, lesson launch on Mobile | M1 (Survey) | ORIGINAL_REQUEST §R1 |
| 3 | R1: Lesson Player & Auto-flow | Speaking challenge, Phonics chant, audio autoplay, speech evaluation | M1 (Survey) | ORIGINAL_REQUEST §R1 |
| 4 | R2: Low-end Hardware & Bundle Size | JS bundle, images/audio assets, rendering, memory/CPU | M1 (Survey) | ORIGINAL_REQUEST §R2 |
| 5 | R2: Network Resilience & Offline | Offline storage, caching, network drop recovery, retry logic | M1 (Survey) | ORIGINAL_REQUEST §R2 |
| 6 | R3: Parent Loop for Factory Workers | Current parent dashboard, 1-touch notification, Zalo bot / micro-updates | M1 (Survey) | ORIGINAL_REQUEST §R3 |
| 7 | R4: Action Plan & Prioritization | Gap matrix, P0/P1/P2 priorities, exact file paths and remedies | M2 (Synthesis & Report) | ORIGINAL_REQUEST §R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Survey & Deep Inspection | Parallel investigation of Web, Mobile, and Player/Offline | None | DONE |
| 2 | Report Authoring | Compile docs/audit_suburban_worker_families_fit.md | M1 | DONE |
| 3 | Review & Forensic Audit | Verification against Acceptance Criteria & Phùng Quán style | M2 | DONE |

## Gate Outcome
Gate Result: **PASS** (Reviewer 1 APPROVE, Reviewer 2 R2 APPROVE, Forensic Auditor CLEAN).
Final Deliverable: `/Users/phihongthai/tcbs/my-project/GreenLeaf/docs/audit_suburban_worker_families_fit.md`.
