import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

const BUCKET = 'greenleaf-images';

function cachePath(query: string): string {
  const hash = createHash('sha256').update(query.toLowerCase().trim()).digest('hex');
  return `img/${hash}.jpg`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const query = (body.query as string | undefined)?.trim();
  if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 });

  const supabase = createServiceClient();
  const path = cachePath(query);

  const { data: existing } = await supabase.storage.from(BUCKET).list('img', {
    search: path.split('/')[1],
  });
  if (existing && existing.length > 0) {
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: pub.publicUrl });
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return NextResponse.json({ error: 'Missing UNSPLASH_ACCESS_KEY' }, { status: 500 });
  }

  const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=squarish&w=200`;
  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Client-ID ${accessKey}` },
  });

  if (!searchRes.ok) {
    const errText = await searchRes.text();
    console.error('Unsplash search error:', searchRes.status, errText);
    return NextResponse.json({ error: `Unsplash error: HTTP ${searchRes.status}` }, { status: 502 });
  }

  const searchData = await searchRes.json();
  if (!searchData.results || searchData.results.length === 0) {
    return NextResponse.json({ error: 'No image found', url: '' }, { status: 200 });
  }

  const photo = searchData.results[0];
  const imageUrl = `${photo.urls.thumb}&w=200&h=200&fit=crop`;

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) {
    return NextResponse.json({ error: 'Failed to download image' }, { status: 502 });
  }

  const imgBuffer = await imgRes.arrayBuffer();

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, imgBuffer, {
    contentType: 'image/jpeg',
    cacheControl: '31536000',
    upsert: true,
  });

  if (uploadError) {
    console.error('Image cache upload error:', uploadError);
    return NextResponse.json({ url: imageUrl });
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: pub.publicUrl });
}
