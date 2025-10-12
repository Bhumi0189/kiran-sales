"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode, useEffect } from "react"

export interface User {
  id: string
  _id?: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  address?: string
  role: "customer" | "admin"
  createdAt: string
  token?: string // Add token property for authentication
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "SIGNUP_SUCCESS"; payload: User }
  | { type: "SET_LOADING"; payload: boolean }

const AuthContext = createContext<{
  state: AuthState
  dispatch: React.Dispatch<AuthAction>
  login: (email: string, password: string) => Promise<boolean>
  signup: (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) => Promise<boolean>
  logout: () => void
} | null>(null)

// Mock users database
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@kiransales.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "customer@example.com",
    firstName: "John",
    lastName: "Doe",
    phone: "+91 98765 43210",
    role: "customer",
    createdAt: "2024-01-15T00:00:00Z",
  },
]

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true }

    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      }

    case "LOGIN_FAILURE":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }

    case "SIGNUP_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      }

    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }

    case "SET_LOADING":
      return { ...state, isLoading: action.payload }

    default:
      return state
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("kiran-sales-user")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        dispatch({ type: "LOGIN_SUCCESS", payload: user })
      } catch (error) {
        localStorage.removeItem("kiran-sales-user")
      }
    }
    dispatch({ type: "SET_LOADING", payload: false })
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: "LOGIN_START" })
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        dispatch({ type: "LOGIN_FAILURE" })
        return false
      }
      const user = await res.json()
      localStorage.setItem("kiran-sales-user", JSON.stringify(user))
      dispatch({ type: "LOGIN_SUCCESS", payload: user })
      return true
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" })
      return false
    }
  }

  const signup = async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }): Promise<boolean> => {
    dispatch({ type: "LOGIN_START" })
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
      if (!res.ok) {
        dispatch({ type: "LOGIN_FAILURE" })
        return false
      }
      const user = await res.json()
      localStorage.setItem("kiran-sales-user", JSON.stringify(user))
      dispatch({ type: "SIGNUP_SUCCESS", payload: user })
      return true
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" })
      return false
    }
  }

  const logout = () => {
    const cartKey = `cart_${state.user?.id || 'guest'}`;
    localStorage.removeItem(cartKey); // Clear cart data on logout
    localStorage.removeItem("kiran-sales-user")
    dispatch({ type: "LOGOUT" })
  }

  return <AuthContext.Provider value={{ state, dispatch, login, signup, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
