export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          avatar_url: string | null;
          email: string | null;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          avatar_url?: string | null;
          email?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          avatar_url?: string | null;
          email?: string | null;
          updated_at?: string;
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          created_by: string;
          currency: string;
          avatar_url: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          created_by: string;
          currency?: string;
          avatar_url?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          created_by?: string;
          currency?: string;
          avatar_url?: string | null;
          is_active?: boolean;
        };
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          role: string;
          joined_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string;
          is_active?: boolean;
        };
      };
      expenses: {
        Row: {
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
        };
        Insert: {
          id?: string;
          group_id: string;
          added_by: string;
          title: string;
          total_amount: number;
          date?: string;
          receipt_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
          notes?: string | null;
          store_name?: string | null;
          category?: string | null;
        };
        Update: {
          id?: string;
          group_id?: string;
          added_by?: string;
          title?: string;
          total_amount?: number;
          date?: string;
          receipt_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
          notes?: string | null;
          store_name?: string | null;
          category?: string | null;
        };
      };
      expense_items: {
        Row: {
          id: string;
          expense_id: string;
          name: string;
          amount: number;
          unit_price: number;
          total_price: number;
          category: string | null;
        };
        Insert: {
          id?: string;
          expense_id: string;
          name: string;
          amount?: number;
          unit_price: number;
          total_price: number;
          category?: string | null;
        };
        Update: {
          id?: string;
          expense_id?: string;
          name?: string;
          amount?: number;
          unit_price?: number;
          total_price?: number;
          category?: string | null;
        };
      };
      expense_shares: {
        Row: {
          id: string;
          expense_item_id: string;
          user_id: string;
          amount_to_pay: number;
          is_paid: boolean;
          paid_at: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          expense_item_id: string;
          user_id: string;
          amount_to_pay: number;
          is_paid?: boolean;
          paid_at?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          expense_item_id?: string;
          user_id?: string;
          amount_to_pay?: number;
          is_paid?: boolean;
          paid_at?: string | null;
          notes?: string | null;
        };
      };
      invitations: {
        Row: {
          id: string;
          group_id: string;
          email: string;
          invited_by: string;
          status: string;
          created_at: string;
          expires_at: string;
          token: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          email: string;
          invited_by: string;
          status?: string;
          created_at?: string;
          expires_at?: string;
          token: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          email?: string;
          invited_by?: string;
          status?: string;
          created_at?: string;
          expires_at?: string;
          token?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          group_id: string;
          payer_id: string;
          receiver_id: string;
          amount: number;
          date: string;
          note: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          payer_id: string;
          receiver_id: string;
          amount: number;
          date?: string;
          note?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          payer_id?: string;
          receiver_id?: string;
          amount?: number;
          date?: string;
          note?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_avatar_upload_path: {
        Args: {
          user_id: string;
        };
        Returns: string;
      };
      get_avatar_upload_url: {
        Args: {
          file_name: string;
          file_type: string;
        };
        Returns: string;
      };
      get_group_avatar_upload_path: {
        Args: {
          group_id: string;
        };
        Returns: string;
      };
      get_group_members: {
        Args: {
          group_id: string;
        };
        Returns: {
          user_id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          role: string;
          joined_at: string;
        }[];
      };
      get_optimized_settlements: {
        Args: {
          group_id: string;
        };
        Returns: {
          payer_id: string;
          receiver_id: string;
          amount: number;
        }[];
      };
      get_receipt_upload_path: {
        Args: {
          expense_id: string;
        };
        Returns: string;
      };
      get_user_balance: {
        Args: {
          user_id: string;
          group_id: string;
        };
        Returns: number;
      };
      update_profile_with_avatar: {
        Args: {
          user_id: string;
          user_name: string;
          avatar_url: string | null;
        };
        Returns: {
          id: string;
          name: string | null;
          avatar_url: string | null;
          updated_at: string | null;
          created_at: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          id: string;
          name: string;
          owner: string | null;
          created_at: string | null;
          updated_at: string | null;
          public: boolean | null;
          avif_autodetection: boolean | null;
          file_size_limit: number | null;
          allowed_mime_types: string[] | null;
        };
      };
      objects: {
        Row: {
          id: string;
          bucket_id: string;
          name: string;
          owner: string | null;
          created_at: string | null;
          updated_at: string | null;
          last_accessed_at: string | null;
          metadata: Json | null;
        };
      };
    };
  };
}
