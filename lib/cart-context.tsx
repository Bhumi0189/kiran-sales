"use client"

import React, { createContext, useContext, useReducer, useEffect } from "react"
import { useAuth } from "./auth-context"

type CartItem = {
  product: any
  quantity: number
  id: string
  size?: string
  color?: string
  image?: string
  name: string
  category?: string
  price: number
}

type CartState = {
  items: CartItem[]
  itemCount: number
  total: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { product: any; size?: string; color?: string } } // Add size and color properties
  | { type: "REMOVE_ITEM"; payload: { productId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "SET_ITEMS"; payload: { items: CartItem[] } } // Add SET_ITEMS action

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
}>({
  state: { items: [], itemCount: 0, total: 0 },
  dispatch: () => null,
})

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.product._id && item.size === action.payload.size && item.color === action.payload.color
      )
      let updatedItems
      if (existingItemIndex !== -1) {
        updatedItems = [...state.items]
        updatedItems[existingItemIndex].quantity += 1
      } else {
        updatedItems = [
          ...state.items,
          {
            id: action.payload.product._id,
            name: action.payload.product.name,
            price: action.payload.product.price || 0,
            quantity: 1,
            size: action.payload.size,
            color: action.payload.color,
            image: action.payload.product.image,
            category: action.payload.product.category,
            product: action.payload.product,
          },
        ]
      }
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      const total = updatedItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
      return { items: updatedItems, itemCount, total }
    }
    case "REMOVE_ITEM": {
      const updatedItems = state.items.filter((item) => item.product._id !== action.payload.productId)
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      const total = updatedItems.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0)
      return { items: updatedItems, itemCount, total }
    }
    case "UPDATE_QUANTITY": {
      const updatedItems = state.items.map(item =>
        item.product._id === action.payload.id ? { ...item, quantity: Math.max(0, action.payload.quantity) } : item
      ).filter(item => item.quantity > 0)
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      const total = updatedItems.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0)
      return { items: updatedItems, itemCount, total }
    }
    case "CLEAR_CART": {
      return { items: [], itemCount: 0, total: 0 }
    }
    case "SET_ITEMS": {
      // Accept either { items: [...] } or an array passed directly for compatibility
      const anyPayload: any = (action as any).payload
      const itemsArray: any[] | null = Array.isArray(anyPayload?.items)
        ? anyPayload.items
        : Array.isArray(anyPayload)
        ? anyPayload
        : null

      if (!itemsArray || !Array.isArray(itemsArray)) {
        // Fallback: try to find any array inside the payload (e.g. payload.data.items or payload.orders)
        let foundArray: any[] | null = null
        let foundKey: string | null = null
        if (anyPayload && typeof anyPayload === 'object') {
          for (const [k, v] of Object.entries(anyPayload)) {
            if (Array.isArray(v)) {
              foundArray = v as any[]
              foundKey = k
              break
            }
            // nested check (one level deep)
            if (v && typeof v === 'object') {
              for (const [k2, v2] of Object.entries(v as any)) {
                if (Array.isArray(v2)) {
                  foundArray = v2 as any[]
                  foundKey = `${k}.${k2}`
                  break
                }
              }
              if (foundArray) break
            }
          }
        }

        if (foundArray) {
          console.warn(`SET_ITEMS received nonstandard payload; using array found at key '${foundKey}' to proceed.`, { payload: anyPayload })
          // normalize and proceed
          const normalized = foundArray.map((item: any) => ({ ...item, quantity: Number(item.quantity) || 0 }))
          const itemCount = normalized.reduce((sum, item) => sum + item.quantity, 0)
          const total = normalized.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
          return { items: normalized, itemCount, total }
        }

        const ctx = { payload: anyPayload, location: typeof window !== 'undefined' ? window.location.href : 'server' }
        let payloadStr = '<unserializable>'
        try { payloadStr = JSON.stringify(anyPayload) } catch (e) { payloadStr = '<circular or unserializable payload>' }
        console.error("Invalid payload for SET_ITEMS: `items` is missing or not an array.", { payloadStr, ctx }, new Error().stack)
        return state // Return current state if payload is invalid
      }

      // Normalize quantities to numbers to avoid downstream NaN issues
      const normalized = itemsArray.map((item: any) => ({ ...item, quantity: Number(item.quantity) || 0 }))

      const itemCount = normalized.reduce((sum, item) => sum + item.quantity, 0)
      const total = normalized.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
      return { items: normalized, itemCount, total }
    }
    default:
      return state
  }
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], itemCount: 0, total: 0 })
  const { state: authState } = useAuth()

  const getCartKey = (userId?: string) => `cart_${userId || 'guest'}`

  useEffect(() => {
    const userId = authState.user?.id
    const cartKey = getCartKey(userId)
    const storedCart = localStorage.getItem(cartKey)
    if (storedCart) {
      dispatch({ type: "CLEAR_CART" }) // Clear first to avoid duplication
      const parsedCart = JSON.parse(storedCart)
      // Restore items including size and color
      parsedCart.items.forEach((item: CartItem) => {
        for (let i = 0; i < item.quantity; i++) {
          dispatch({ type: "ADD_ITEM", payload: { product: item.product, size: item.size, color: item.color } })
        }
      })
    } else {
      dispatch({ type: "CLEAR_CART" }) // Clear cart if no stored cart for this user
    }
  }, [authState.user?.id]) // Depend on user ID to reload cart on login/logout

  useEffect(() => {
    const initializeCart = () => {
      const userId = authState.user?.id
      const cartKey = getCartKey(userId)

      try {
        const storedCart = localStorage.getItem(cartKey)
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart)
          if (parsedCart.items && Array.isArray(parsedCart.items)) {
            dispatch({ type: "SET_ITEMS", payload: { items: parsedCart.items } })
          }
        }
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }

    initializeCart()
  }, [authState.user])

  useEffect(() => {
    const saveCart = () => {
      const userId = authState.user?.id
      const cartKey = getCartKey(userId)

      try {
        localStorage.setItem(cartKey, JSON.stringify(state))
      } catch (error) {
        console.error("Error saving cart to localStorage:", error)
      }
    }

    saveCart()
  }, [state])

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
