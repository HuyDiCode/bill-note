/**
 * Các hằng số cho mã lỗi trong ứng dụng
 * Tất cả mã lỗi nên được định nghĩa ở đây để đảm bảo tính nhất quán
 */

// Mã lỗi chung (Common Error Codes)
export const COMMON_ERRORS = {
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  CLIENT_ERROR: "CLIENT_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

// Mã lỗi xác thực (Authentication Error Codes)
export const AUTH_ERRORS = {
  UNAUTHORIZED: "UNAUTHORIZED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
} as const;

// Mã lỗi xử lý hình ảnh (Image Processing Error Codes)
export const IMAGE_ERRORS = {
  INVALID_IMAGE: "INVALID_IMAGE",
  PROCESSING_FAILED: "PROCESSING_FAILED",
  IMAGE_TOO_LARGE: "IMAGE_TOO_LARGE",
  UNSUPPORTED_FORMAT: "UNSUPPORTED_FORMAT",
  UPLOAD_FAILED: "UPLOAD_FAILED",
  STORAGE_ERROR: "STORAGE_ERROR",
} as const;

// Mã lỗi API Gemini (Gemini API Error Codes)
export const GEMINI_ERRORS = {
  API_NOT_CONFIGURED: "API_NOT_CONFIGURED",
  EXTRACTION_FAILED: "EXTRACTION_FAILED",
  INVALID_REQUEST: "INVALID_REQUEST",
  LOW_CONFIDENCE: "LOW_CONFIDENCE",
  NO_TEXT_DETECTED: "NO_TEXT_DETECTED",
  NOT_A_RECEIPT: "NOT_A_RECEIPT",
} as const;

// Mã lỗi tài liệu/ghi chú (Note Error Codes)
export const NOTE_ERRORS = {
  NOT_FOUND: "NOTE_NOT_FOUND",
  CREATION_FAILED: "NOTE_CREATION_FAILED",
  UPDATE_FAILED: "NOTE_UPDATE_FAILED",
  DELETE_FAILED: "NOTE_DELETE_FAILED",
  COLLABORATOR_ERROR: "COLLABORATOR_ERROR",
} as const;

// Kết hợp tất cả mã lỗi vào một đối tượng
export const ERROR_CODES = {
  ...COMMON_ERRORS,
  ...AUTH_ERRORS,
  ...IMAGE_ERRORS,
  ...GEMINI_ERRORS,
  ...NOTE_ERRORS,
} as const;

// Type cho tất cả mã lỗi
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
