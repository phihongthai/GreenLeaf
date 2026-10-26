# Dispatch for Explorer Player & Media

## Objective
Investigate the core learning activities: Lesson Player, Speaking Challenge, Phonics Chant, Quiz, Audio Recording, Speech Evaluation, and Media Assets across Web & Mobile.

## Read First
- `/Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/ORIGINAL_REQUEST.md`

## Focus Areas
1. **Interactive Flow & Zero-Friction**:
   - Does the lesson player auto-play sounds and guide with visuals/voice?
   - How are instructions presented? Text vs animated demonstration?
   - Can a 5-year-old child proceed without knowing how to read?
2. **Speaking Challenge & Speech Scoring**:
   - How does voice recording and speech recognition work?
   - Is it client-side (Web Speech API) or server-side (OpenAI Whisper / custom STT / remote backend)?
   - How does it handle young children's pronunciation, background noise (crying baby, TV, factory traffic in rental rooms)?
   - Does it block or frustrate the child when speech recognition fails or network lags?
3. **Media & Resource Footprint**:
   - Audio formats, sample rates, caching strategies.
   - Battery/CPU/RAM consumption during continuous audio/visual interactive playback.
4. **Exact Code Evidence**:
   - Cite specific file paths, hook implementations, and scoring logic.

## Output
Write full findings and handoff report to:
`/Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/explorer_player_1/handoff.md`
Then send a completion message to orchestrator.

## 2026-10-16T21:40:33Z
You are Explorer Player & Media (explorer_player_1).
Working directory: /Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/explorer_player_1/
Read dispatch instructions at: /Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/explorer_player_1/DISPATCH.md
Read the authoritative user request at: /Users/phihongthai/tcbs/my-project/GreenLeaf/.agents/teamwork/ORIGINAL_REQUEST.md

Task:
Thoroughly examine the core learning components (Lesson Player, Speaking Challenge, Phonics Chant, Quiz, Audio Recording, Speech Evaluation, Media Assets) across Web and Mobile.
Focus on:
1. Interactive flow & auto-play: Does it guide without requiring reading? Zero-friction progression?
2. Speaking Challenge & Speech Evaluation: Client vs server-side STT, tolerance for background noise (noisy rental quarters) and child pronunciation, failure fallback.
3. Media assets & resource footprint: streaming vs caching, download size per lesson, battery/RAM strain.
4. Exact code file paths and logic analysis.
