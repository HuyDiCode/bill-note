/**
 * Generic Result type for handling success and error states in a consistent way
 */
export type Result<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

/**
 * Create a success result with data
 */
export function success<T>(data: T): Result<T> {
  return {
    data,
    success: true
  };
}

/**
 * Create an error result with message
 */
export function failure<T>(error: string): Result<T> {
  return {
    error,
    success: false
  };
} 