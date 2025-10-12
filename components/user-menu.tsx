"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Phone, LogOut, Star, Heart, ShoppingBag, User, MessageCircle, Home, Lock } from "lucide-react"
import Link from "next/link"

export function UserMenu() {
  const { state, logout } = useAuth()
  const { state: cartState } = useCart()
  const [open, setOpen] = React.useState(false)
  const [orders, setOrders] = React.useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = React.useState(true)
  const [wishlist, setWishlist] = React.useState<any[]>([])
  const [loadingWishlist, setLoadingWishlist] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState("dashboard")
  const [selectedOrder, setSelectedOrder] = React.useState<any | null>(null)
  // For review/rating UI
  const [reviewState, setReviewState] = useState<{ [key: string]: { rating: number; review: string; imageUrl: string; loading: boolean } }>({})

  if (!state.user || state.user.role === "admin") return null

  const initials = `${state.user.firstName[0]}${state.user.lastName[0]}`.toUpperCase()

  // Fetch orders and wishlist when dialog opens
  const fetchOrdersAndWishlist = React.useCallback(() => {
    if (!state.user) return;
    setLoadingOrders(true);
    setLoadingWishlist(true);
    fetch(`/api/orders?email=${encodeURIComponent(state.user.email)}`, {
      headers: {
        ...(state.user?.token ? { Authorization: `Bearer ${state.user.token}` } : {}),
      }
    })
      .then((res) => res.json())
      .then((data) => {
        // Normalize response: server may return { orders } or an array
        const ordersArray = Array.isArray(data) ? data : (data?.orders || []);
        if (state.user) {
          const filtered = ordersArray.filter((o: any) => (o.customer && o.customer.email) === state.user?.email || o.customerEmail === state.user?.email);
          setOrders(filtered);
        } else {
          setOrders([]);
        }
        setLoadingOrders(false);
      })
      .catch(() => setLoadingOrders(false));
    fetch(`/api/wishlist?email=${encodeURIComponent(state.user.email)}`)
      .then((res) => res.json())
      .then((data) => {
        setWishlist(data);
        setLoadingWishlist(false);
      })
      .catch(() => setLoadingWishlist(false));
  }, [state.user]);

  // Fetch data every time dialog is opened
  React.useEffect(() => {
    if (open) {
      fetchOrdersAndWishlist();
    }
  }, [open, fetchOrdersAndWishlist]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-blue-500 shadow-lg hover:scale-105 transition-transform">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 text-white text-lg font-bold border-4 border-white shadow-xl">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl min-w-[700px] p-0 bg-white rounded-2xl shadow-lg border overflow-hidden">
        <DialogHeader>
          <DialogDescription className="sr-only">User account menu and quick actions</DialogDescription>
        </DialogHeader>
        <div className="flex min-h-[520px]">
          {/* Sidebar Navigation */}
          <div className="w-56 bg-gray-50 border-r flex flex-col py-8 px-4 gap-2">
            <button onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium transition-colors ${activeTab === "dashboard" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"}`}
            >
              <User className="w-5 h-5" /> Dashboard
            </button>
            <button onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium transition-colors ${activeTab === "orders" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"}`}
            >
              <ShoppingBag className="w-5 h-5" /> Orders
            </button>
            <button onClick={() => setActiveTab("wishlist")}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium transition-colors ${activeTab === "wishlist" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"}`}
            >
              <Heart className="w-5 h-5" /> Wishlist
            </button>
            <button onClick={() => setActiveTab("reviews")}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium transition-colors ${activeTab === "reviews" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"}`}
            >
              <Star className="w-5 h-5" /> Reviews
            </button>
            <button onClick={() => setActiveTab("addresses")}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium transition-colors ${activeTab === "addresses" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"}`}
            >
              <Home className="w-5 h-5" /> Addresses
            </button>
            <button onClick={() => setActiveTab("support")}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium transition-colors ${activeTab === "support" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"}`}
            >
              <MessageCircle className="w-5 h-5" /> Support
            </button>
            <div className="flex-1" />
            <button onClick={logout}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors mt-8">
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
          {/* Main Content */}
          <div className="flex-1 p-10 overflow-y-auto">
            {activeTab === "dashboard" && (
              <div className="flex flex-col items-center">
                <Avatar className="h-28 w-28 mb-4">
                  <AvatarFallback className="bg-gray-200 text-gray-700 text-4xl font-bold">{initials}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{state.user.firstName} {state.user.lastName}</h2>
                <p className="text-gray-600 mb-2">{state.user.email}</p>
                <Badge variant={state.user.role === "admin" ? "default" : "secondary"} className="mb-2 px-4 py-2 rounded-full text-base">
                  {state.user.role === "admin" ? "Administrator" : "Customer"}
                </Badge>
                <div className="text-base text-gray-500 mb-4">
                  <div className="flex items-center justify-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Member since {new Date(state.user.createdAt).toLocaleDateString()}
                  </div>
                  {state.user.phone && (
                    <div className="flex items-center justify-center">
                      <Phone className="w-5 h-5 mr-2" />
                      {state.user.phone}
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <Link href="/cart">
                    <Button variant="outline">View Cart</Button>
                  </Link>
                </div>
              </div>
            )}
            {activeTab === "orders" && (
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center"><ShoppingBag className="w-5 h-5 mr-2" /> Order History</h3>
                {loadingOrders ? (
                  <div className="text-gray-400 text-center py-4">Loading...</div>
                ) : orders.length === 0 ? (
                  <div className="text-gray-400 text-center py-4">No orders found.</div>
                ) : (
                  <ul className="space-y-2">
                    {orders.map((order) => (
                      <li key={order._id || order.id} className="flex justify-between items-center border-b pb-2 cursor-pointer hover:bg-gray-50 rounded transition"
                        onClick={() => setSelectedOrder(order)}>
                        <div>
                          <span className="font-semibold">Order #{order._id?.toString() || order.id}</span>
                          <span className="ml-2 text-xs text-gray-500">{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ""}</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Badge className="capitalize">{order.status}</Badge>
                          <span className="font-semibold text-blue-600">₹{order.total}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {/* Order Details Modal */}
                {selectedOrder && (
                  <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Order Details - {selectedOrder._id?.toString() || selectedOrder.id}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Items</h4>
                          <ul className="space-y-1">
                            {selectedOrder.items?.map((item: any, idx: number) => (
                              <li key={idx} className="flex justify-between items-center">
                                <span>{item.name} x {item.quantity}</span>
                                <span className="font-semibold">₹{item.price * item.quantity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Shipping Address</h4>
                          <div className="bg-gray-50 p-3 rounded text-sm">{selectedOrder.shippingAddress}</div>
                        </div>
                        <div className="flex gap-4">
                          <Badge className="capitalize">{selectedOrder.status}</Badge>
                          <span className="font-semibold text-blue-600">₹{selectedOrder.total}</span>
                        </div>
                        {/* Review/Rating UI for each item */}
                        <div className="mt-6">
                          <h4 className="font-semibold mb-2">Rate & Review Your Items</h4>
                          <ul className="space-y-4">
                            {selectedOrder.items?.map((item: any, idx: number) => {
                              const key = `${selectedOrder.id || selectedOrder._id}_${item.id}`
                              const stateVal = reviewState[key] || { rating: 0, review: "", imageUrl: "", loading: false }
                              // Fetch review for this item (once)
                              React.useEffect(() => {
                                if (!state.user) return
                                if (reviewState[key] && (reviewState[key].rating || reviewState[key].review)) return
                                fetch(`/api/reviews?productId=${item.id}`)
                                  .then(res => res.json())
                                  .then((reviews) => {
                                    let myReview = null
                                    if (Array.isArray(reviews) && state.user) {
                                      myReview = reviews.find((r: any) => r.userId === state.user!.id && r.orderId === (selectedOrder.id || selectedOrder._id))
                                    }
                                    if (myReview) {
                                      setReviewState(prev => ({ ...prev, [key]: { rating: myReview.rating, review: myReview.review, imageUrl: myReview.imageUrl || "", loading: false } }))
                                    }
                                  })
                              }, [item.id, selectedOrder.id, state.user])
                              // Handlers
                              const handleRating = (star: number) => {
                                if (!state.user) return
                                setReviewState(prev => ({ ...prev, [key]: { ...stateVal, rating: star, loading: true } }))
                                fetch("/api/reviews", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    productId: item.id,
                                    userId: state.user.id,
                                    orderId: selectedOrder.id || selectedOrder._id,
                                    rating: star,
                                    review: stateVal.review,
                                    imageUrl: stateVal.imageUrl,
                                    userName: `${state.user.firstName || ""} ${state.user.lastName || ""}`
                                  })
                                }).then(() => {
                                  setReviewState(prev => ({ ...prev, [key]: { ...prev[key], rating: star, loading: false } }))
                                })
                              }
                              const handleReview = (e: React.FocusEvent<HTMLTextAreaElement>) => {
                                if (!state.user) return
                                const val = e.target.value
                                setReviewState(prev => ({ ...prev, [key]: { ...stateVal, review: val, loading: true } }))
                                fetch("/api/reviews", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    productId: item.id,
                                    userId: state.user.id,
                                    orderId: selectedOrder.id || selectedOrder._id,
                                    rating: stateVal.rating,
                                    review: val,
                                    imageUrl: stateVal.imageUrl,
                                    userName: `${state.user.firstName || ""} ${state.user.lastName || ""}`
                                  })
                                }).then(() => {
                                  setReviewState(prev => ({ ...prev, [key]: { ...prev[key], review: val, loading: false } }))
                                })
                              }
                              const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
                                if (!state.user) return
                                const file = e.target.files?.[0]
                                if (!file) return
                                // For demo: skip actual upload, just show preview
                                const url = URL.createObjectURL(file)
                                setReviewState(prev => ({ ...prev, [key]: { ...stateVal, imageUrl: url, loading: true } }))
                                // TODO: Upload to server/cloud and save URL in DB
                                fetch("/api/reviews", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    productId: item.id,
                                    userId: state.user.id,
                                    orderId: selectedOrder.id || selectedOrder._id,
                                    rating: stateVal.rating,
                                    review: stateVal.review,
                                    imageUrl: url,
                                    userName: `${state.user.firstName || ""} ${state.user.lastName || ""}`
                                  })
                                }).then(() => {
                                  setReviewState(prev => ({ ...prev, [key]: { ...prev[key], imageUrl: url, loading: false } }))
                                })
                              }
                              return (
                                <li key={idx} className="border rounded-lg p-3 bg-gray-50">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="font-medium">{item.name}</span>
                                    {/* Star rating UI */}
                                    <div className="flex gap-1">
                                      {[1,2,3,4,5].map((star) => (
                                        <button
                                          key={star}
                                          type="button"
                                          className={`text-yellow-400 ${stateVal.rating >= star ? "" : "opacity-30"}`}
                                          onClick={() => handleRating(star)}
                                          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                          disabled={stateVal.loading}
                                        >
                                          ★
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <textarea
                                    className="w-full border rounded p-2 mb-2"
                                    placeholder="Write your review..."
                                    rows={2}
                                    value={stateVal.review}
                                    onChange={e => setReviewState(prev => ({ ...prev, [key]: { ...stateVal, review: e.target.value } }))}
                                    onBlur={handleReview}
                                    disabled={stateVal.loading}
                                  />
                                  <div className="flex items-center gap-2 mb-2">
                                    <label className="text-sm text-gray-600">Upload image (optional):</label>
                                    <input type="file" accept="image/*" className="text-sm" onChange={handleImage} disabled={stateVal.loading} />
                                    {stateVal.imageUrl && (
                                      <img src={stateVal.imageUrl} alt="Review" className="h-10 w-10 rounded object-cover ml-2" />
                                    )}
                                  </div>
                                  {stateVal.loading && <div className="text-xs text-blue-500">Saving...</div>}
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            )}
            {activeTab === "wishlist" && (
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center"><Heart className="w-5 h-5 mr-2" /> Wishlist</h3>
                {loadingWishlist ? (
                  <div className="text-gray-400 text-center py-4">Loading...</div>
                ) : wishlist.length === 0 ? (
                  <div className="text-gray-400 text-center py-4">No items in wishlist.</div>
                ) : (
                  <ul className="space-y-2">
                    {wishlist.map((item: any, idx: number) => (
                      <li key={idx} className="flex justify-between items-center border-b pb-2">
                        <span>{item.name}</span>
                        <span className="font-semibold">₹{item.price}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {activeTab === "reviews" && (
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center"><Star className="w-5 h-5 mr-2" /> My Reviews</h3>
                <div className="text-gray-400 text-center py-4">Coming soon: Rate and review your purchased products!</div>
              </div>
            )}
            {activeTab === "addresses" && (
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center"><Home className="w-5 h-5 mr-2" /> My Addresses</h3>
                <div className="text-gray-400 text-center py-4">Coming soon: Manage your shipping addresses!</div>
              </div>
            )}
            {activeTab === "support" && (
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center"><MessageCircle className="w-5 h-5 mr-2" /> Feedback & Support</h3>
                <form className="space-y-4 max-w-md mx-auto">
                  <div>
                    <label className="block mb-1 font-medium">Your Message</label>
                    <textarea className="w-full border rounded p-2 min-h-[80px]" placeholder="Type your feedback, question, or issue..." />
                  </div>
                  <Button type="submit" className="w-full">Send</Button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-500">
                  For urgent support, email <a href="mailto:support@kiransales.com" className="text-blue-600 underline">support@kiransales.com</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
