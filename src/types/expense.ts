export interface Expense {
  id: string;
  group_id: string;
  added_by: string;
  title: string;
  total_amount: number;
  date: string;
  receipt_image_url: string | null;
  created_at: string;
  updated_at: string;
  notes: string | null;
  store_name: string | null;
  category: string | null;
}

export interface ExpenseItem {
  id: string;
  expense_id: string;
  name: string;
  amount: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface ExpenseFilter {
  search?: string;
  category?: string;
  store?: string;
  dateFrom?: string;
  dateTo?: string;
}
