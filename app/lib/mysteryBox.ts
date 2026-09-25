export const MYSTERY_BOX_COST = 100;

export interface MysteryBoxRequest {
  id: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}
