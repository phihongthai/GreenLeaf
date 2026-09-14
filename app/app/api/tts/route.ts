import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

const BUCKET = 'greenleaf-tts-cache';
const DEFAULT_VOICE = 'en-US-JennyNeural';

// Voice/rate are interpolated directly into SSML (XML attributes) — validate strictly to
// prevent injection via request body instead of only escaping the text content.
const VOICE_RE = /^[a-zA-Z0-9-]{1,50}$/;
const RATE_RE = /^-?\d{1,3}%$/;

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cachePath(text: string, rate: string, voice: string): string {
  const hash = createHash('sha256').update(`${text}|${rate}|${voice}`).digest('hex');
  return `tts/${hash}.mp3`;
}

export async function POST(req: NextRequest) {
  // No middleware coverage for /api/* — without this check, anyone could hit this route
  // directly and burn the paid Azure TTS quota (and fill the cache bucket) with arbitrary text.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await req.json();
  const text = body.text as string | undefined;
  const rate = typeof body.rate === 'string' && RATE_RE.test(body.rate) ? body.rate : '-10%';
  const voice = typeof body.voice === 'string' && VOICE_RE.test(body.voice) ? body.voice : DEFAULT_VOICE;
  if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 });

  const serviceClient = createServiceClient();
  const path = cachePath(text, rate, voice);

  // Cache hit — this audio was generated previously (by another student or a prior playback).
  const { data: existing } = await serviceClient.storage.from(BUCKET).list('tts', {
    search: path.split('/')[1],
  });
  if (existing && existing.length > 0) {
    const { data: pub } = serviceClient.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: pub.publicUrl });
  }

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) {
    return NextResponse.json(
      { error: `Missing env var: ${!key ? 'AZURE_SPEECH_KEY ' : ''}${!region ? 'AZURE_SPEECH_REGION' : ''}`.trim() },
      { status: 500 }
    );
  }

  const ssml = `<speak version='1.0' xml:lang='en-US'>
  <voice name='${voice}'>
    <prosody rate='${rate}'>${escapeXml(text)}</prosody>
  </voice>
</speak>`;

  const res = await fetch(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
      },
      body: ssml,
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error('Azure TTS error:', res.status, errText);
    const reason =
      res.status === 401 ? 'AZURE_SPEECH_KEY is invalid or expired' :
      res.status === 404 ? 'AZURE_SPEECH_REGION is incorrect (region does not exist)' :
      errText.slice(0, 200) || `HTTP ${res.status}`;
    return NextResponse.json({ error: `Azure TTS error: ${reason}` }, { status: 502 });
  }

  const audio = await res.arrayBuffer();

  const { error: uploadError } = await serviceClient.storage.from(BUCKET).upload(path, audio, {
    contentType: 'audio/mpeg',
    cacheControl: '31536000',
    upsert: true,
  });
  if (uploadError) {
    console.error('TTS cache upload error:', uploadError);
    // Serve this request directly via data URL (bypassing cache) even though upload failed;
    // next request will retry caching from scratch.
    const dataUrl = `data:audio/mpeg;base64,${Buffer.from(audio).toString('base64')}`;
    return NextResponse.json({ url: dataUrl });
  }

  const { data: pub } = serviceClient.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: pub.publicUrl });
}
