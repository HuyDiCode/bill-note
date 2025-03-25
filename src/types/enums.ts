/**
 * Định nghĩa các enum types được sử dụng trong ứng dụng
 */

/**
 * Các loại danh mục ghi chú
 */
export enum NoteCategory {
  FOOD = "Thực phẩm",
  HOME = "Nhà cửa",
  TRANSPORTATION = "Di chuyển",
  CLOTHING = "Quần áo",
  ENTERTAINMENT = "Giải trí",
  EDUCATION = "Học tập",
  HEALTHCARE = "Y tế",
  OTHER = "Khác",
}

/**
 * Các loại tiền tệ hỗ trợ
 */
export enum CurrencyCode {
  VND = "VND",
  USD = "USD",
  EUR = "EUR",
}

/**
 * Các quyền của người cộng tác trên ghi chú
 */
export enum CollaboratorPermission {
  VIEW = "view", // Chỉ xem
  EDIT = "edit", // Xem và chỉnh sửa
  ADMIN = "admin", // Xem, chỉnh sửa và quản lý người dùng khác
}

/**
 * Trạng thái của ghi chú
 */
export enum NoteStatus {
  ACTIVE = "active", // Ghi chú đang hoạt động
  ARCHIVED = "archived", // Ghi chú đã lưu trữ
  DELETED = "deleted", // Ghi chú đã xóa (soft delete)
}

/**
 * Các chủ đề giao diện của ứng dụng
 */
export enum AppTheme {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system",
}

/**
 * Các loại thông báo
 */
export enum NotificationType {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

/**
 * Các loại sắp xếp ghi chú
 */
export enum NoteSortOption {
  DATE_DESC = "date_desc",
  DATE_ASC = "date_asc",
  AMOUNT_DESC = "amount_desc",
  AMOUNT_ASC = "amount_asc",
  TITLE_ASC = "title_asc",
  TITLE_DESC = "title_desc",
  CREATED_AT_DESC = "created_at_desc",
  CREATED_AT_ASC = "created_at_asc",
}

/**
 * Các chế độ hiển thị ghi chú
 */
export enum NoteViewMode {
  LIST = "list",
  GRID = "grid",
  CALENDAR = "calendar",
}
