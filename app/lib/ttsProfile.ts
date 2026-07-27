import type { GradeCode } from './types';

export interface TtsProfile {
  rate: string;
  voice: string;
}

const YOUNG_GRADES: GradeCode[] = ['kindergarten', 'kids1', 'kids2'];

// Mầm non/tiểu học (Kindergarten, Kids 1, Kids 2): đọc chậm hơn + giọng gần với trẻ nhỏ
// (en-US-AnaNeural — giọng bé gái trong danh sách voice chuẩn của Azure), dễ nghe theo hơn.
// Teens giữ nguyên tốc độ/giọng người lớn bình thường.
export function getTtsProfile(gradeCode?: string | null): TtsProfile {
  if (gradeCode && YOUNG_GRADES.includes(gradeCode as GradeCode)) {
    return { rate: '-30%', voice: 'en-US-AnaNeural' };
  }
  return { rate: '-10%', voice: 'en-US-JennyNeural' };
}
