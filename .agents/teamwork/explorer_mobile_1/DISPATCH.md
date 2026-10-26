# Dispatch for Explorer Mobile

## Objective
Investigate the React Native / Expo Mobile application (`mobile/`) for real-world fit with cheap Android/iOS devices and unstable 3G/4G network in industrial rental quarters.

## Read First
- `/Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/ORIGINAL_REQUEST.md`

## Focus Areas
1. **Entry & Navigation Friction**:
   - Inspect app start, splash, login, navigation hierarchy.
   - Can a child launch the app and immediately resume the current lesson with 0 or 1 tap?
   - Are touch targets >= 48px? Is there reliance on reading text instructions?
2. **Low-end Hardware & Bundle Size (R2)**:
   - Check package.json, dependencies, heavy libraries (Lottie, heavy animators, video players).
   - Check Hermes engine configuration, image decoding, rendering performance.
   - Identify memory leak risks, heavy state re-renders.
3. **Offline & Network Resilience (R2)**:
   - What happens when 3G/4G drops during a lesson?
   - Is there offline storage (AsyncStorage, SQLite, MMKV, WatermelonDB)?
   - Are assets cached locally or fetched repeatedly from remote CDN?
4. **Exact Code Evidence**:
   - Cite specific file paths, code snippets, and configuration lines.

## Output
Write full findings and handoff report to:
`/Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/explorer_mobile_1/handoff.md`
Then send a completion message to orchestrator.

## 2026-10-16T21:40:33Z
You are Explorer Mobile (explorer_mobile_1).
Working directory: /Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/explorer_mobile_1/
Read dispatch instructions at: /Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/explorer_mobile_1/DISPATCH.md
Read the authoritative user request at: /Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/ORIGINAL_REQUEST.md

Task:
Thoroughly examine the React Native / Expo Mobile codebase (mobile/) for fit with low-end Android/iOS devices and unstable 3G/4G networks in suburban industrial rental quarters.
Focus on:
1. App entry, splash, authentication, friction points, touch targets, reliance on text vs sound/visuals.
2. Low-end hardware compatibility: dependencies, bundle size, Hermes, Lottie/animations, memory/CPU footprint.
3. Offline & Network resilience: behavior when network drops, local storage caching, sync mechanism.
4. Exact code file paths and architectural issues.

Write your complete findings and handoff report to:
/Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/explorer_mobile_1/handoff.md
When finished, send a message to the orchestrator (conversation ID da0977c8-4c50-42f5-ae13-8492e62bdf27) with your report summary and handoff path.
