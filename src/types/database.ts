/**
 * Định nghĩa các types và enums cho cơ sở dữ liệu
 * Tự động sinh từ schema của cơ sở dữ liệu
 */

import {
  NoteCategory,
  CurrencyCode,
  CollaboratorPermission,
  NoteStatus,
} from "./enums";

// Interface cho bảng profiles
export interface Profile {
  id: string; // UUID
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  default_currency: CurrencyCode;
  email: string | null;
  created_at: string; // ISO date string
  updated_at: string | null; // ISO date string
}

// Interface cho bảng categories
export interface Category {
  id: string; // UUID
  name: string;
  icon: string | null;
  color: string | null;
  created_at: string; // ISO date string
  updated_at: string | null; // ISO date string
}

// Interface cho bảng stores
export interface Store {
  id: string; // UUID
  name: string;
  address: string | null;
  created_at: string; // ISO date string
  updated_at: string | null; // ISO date string
}

// Interface cho bảng notes
export interface Note {
  id: string; // UUID
  owner_id: string; // UUID (foreign key to auth.users)
  title: string;
  description: string | null;
  date: string; // ISO date string
  total_amount: number;
  currency: CurrencyCode;
  store_id: string | null; // UUID (foreign key to stores)
  category_id: string | null; // UUID (foreign key to categories)
  is_archived: boolean;
  is_favorite: boolean;
  status: NoteStatus;
  created_at: string; // ISO date string
  updated_at: string | null; // ISO date string
}

// Interface cho bảng note_items
export interface NoteItem {
  id: string; // UUID
  note_id: string; // UUID (foreign key to notes)
  name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  total_price: number; // Generated (quantity * unit_price)
  category_id: string | null; // UUID (foreign key to categories)
  purchase_date: string | null; // ISO date string
  created_at: string; // ISO date string
  updated_at: string | null; // ISO date string
}

// Interface cho bảng note_item_assignments
export interface NoteItemAssignment {
  id: string; // UUID
  note_item_id: string; // UUID (foreign key to note_items)
  user_id: string; // UUID (foreign key to auth.users)
  percentage: number; // Phần trăm phân bổ (100 = toàn bộ, 50 = nửa, v.v.)
  amount: number; // Số tiền được phân bổ
  is_paid: boolean; // Trạng thái đã thanh toán hay chưa
  created_at: string; // ISO date string
  updated_at: string | null; // ISO date string
}

// Interface cho bảng note_collaborators
export interface NoteCollaborator {
  id: string; // UUID
  note_id: string; // UUID (foreign key to notes)
  user_id: string; // UUID (foreign key to auth.users)
  permission: CollaboratorPermission;
  created_at: string; // ISO date string
}

// Interface cho bảng tags
export interface Tag {
  id: string; // UUID
  name: string;
  color: string | null;
  created_by: string | null; // UUID (foreign key to auth.users)
  created_at: string; // ISO date string
}

// Interface cho bảng note_tags (junction table)
export interface NoteTag {
  note_id: string; // UUID (foreign key to notes)
  tag_id: string; // UUID (foreign key to tags)
}

// Interface cho bảng notifications
export interface Notification {
  id: string; // UUID
  user_id: string; // UUID (foreign key to auth.users)
  title: string;
  message: string;
  type: "assignment" | "payment" | "collaboration" | "system";
  is_read: boolean;
  reference_id: string | null; // UUID của đối tượng liên quan (note, note_item, etc.)
  reference_type: string | null; // Loại đối tượng liên quan
  created_at: string; // ISO date string
}

// Type tổng hợp cho Note với các Item và Collaborator
export interface NoteWithDetails extends Note {
  items?: NoteItem[];
  collaborators?: NoteCollaborator[];
  tags?: Tag[];
  store?: Store;
  category?: Category;
}

// Type tổng hợp cho NoteItem với các Assignment
export interface NoteItemWithAssignments extends NoteItem {
  assignments?: NoteItemAssignment[];
  category?: Category;
}

// Database Schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;
      };
      notes: {
        Row: Note;
        Insert: Omit<Note, "created_at" | "updated_at" | "total_amount">;
        Update: Partial<
          Omit<Note, "id" | "created_at" | "updated_at" | "total_amount">
        >;
      };
      note_items: {
        Row: NoteItem;
        Insert: Omit<NoteItem, "created_at" | "updated_at" | "total_price">;
        Update: Partial<
          Omit<NoteItem, "id" | "created_at" | "updated_at" | "total_price">
        >;
      };
      note_item_assignments: {
        Row: NoteItemAssignment;
        Insert: Omit<
          NoteItemAssignment,
          "id" | "created_at" | "updated_at" | "amount"
        >;
        Update: Partial<
          Omit<NoteItemAssignment, "id" | "created_at" | "updated_at">
        >;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, "created_at" | "updated_at">;
        Update: Partial<Omit<Category, "id" | "created_at" | "updated_at">>;
      };
      stores: {
        Row: Store;
        Insert: Omit<Store, "created_at" | "updated_at">;
        Update: Partial<Omit<Store, "id" | "created_at" | "updated_at">>;
      };
      note_collaborators: {
        Row: NoteCollaborator;
        Insert: Omit<NoteCollaborator, "id" | "created_at">;
        Update: Partial<Omit<NoteCollaborator, "id" | "created_at">>;
      };
      tags: {
        Row: Tag;
        Insert: Omit<Tag, "id" | "created_at">;
        Update: Partial<Omit<Tag, "id" | "created_at">>;
      };
      note_tags: {
        Row: NoteTag;
        Insert: NoteTag;
        Update: NoteTag;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id" | "created_at">;
        Update: Partial<Omit<Notification, "id" | "created_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      note_category: NoteCategory;
      currency_code: CurrencyCode;
    };
  };
}

/**
 * Loại tài nguyên được sử dụng cho truy vấn Supabase
 */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
