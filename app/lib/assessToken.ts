import { createHash, createHmac, timingSafeEqual } from 'crypto';

// Ties a specific (referenceText, score) pair to a signature only server code can produce.
// /api/assess signs the score it computed from the real Azure result; /api/missions/complete
// verifies it before trusting any score a client claims to have earned. Without this, anyone
// could POST straight to /api/missions/complete with a fabricated score and farm Leaf rewards
// without ever recording real audio.
//
// Keyed off SUPABASE_SERVICE_ROLE_KEY (already a private, server-only secret configured
// everywhere this app runs) via a domain-separated hash, instead of requiring a dedicated new
// secret that would also need to be added on Vercel.
function signingKey(): Buffer {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
  return createHash('sha256').update(`${secret}:assess-result`).digest();
}

export function signAssessResult(referenceText: string, score: number): string {
  return createHmac('sha256', signingKey()).update(`${referenceText}|${score}`).digest('hex');
}

export function verifyAssessResult(referenceText: string, score: number, token: unknown): boolean {
  if (typeof token !== 'string' || !/^[0-9a-f]{64}$/.test(token)) return false;
  const expected = Buffer.from(signAssessResult(referenceText, score), 'hex');
  const actual = Buffer.from(token, 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
