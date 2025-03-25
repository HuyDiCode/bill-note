import { useApp } from '@/contexts/AppContext'

/**
 * Hook để quản lý theme trong ứng dụng
 * Cung cấp API đơn giản để đọc và thay đổi theme
 */
export function useTheme() {
  const { state, dispatch } = useApp()
  
  /**
   * Đặt theme mới
   */
  const setTheme = (value: 'light' | 'dark' | 'system') => {
    dispatch({ type: 'SET_THEME', payload: value })
  }
  
  /**
   * Chuyển đổi qua lại giữa light và dark mode
   * Nếu đang ở system mode, sẽ chuyển sang light mode
   */
  const toggleTheme = () => {
    if (state.theme === 'dark') {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }
  
  return { 
    theme: state.theme, 
    setTheme,
    toggleTheme,
    isDark: state.theme === 'dark',
    isLight: state.theme === 'light',
    isSystem: state.theme === 'system'
  }
} 