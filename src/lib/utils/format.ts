import { format as formatDate } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * Các định dạng ngày tháng
 */
export const DATE_FORMAT = {
  /** Định dạng ngày/tháng/năm (vd: 01/01/2023) */
  SHORT: "dd/MM/yyyy",
  /** Định dạng ngày tháng đầy đủ (vd: 01 tháng 01, 2023) */
  FULL: "dd 'tháng' MM, yyyy",
  /** Định dạng ngày giờ (vd: 01/01/2023 14:30) */
  DATETIME: "dd/MM/yyyy HH:mm",
};

/**
 * Các loại tiền tệ
 */
export const CURRENCY = {
  /** Đồng Việt Nam */
  VND: "VND",
  /** Đô la Mỹ */
  USD: "USD",
};

/**
 * Định dạng số thành chuỗi tiền tệ
 * @param value - Giá trị cần định dạng
 * @param currency - Loại tiền tệ (mặc định: VND)
 * @returns Chuỗi đã định dạng theo tiền tệ
 */
export function formatCurrency(
  value: number,
  currency: string = CURRENCY.VND
): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
  }).format(value);
}

/**
 * Định dạng số với phân cách hàng nghìn
 * @param value - Giá trị cần định dạng
 * @param fractionDigits - Số chữ số thập phân (mặc định: 0)
 * @returns Chuỗi số đã định dạng
 */
export function formatNumber(
  value: number,
  fractionDigits: number = 0
): string {
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/**
 * Định dạng ngày thành chuỗi
 * @param date - Ngày cần định dạng (Date hoặc chuỗi ISO)
 * @param formatStr - Định dạng (mặc định: dd/MM/yyyy)
 * @returns Chuỗi ngày đã định dạng
 */
export function formatDateStr(
  date: Date | string,
  formatStr: string = DATE_FORMAT.SHORT
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDate(dateObj, formatStr, { locale: vi });
}
