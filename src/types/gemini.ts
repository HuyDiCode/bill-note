/**
 * Types liên quan đến việc tích hợp Gemini API
 * Định nghĩa các interfaces cho việc gửi và nhận dữ liệu từ Gemini API
 */

import { CurrencyCode } from "./enums";

/**
 * Loại dữ liệu đầu vào cho Gemini API
 */
export interface GeminiRequestData {
  imageBase64: string; // Hình ảnh được mã hóa Base64
  options?: {
    detectionMode?: "BASIC" | "DETAILED"; // Chế độ phân tích (cơ bản hoặc chi tiết)
    preferredLanguage?: string; // Ngôn ngữ ưu tiên cho kết quả
  };
}

/**
 * Cấu trúc dữ liệu phân tích hóa đơn từ Gemini API
 */
export interface GeminiReceiptData {
  storeName: string; // Tên cửa hàng
  storeAddress: string | null; // Địa chỉ cửa hàng (nếu có)
  date: string | null; // Ngày trên hóa đơn
  time: string | null; // Thời gian trên hóa đơn
  items: GeminiReceiptItem[]; // Danh sách các mục trong hóa đơn
  subtotal: number | null; // Tổng tiền trước thuế
  tax: number | null; // Thuế
  tip: number | null; // Tiền tip (nếu có)
  total: number; // Tổng số tiền
  currency: CurrencyCode | null; // Loại tiền tệ
  paymentMethod: string | null; // Phương thức thanh toán
  receiptNumber: string | null; // Số hóa đơn (nếu có)
  merchantId: string | null; // ID của người bán (nếu có)
}

/**
 * Một mục trong hóa đơn được trích xuất
 */
export interface GeminiReceiptItem {
  name: string; // Tên mục
  description: string | null; // Mô tả (nếu có)
  quantity: number; // Số lượng
  unitPrice: number; // Đơn giá
  totalPrice: number; // Tổng giá (quantity * unitPrice)
  category: string | null; // Danh mục mục này thuộc về (nếu có thể xác định)
  confidenceScore: number; // Điểm tin cậy từ 0-1
}

/**
 * Chi tiết lỗi từ Gemini API
 */
export interface GeminiErrorDetails {
  field?: string;
  reason?: string;
  location?: string;
  additionalInfo?: Record<string, unknown>;
}

/**
 * Phản hồi từ Gemini API
 */
export interface GeminiApiResponse {
  success: boolean; // Trạng thái thành công
  data?: GeminiReceiptData; // Dữ liệu khi thành công
  error?: {
    code: string; // Mã lỗi
    message: string; // Thông báo lỗi
    details?: GeminiErrorDetails; // Chi tiết lỗi (nếu có)
  };
  processingTimeMs?: number; // Thời gian xử lý (ms)
  confidence?: number; // Điểm tin cậy tổng thể từ 0-1
}

/**
 * Trạng thái xử lý hình ảnh
 */
export enum ImageProcessingStatus {
  IDLE = "idle",
  UPLOADING = "uploading",
  PROCESSING = "processing",
  SUCCESS = "success",
  ERROR = "error",
}

/**
 * Trạng thái của quá trình quét hóa đơn
 */
export interface ReceiptScanState {
  status: ImageProcessingStatus;
  originalImage: string | null; // URL hoặc Base64 của hình ảnh gốc
  extractedData: GeminiReceiptData | null;
  error: string | null;
  isReviewing: boolean; // Người dùng đang xem lại dữ liệu
  progress: number; // Tiến trình từ 0-100
  confidence: number | null; // Điểm tin cậy tổng thể từ 0-1
}

/**
 * Cấu hình cho việc xử lý hóa đơn
 */
export interface ReceiptProcessingConfig {
  autoConfirmThreshold: number; // Tự động xác nhận nếu độ tin cậy trên ngưỡng này (0-1)
  preferredLanguage: string; // Ngôn ngữ ưu tiên
  detectionMode: "BASIC" | "DETAILED"; // Chế độ phân tích
  storeCategorySuggestions: boolean; // Lưu các gợi ý danh mục
  storeOriginalImage: boolean; // Lưu hình ảnh gốc
  maximumImageSize: number; // Kích thước tối đa cho hình ảnh (bytes)
}
