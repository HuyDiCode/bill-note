/**
 * Các types liên quan đến quản lý trạng thái ứng dụng
 */

import {
  CurrencyCode,
  NoteStatus,
  NoteSortOption,
  NoteViewMode,
  AppTheme,
} from "./enums";
import {
  Note,
  NoteItem,
  NoteItemAssignment,
  Profile,
  Category,
  Store,
  Tag,
  Notification,
} from "./database";

/**
 * Trạng thái của người dùng
 */
export interface UserState {
  user: Profile | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Bộ lọc cho danh sách ghi chú
 */
export interface NoteFilters {
  search?: string;
  categoryId?: string | null;
  storeId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  minAmount?: number | null;
  maxAmount?: number | null;
  status?: NoteStatus | null;
  tags?: string[] | null;
  isFavorite?: boolean | null;
  ownerId?: string | null;
}

/**
 * Trạng thái danh sách ghi chú
 */
export interface NoteListState {
  notes: Note[];
  filteredNotes: Note[];
  isLoading: boolean;
  error: string | null;
  filters: NoteFilters;
  sortOption: NoteSortOption;
  viewMode: NoteViewMode;
  selectedNoteId: string | null;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Trạng thái chi tiết ghi chú
 */
export interface NoteDetailState {
  note: Note | null;
  items: NoteItem[];
  assignments: NoteItemAssignment[];
  isLoading: boolean;
  error: string | null;
  isEditing: boolean;
}

/**
 * Trạng thái của bảng phân bổ chi phí
 */
export interface AssignmentState {
  assignments: NoteItemAssignment[];
  userAssignments: Record<string, NoteItemAssignment[]>; // Theo user_id
  itemAssignments: Record<string, NoteItemAssignment[]>; // Theo note_item_id
  isLoading: boolean;
  error: string | null;
  summaryByUser: Record<
    string,
    {
      totalAmount: number;
      paidAmount: number;
      unpaidAmount: number;
      items: string[];
    }
  >;
}

/**
 * Trạng thái danh mục
 */
export interface CategoryState {
  categories: Category[];
  selectedCategoryId: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Trạng thái cửa hàng
 */
export interface StoreState {
  stores: Store[];
  selectedStoreId: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Trạng thái thẻ
 */
export interface TagState {
  tags: Tag[];
  selectedTagIds: string[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Trạng thái cài đặt
 */
export interface SettingsState {
  theme: AppTheme;
  defaultCurrency: CurrencyCode;
  language: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Trạng thái thông báo
 */
export interface NotificationItem {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  autoDismiss?: boolean;
  duration?: number;
}

export interface NotificationState {
  notifications: NotificationItem[];
  systemNotifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Trạng thái chỉnh sửa ghi chú
 */
export interface NoteFormState {
  title: string;
  description: string | null;
  date: string;
  currency: CurrencyCode;
  storeId: string | null;
  categoryId: string | null;
  items: Omit<
    NoteItem,
    "id" | "note_id" | "created_at" | "updated_at" | "total_price"
  >[];
  tags: string[];
  errors: {
    title?: string;
    items?: string;
    date?: string;
  };
  isDirty: boolean;
  isSubmitting: boolean;
}

/**
 * Trạng thái phân bổ chi phí
 */
export interface AssignmentFormState {
  itemId: string;
  assignedUsers: Array<{
    userId: string;
    percentage: number;
    isCustomAmount: boolean;
    customAmount: number | null;
  }>;
  errors: {
    percentage?: string;
    users?: string;
  };
  isDirty: boolean;
  isSubmitting: boolean;
}

/**
 * Trạng thái tổng hợp của ứng dụng
 */
export interface RootState {
  user: UserState;
  noteList: NoteListState;
  noteDetail: NoteDetailState;
  assignments: AssignmentState;
  categories: CategoryState;
  stores: StoreState;
  tags: TagState;
  settings: SettingsState;
  notifications: NotificationState;
  noteForm: NoteFormState;
  assignmentForm: AssignmentFormState;
}
