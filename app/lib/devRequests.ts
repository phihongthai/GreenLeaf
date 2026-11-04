import { createHmac, timingSafeEqual } from 'crypto';

export type DevRequestStatus = 'queued' | 'running' | 'needs_answer' | 'needs_review' | 'merged' | 'failed' | 'no_changes';

export const DEV_REQUEST_MAX_LENGTH = 4000;

export function signCallback(requestId: string, status: string): string {
  return createHmac('sha256', process.env.DEV_CALLBACK_SECRET ?? '')
    .update(`${requestId}:${status}`)
    .digest('hex');
}

export function verifyCallback(requestId: string, status: string, signature: string): boolean {
  if (!process.env.DEV_CALLBACK_SECRET) return false;
  const expected = Buffer.from(signCallback(requestId, status));
  const given = Buffer.from(signature ?? '');
  return expected.length === given.length && timingSafeEqual(expected, given);
}
