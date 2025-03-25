'use client'

import { createContext, useContext, useReducer, ReactNode, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

// Define types
export type User = {
  id: string
  email: string | null
  avatar_url: string | null
  name: string | null
}

type AppState = {
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
  user: User | null
}

export type AppAction =
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_NOTIFICATIONS'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'UPDATE_USER'; payload: Partial<User> }

// Create context
const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

// Initial state
const initialState: AppState = {
  theme: 'system',
  notifications: true,
  user: null,
}

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload }
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      }
    default:
      return state
  }
}

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const { setTheme, theme: currentTheme } = useTheme()
  const isInitialMount = useRef(true);
  const isUpdatingFromNextThemes = useRef(false);
  const isUpdatingFromAppContext = useRef(false);

  // Load theme from localStorage on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
        dispatch({ type: 'SET_THEME', payload: savedTheme as 'light' | 'dark' | 'system' });
      }
      isInitialMount.current = false;
    }
  }, []);

  // Synchronize theme from AppContext to next-themes
  useEffect(() => {
    if (!isInitialMount.current && !isUpdatingFromNextThemes.current) {
      isUpdatingFromAppContext.current = true;
      setTheme(state.theme);
      localStorage.setItem('theme', state.theme);
      setTimeout(() => {
        isUpdatingFromAppContext.current = false;
      }, 0);
    }
  }, [state.theme, setTheme]);

  // Synchronize theme from next-themes to AppContext
  useEffect(() => {
    if (!isInitialMount.current && !isUpdatingFromAppContext.current && currentTheme) {
      if (currentTheme === 'light' || currentTheme === 'dark' || currentTheme === 'system') {
        if (currentTheme !== state.theme) {
          isUpdatingFromNextThemes.current = true;
          dispatch({ type: 'SET_THEME', payload: currentTheme });
          setTimeout(() => {
            isUpdatingFromNextThemes.current = false;
          }, 0);
        }
      }
    }
  }, [currentTheme, state.theme, dispatch]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
} 