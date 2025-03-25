import { useState, useEffect, useCallback } from "react";

/**
 * Hook để xử lý giá trị với debounce
 * @param initialValue Giá trị ban đầu
 * @param delay Thời gian trễ (ms)
 * @returns Mảng gồm [debouncedValue, setValue, immediateValue]
 */
export function useDebounce<T>(
  initialValue: T,
  delay: number = 500
): [T, (value: T) => void, T] {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return [debouncedValue, setValue, value];
}

/**
 * Hook để xử lý tìm kiếm với debounce
 * @param callback Hàm xử lý khi giá trị thay đổi
 * @param delay Thời gian trễ (ms)
 * @returns Object gồm {search, setSearch, debouncedSearch}
 */
export function useDebounceSearch(
  callback: (value: string) => void,
  delay: number = 300
) {
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [searchValue, setSearchValue] = useState<string>("");

  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);

      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      const timeout = setTimeout(() => {
        callback(value);
      }, delay);

      setSearchTimeout(timeout);
    },
    [callback, delay, searchTimeout]
  );

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return {
    search: searchValue,
    setSearch: handleSearch,
    debouncedSearch: callback,
  };
}
