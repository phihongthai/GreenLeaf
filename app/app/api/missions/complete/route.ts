import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { recordMissionAttempt } from '@/lib/rewards';

export async function POST(request: NextRequest) {
  const { missionId, score } = await request.json();

  if (!missionId || typeof score !== 'number') {
    return NextResponse.json({ error: 'Missing missionId or score' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const reward = await recordMissionAttempt(supabase, user.id, missionId, score);
  return NextResponse.json(reward);
}
