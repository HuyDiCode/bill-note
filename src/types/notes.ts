/**
 * Ghi chú chi tiêu
 */
export interface Note {
  id: string;
  title: string;
  category?: string;
  date?: string;
  total_amount?: number;
  store_name?: string;
  notes?: string;
  added_by: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Chi tiết món đồ trong ghi chú
 */
export interface NoteItem {
  id: string;
  note_id: string;
  name: string;
  amount: number;
  unit_price?: number;
  total_price?: number;
  category?: string;
  purchase_date?: string;
  store_name?: string;
  notes?: string;
}
