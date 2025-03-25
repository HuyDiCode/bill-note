/**
 * Các hằng số được sử dụng trong ứng dụng
 */

import { NoteCategory, CurrencyCode } from "./enums";

/**
 * Thông tin cấu hình ứng dụng
 */
export const APP_CONFIG = {
  name: "Bill Note",
  version: "1.0.0",
  apiUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  apiKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  defaultCurrency: CurrencyCode.VND,
  defaultPageSize: 10,
  maxUploadSize: 5 * 1024 * 1024, // 5MB
};

/**
 * Định nghĩa các route trong ứng dụng
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  NOTES: "/notes",
  NOTE_DETAIL: "/notes/:id",
  SETTINGS: "/settings",
  PROFILE: "/profile",
  CATEGORIES: "/categories",
  STORES: "/stores",
  TAGS: "/tags",
};

/**
 * Danh sách các danh mục mặc định
 */
export const DEFAULT_CATEGORIES = [
  {
    name: NoteCategory.FOOD,
    icon: "UtensilsIcon",
    color: "#4CAF50",
  },
  {
    name: NoteCategory.HOME,
    icon: "HomeIcon",
    color: "#2196F3",
  },
  {
    name: NoteCategory.TRANSPORTATION,
    icon: "CarIcon",
    color: "#FF9800",
  },
  {
    name: NoteCategory.CLOTHING,
    icon: "ShirtIcon",
    color: "#9C27B0",
  },
  {
    name: NoteCategory.ENTERTAINMENT,
    icon: "FilmIcon",
    color: "#E91E63",
  },
  {
    name: NoteCategory.EDUCATION,
    icon: "BookIcon",
    color: "#3F51B5",
  },
  {
    name: NoteCategory.HEALTHCARE,
    icon: "HeartPulseIcon",
    color: "#F44336",
  },
  {
    name: NoteCategory.OTHER,
    icon: "MoreHorizontalIcon",
    color: "#607D8B",
  },
];

/**
 * Danh sách các đơn vị tiền tệ
 */
export const CURRENCY_LIST = [
  {
    code: CurrencyCode.VND,
    name: "Việt Nam Đồng",
    symbol: "₫",
    locale: "vi-VN",
  },
  {
    code: CurrencyCode.USD,
    name: "US Dollar",
    symbol: "$",
    locale: "en-US",
  },
  {
    code: CurrencyCode.EUR,
    name: "Euro",
    symbol: "€",
    locale: "de-DE",
  },
];

/**
 * Format số tiền theo đơn vị tiền tệ
 */
export const formatCurrency = (
  amount: number,
  currencyCode: CurrencyCode = CurrencyCode.VND
): string => {
  const currency = CURRENCY_LIST.find((c) => c.code === currencyCode);

  if (!currency) {
    return amount.toString();
  }

  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: currencyCode === CurrencyCode.VND ? 0 : 2,
  }).format(amount);
};

/**
 * Các thao tác chung trên database
 */
export const DB_TABLES = {
  PROFILES: "profiles",
  NOTES: "notes",
  NOTE_ITEMS: "note_items",
  CATEGORIES: "categories",
  STORES: "stores",
  NOTE_COLLABORATORS: "note_collaborators",
  TAGS: "tags",
  NOTE_TAGS: "note_tags",
};

/**
 * Các khóa local storage
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth-token",
  USER_PROFILE: "user-profile",
  THEME: "app-theme",
  LAST_VIEWED_NOTES: "last-viewed-notes",
  RECENT_SEARCHES: "recent-searches",
};

/**
 * Biểu thức chính quy (regex patterns)
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
  PHONE: /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/,
};
