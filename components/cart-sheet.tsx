"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { formatRupee } from '@/lib/format'
import Image from "next/image"
import Link from "next/link"

export function CartSheet() {
  const { state, dispatch } = useCart()

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { productId: id } })
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 relative">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Cart
          {state.itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center">
              {state.itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart ({state.itemCount} items)</SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex-1 overflow-y-auto">
          {state.items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <SheetTrigger asChild>
                <Button variant="outline">Continue Shopping</Button>
              </SheetTrigger>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div
                    key={`${item.product._id || item.product.id}-${item.product.size || ''}-${item.product.color || ''}`}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                  >
                    <Image
                      src={item.product.image || "/placeholder.svg"}
                      alt={item.product.name}
                      width={80}
                      height={80}
                      className="rounded-md object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">{item.product.category}</p>
                      {item.product.size && <p className="text-xs text-gray-400">Size: {item.product.size}</p>}
                      {item.product.color && <p className="text-xs text-gray-400">Color: {item.product.color}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-gray-900">{formatRupee(item.product.price)}</span>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product._id || item.product.id, item.quantity - 1)}
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product._id || item.product.id, item.quantity + 1)}
                            className="w-8 h-8 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item.product._id || item.product.id)}
                            className="w-8 h-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-xl font-bold text-blue-600">{formatRupee(state.total)}</span>
                </div>

                <div className="space-y-2">
                  <Link href="/checkout" className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Proceed to Checkout</Button>
                  </Link>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full bg-transparent">
                      Continue Shopping
                    </Button>
                  </SheetTrigger>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
