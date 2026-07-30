// Ported from pronunciation-app/lib/phoneme.ts — Azure SAPI phoneme to standard IPA mapping (en-US)
const AZURE_TO_IPA: Record<string, string> = {
  aa: 'ɑː', ae: 'æ', ah: 'ʌ', ao: 'ɔː', aw: 'aʊ', ax: 'ə', ay: 'aɪ',
  eh: 'ɛ', er: 'ɜːr', ey: 'eɪ', ih: 'ɪ', iy: 'iː', ow: 'oʊ', oy: 'ɔɪ',
  uh: 'ʊ', uw: 'uː',
  b: 'b', ch: 'tʃ', d: 'd', dh: 'ð', f: 'f', g: 'ɡ', hh: 'h', jh: 'dʒ',
  k: 'k', l: 'l', m: 'm', n: 'n', ng: 'ŋ', p: 'p', r: 'r', s: 's',
  sh: 'ʃ', t: 't', th: 'θ', v: 'v', w: 'w', y: 'j', z: 'z', zh: 'ʒ',
};

export function toIPA(azurePhoneme: string): string {
  return AZURE_TO_IPA[azurePhoneme.toLowerCase()] ?? azurePhoneme;
}
