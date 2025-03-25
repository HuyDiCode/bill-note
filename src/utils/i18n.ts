import i18n from "i18next";
import { ERROR_CODES, type ErrorCode } from "@/constants/errors";

/**
 * Lấy thông báo lỗi đã được dịch dựa trên mã lỗi
 * @param code Mã lỗi từ ERROR_CODES
 * @param args Tham số bổ sung cho thông báo (ví dụ: {{value}})
 * @returns Chuỗi thông báo lỗi đã được dịch
 */
export function getErrorMessage(
  code: ErrorCode,
  args?: Record<string, unknown>
): string {
  // Đảm bảo mã lỗi tồn tại trong ERROR_CODES để tránh lỗi
  const errorKey = Object.values(ERROR_CODES).includes(code)
    ? code
    : ERROR_CODES.UNKNOWN_ERROR;

  return i18n.t(`errors.${errorKey}`, args as Record<string, string>);
}

/**
 * Tạo đối tượng lỗi có định dạng chuẩn cho API response
 * @param code Mã lỗi từ ERROR_CODES
 * @param args Tham số bổ sung cho thông báo (ví dụ: {{value}})
 * @param details Chi tiết bổ sung về lỗi
 * @returns Đối tượng lỗi theo chuẩn API
 */
export function createErrorResponse(
  code: ErrorCode,
  args?: Record<string, unknown>,
  details?: Record<string, unknown>
) {
  return {
    success: false,
    error: {
      code,
      message: getErrorMessage(code, args),
      details,
    },
  };
}

/**
 * Trích xuất mã lỗi từ đối tượng lỗi (Error hoặc unknown)
 * @param error Đối tượng lỗi cần trích xuất mã
 * @returns Mã lỗi hoặc UNKNOWN_ERROR nếu không xác định được
 */
export function getErrorCode(error: unknown): ErrorCode {
  // Custom error với code
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code: string }).code;
    if (Object.values(ERROR_CODES).includes(code as ErrorCode)) {
      return code as ErrorCode;
    }
  }

  // Error có message có chứa mã lỗi
  if (error instanceof Error) {
    for (const code of Object.values(ERROR_CODES)) {
      if (error.message.includes(code)) {
        return code;
      }
    }
  }

  // Mặc định là lỗi không xác định
  return ERROR_CODES.UNKNOWN_ERROR;
}
