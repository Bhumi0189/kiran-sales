"use client"

import React, { createContext, useContext, useReducer, useEffect } from "react"
import { useAuth } from "./auth-context"

type CartItem = {
  product: any
  quantity: number
}

type CartState = {
  items: CartItem[]
  itemCount: number
  total: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { product: any } }
  | { type: "REMOVE_ITEM"; payload: { productId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }

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
        (item) => item.product._id === action.payload.product._id
      )
      let updatedItems
      if (existingItemIndex !== -1) {
        updatedItems = [...state.items]
        updatedItems[existingItemIndex].quantity += 1
      } else {
        updatedItems = [...state.items, { product: action.payload.product, quantity: 1 }]
      }
      const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      const total = updatedItems.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0)
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
      parsedCart.items.forEach((item: CartItem) => {
        for (let i = 0; i < item.quantity; i++) {
          dispatch({ type: "ADD_ITEM", payload: { product: item.product } })
        }
      })
    } else {
      dispatch({ type: "CLEAR_CART" }) // Clear cart if no stored cart for this user
    }
  }, [authState.user?.id]) // Depend on user ID to reload cart on login/logout

  useEffect(() => {
    const userId = authState.user?.id
    const cartKey = getCartKey(userId)
    if (authState.user) {
      localStorage.setItem(cartKey, JSON.stringify(state))
    } else {
      // If no user, don't save cart or clear guest cart
      localStorage.removeItem(cartKey)
    }
  }, [state, authState.user])

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
