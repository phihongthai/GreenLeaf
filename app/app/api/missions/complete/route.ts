import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { recordMissionAttempt } from '@/lib/rewards';
import { verifyAssessResult } from '@/lib/assessToken';
import type { WordsExplorerContent, PhonicsContent, SpeakingChallengeContent } from '@/lib/types';

interface AttemptInput {
  referenceText: string;
  score: number;
  token: string;
}

// The texts this mission actually expects, in order — attempts must line up with these 1:1 so
// a client can't reuse a valid token from a different word/mission or pad the average with
// duplicates of an easy one.
function expectedTexts(type: string, content: unknown): string[] {
  if (type === 'words_explorer') return ((content as WordsExplorerContent).words ?? []).map((w) => w.word);
  if (type === 'phonics') return ((content as PhonicsContent).lines ?? []).map((l) => l.text);
  if (type === 'speaking_challenge') return [(content as SpeakingChallengeContent).script];
  return [];
}

export async function POST(request: NextRequest) {
  const { missionId, attempts } = (await request.json()) as { missionId?: string; attempts?: AttemptInput[] };

  if (!missionId || !Array.isArray(attempts) || attempts.length === 0) {
    return NextResponse.json({ error: 'Missing missionId or attempts' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data: mission } = await supabase
    .from('greenleaf_missions')
    .select('type, content')
    .eq('id', missionId)
    .single();

  if (!mission) {
    return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
  }

  const expected = expectedTexts(mission.type, mission.content);
  if (attempts.length !== expected.length) {
    return NextResponse.json({ error: 'Attempts do not match mission content' }, { status: 400 });
  }

  for (let i = 0; i < attempts.length; i++) {
    const a = attempts[i];
    if (typeof a?.referenceText !== 'string' || typeof a?.score !== 'number') {
      return NextResponse.json({ error: 'Malformed attempt' }, { status: 400 });
    }
    if (a.referenceText !== expected[i]) {
      return NextResponse.json({ error: 'Attempts do not match mission content' }, { status: 400 });
    }
    if (!verifyAssessResult(a.referenceText, a.score, a.token)) {
      return NextResponse.json({ error: 'Invalid or tampered score' }, { status: 400 });
    }
  }

  const score = Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length);

  const reward = await recordMissionAttempt(supabase, user.id, missionId, score);
  return NextResponse.json(reward);
}
