/**
 * One-time script to populate imageUrl for all words_explorer words.
 *
 * Usage:
 *   npx tsx scripts/populate-images.ts
 *
 * Requires env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, UNSPLASH_ACCESS_KEY
 *
 * Unsplash free tier: 50 requests/hour. The script sleeps between requests
 * to stay well within limits. Run multiple times if you hit the cap — it
 * skips words that already have an imageUrl.
 */

import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY!;
const BUCKET = 'greenleaf-images';

if (!SUPABASE_URL || !SUPABASE_KEY || !UNSPLASH_KEY) {
  console.error('Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, UNSPLASH_ACCESS_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function cachePath(query: string): string {
  const hash = createHash('sha256').update(query.toLowerCase().trim()).digest('hex');
  return `img/${hash}.jpg`;
}

async function fetchAndCacheImage(query: string): Promise<string> {
  const path = cachePath(query);

  const { data: existing } = await supabase.storage.from(BUCKET).list('img', {
    search: path.split('/')[1],
  });
  if (existing && existing.length > 0) {
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    console.log(`  [cache hit] ${query}`);
    return pub.publicUrl;
  }

  const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=squarish`;
  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
  });

  if (searchRes.status === 403) {
    console.error('  [rate limit] Unsplash rate limit hit. Run again later.');
    process.exit(0);
  }

  if (!searchRes.ok) {
    console.error(`  [error] Unsplash ${searchRes.status} for "${query}"`);
    return '';
  }

  const data = await searchRes.json();
  if (!data.results || data.results.length === 0) {
    console.log(`  [no result] ${query}`);
    return '';
  }

  const thumbUrl = `${data.results[0].urls.thumb}&w=200&h=200&fit=crop`;
  const imgRes = await fetch(thumbUrl);
  if (!imgRes.ok) {
    console.error(`  [download error] ${query}`);
    return '';
  }

  const imgBuffer = await imgRes.arrayBuffer();
  const { error } = await supabase.storage.from(BUCKET).upload(path, imgBuffer, {
    contentType: 'image/jpeg',
    cacheControl: '31536000',
    upsert: true,
  });

  if (error) {
    console.error(`  [upload error] ${query}:`, error.message);
    return '';
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  console.log(`  [fetched] ${query}`);
  return pub.publicUrl;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const { data: missions, error } = await supabase
    .from('greenleaf_missions')
    .select('id, type, content')
    .eq('type', 'words_explorer');

  if (error || !missions) {
    console.error('Failed to fetch missions:', error);
    process.exit(1);
  }

  console.log(`Found ${missions.length} words_explorer missions\n`);

  let fetched = 0;
  let skipped = 0;

  for (const mission of missions) {
    const content = mission.content as { topic: string; words: { word: string; imageUrl: string; meaning?: string }[] };
    console.log(`--- ${content.topic} (${content.words.length} words) ---`);

    let changed = false;

    for (const w of content.words) {
      if (w.imageUrl) {
        skipped++;
        continue;
      }

      const searchTerm = `${w.word} ${content.topic}`;
      const url = await fetchAndCacheImage(searchTerm);
      if (url) {
        w.imageUrl = url;
        changed = true;
        fetched++;
      }

      await sleep(1500);
    }

    if (changed) {
      const { error: updateError } = await supabase
        .from('greenleaf_missions')
        .update({ content })
        .eq('id', mission.id);

      if (updateError) {
        console.error(`  [db error] updating mission ${mission.id}:`, updateError.message);
      } else {
        console.log(`  [saved] ${content.topic}`);
      }
    }
  }

  console.log(`\nDone! Fetched: ${fetched}, Skipped (already have image): ${skipped}`);
}

main();
