import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { MYSTERY_BOX_COST } from '@/lib/mysteryBox';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { data: profile } = await supabase.from('greenleaf_profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'student') {
    return NextResponse.json({ error: 'Only students can request a Mystery Box' }, { status: 403 });
  }

  const db = createServiceClient();
  const { data: reward } = await db.from('greenleaf_rewards').select('leaf_count').eq('student_id', user.id).maybeSingle();
  if ((reward?.leaf_count ?? 0) < MYSTERY_BOX_COST) {
    return NextResponse.json({ error: `You need ${MYSTERY_BOX_COST} Leaves to request a Mystery Box` }, { status: 400 });
  }

  // The partial unique index (one pending per student) makes a duplicate fail here even if two
  // requests race, so no separate "already pending?" read is needed.
  const { data: created, error } = await db
    .from('greenleaf_mystery_box_requests')
    .insert({ student_id: user.id, cost: MYSTERY_BOX_COST })
    .select('id, status, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'You already have a pending Mystery Box request' }, { status: 409 });
    }
    console.error('[mystery-box] request failed:', error.message);
    return NextResponse.json({ error: 'Could not send your request' }, { status: 500 });
  }

  return NextResponse.json(created);
}
