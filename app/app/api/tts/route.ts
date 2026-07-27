import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

const BUCKET = 'greenleaf-tts-cache';
const VOICE = 'en-US-JennyNeural';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cachePath(text: string, rate: string): string {
  const hash = createHash('sha256').update(`${text}|${rate}|${VOICE}`).digest('hex');
  return `tts/${hash}.mp3`;
}

export async function POST(req: NextRequest) {
  const { text, rate = '-10%' } = await req.json();
  if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 });

  const supabase = createServiceClient();
  const path = cachePath(text, rate);

  // Cache hit — âm thanh này đã được sinh trước đó (bởi học sinh khác hoặc lượt phát trước).
  const { data: existing } = await supabase.storage.from(BUCKET).list('tts', {
    search: path.split('/')[1],
  });
  if (existing && existing.length > 0) {
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: pub.publicUrl });
  }

  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  if (!key || !region) {
    return NextResponse.json(
      { error: `Thiếu biến môi trường: ${!key ? 'AZURE_SPEECH_KEY ' : ''}${!region ? 'AZURE_SPEECH_REGION' : ''}`.trim() },
      { status: 500 }
    );
  }

  const ssml = `<speak version='1.0' xml:lang='en-US'>
  <voice name='${VOICE}'>
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
      res.status === 401 ? 'AZURE_SPEECH_KEY sai hoặc hết hạn' :
      res.status === 404 ? 'AZURE_SPEECH_REGION sai (region không tồn tại)' :
      errText.slice(0, 200) || `HTTP ${res.status}`;
    return NextResponse.json({ error: `Azure TTS lỗi: ${reason}` }, { status: 502 });
  }

  const audio = await res.arrayBuffer();

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, audio, {
    contentType: 'audio/mpeg',
    cacheControl: '31536000',
    upsert: true,
  });
  if (uploadError) {
    console.error('TTS cache upload error:', uploadError);
    // Phát trực tiếp cho lượt này bằng data URL (không qua cache) dù upload thất bại;
    // lần sau sẽ thử cache lại từ đầu.
    const dataUrl = `data:audio/mpeg;base64,${Buffer.from(audio).toString('base64')}`;
    return NextResponse.json({ url: dataUrl });
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: pub.publicUrl });
}
