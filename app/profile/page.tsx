"use client"

import React, { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Truck, Star, MapPin, LifeBuoy } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft, User, Phone, Calendar, Save, Heart } from "lucide-react"
import Link from "next/link"
import WishlistTab from '@/components/profile/wishlist-tab'
import { formatRupee } from '@/lib/format'

function ProfilePage() {
  const [sidebarTab, setSidebarTab] = useState('orders')
  const { state, logout } = useAuth()
  const { toast } = useToast()
  const { state: cartState, dispatch: cartDispatch } = useCart()
  const [isEditing, setIsEditing] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: state.user?.firstName || "",
    lastName: state.user?.lastName || "",
    phone: state.user?.phone || "",
    email: state.user?.email || "",
    address: state.user?.address || "",
    _id: state.user?._id || ""
  })
  
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [ordersPage, setOrdersPage] = useState(1)
  const [ordersHasMore, setOrdersHasMore] = useState(true)

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");

  // Define missing state variables and add explicit types
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Sync formData with user state when user changes
  React.useEffect(() => {
    if (state.user) {
      setFormData({
        firstName: state.user.firstName || "",
        lastName: state.user.lastName || "",
        phone: state.user.phone || "",
        email: state.user.email || "",
        address: state.user.address || "",
        _id: state.user._id || ""
      })
    }
  }, [state.user])

  React.useEffect(() => {
    if (!state.user) return;
    setLoadingOrders(true);
    fetch(`/api/orders?email=${encodeURIComponent(state.user.email)}&limit=5&page=${ordersPage}`)
      .then((res) => res.json())
      .then((data) => {
        // Normalize orders to a predictable shape: ensure _id is a string, items is an array and totals are present
        const raw = data.orders || data || [];
        const normalized = (raw || []).map((o: any) => ({
          ...o,
          _id: o._id?.toString?.() || o._id || o.id || "",
          id: o.id || o._id?.toString?.() || "",
          orderDate: o.orderDate || o.createdAt || null,
          total: o.total ?? o.totalAmount ?? 0,
          totalAmount: o.totalAmount ?? o.total ?? 0,
          items: Array.isArray(o.items) ? o.items : (o.lineItems || []),
        }));

        if (ordersPage === 1) {
          setOrders(normalized);
        } else {
          setOrders((prev) => [...prev, ...normalized]);
        }

        const returnedCount = (data.orders && data.orders.length) || (Array.isArray(data) && data.length) || normalized.length;
        setOrdersHasMore(data.hasMore !== false && returnedCount === 5);
        setLoadingOrders(false);
      })
      .catch(() => setLoadingOrders(false));
  }, [state.user, ordersPage]);

  // Ensure all required fields are included and optional fields have default values
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItem || !selectedOrder) {
      console.error("No item or order selected for review.");
      return;
    }

    const reviewData: any = {
      productId: selectedItem.productId || selectedItem.id,
      orderId: selectedOrder._id || selectedOrder.id,
      userId: state.user ? state.user._id : "", // Default to empty string if user is not available
      review: reviewText || "", // Default to empty string if reviewText is not provided
      rating: 5, // Assuming a default rating of 5 for now; you can add a rating input later
      imageUrl: selectedItem.image || "", // Default to empty string if image is not provided
      userName: state.user ? `${state.user.firstName} ${state.user.lastName}` : "", // Default to empty string if userName is not available
      createdAt: new Date().toISOString(),
    };

    console.log("[handleSubmitReview] Review data being sent:", reviewData);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        throw new Error(`Failed to save review: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("[handleSubmitReview] Review saved successfully:", result);

      // Reset the review dialog state
      setReviewText("");
      setIsReviewDialogOpen(false);
    } catch (error) {
      console.error("[handleSubmitReview] Error saving review:", error);
    }
  };

  if (!state.user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h1>
              <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
              <Link href="/">
                <Button>Go to Homepage</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    try {
      // Save user profile
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const initials = `${state.user.firstName[0]}${state.user.lastName[0]}`.toUpperCase()
  
  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-900 hover:text-gray-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2 text-gray-900" />
            Back to Homepage
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        </div>
        
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 min-h-[600px] bg-white rounded-xl shadow flex flex-col py-8 px-4 border">
            <div className="flex flex-col items-center mb-8">
              <Avatar className="h-20 w-20 mb-3 ring-2 ring-gray-900">
                <AvatarFallback className="bg-gray-900 text-white text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{state.user.firstName} {state.user.lastName}</h2>
              <p className="text-gray-600 text-sm mb-2">{state.user.email}</p>
              <Badge variant={state.user.role === "admin" ? "default" : "secondary"}>
                {state.user.role === "admin" ? "Administrator" : "Customer"}
              </Badge>
            </div>
            <nav className="flex flex-col gap-2">
              <button onClick={() => setSidebarTab('orders')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-left transition-all ${sidebarTab === 'orders' ? 'bg-gray-100 text-gray-900 font-bold' : 'hover:bg-gray-100 text-gray-700'}`}>
                <Truck className="w-4 h-4 text-gray-900" /> Orders
              </button>
              <button onClick={() => setSidebarTab('wishlist')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-left transition-all ${sidebarTab === 'wishlist' ? 'bg-gray-100 text-gray-900 font-bold' : 'hover:bg-gray-100 text-gray-700'}`}>
                <Heart className="w-4 h-4 text-gray-900" /> Wishlist
              </button>
              <button onClick={() => setSidebarTab('reviews')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-left transition-all ${sidebarTab === 'reviews' ? 'bg-gray-100 text-gray-900 font-bold' : 'hover:bg-gray-100 text-gray-700'}`}>
                <Star className="w-4 h-4 text-gray-900" /> Reviews
              </button>
              <button onClick={() => setSidebarTab('support')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-left transition-all ${sidebarTab === 'support' ? 'bg-gray-100 text-gray-900 font-bold' : 'hover:bg-gray-100 text-gray-700'}`}>
                <LifeBuoy className="w-4 h-4 text-gray-900" /> Support
              </button>
              <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-lg text-left text-red-600 hover:bg-red-50 mt-4">
                <User className="w-4 h-4" /> Log out
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            {/* Edit Profile Button */}
            <div className="flex justify-end mb-4">
              <Button 
                variant={isEditing ? "outline" : "default"} 
                className={isEditing ? "" : "bg-gray-900 hover:bg-gray-800 text-white"} 
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>

            {/* Edit Profile Form */}
            {isEditing && (
              <div className="bg-white rounded-lg shadow p-6 mb-6 max-w-xl">
                <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
                </div>
                <div className="mb-4">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="bg-gray-900 hover:bg-gray-800 text-white">
                    <Save className="w-4 h-4 mr-2 text-white" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {sidebarTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order History</h2>
                <p className="text-gray-600 mb-4">Your recent orders and details</p>
                {loadingOrders ? (
                  <div className="text-center text-gray-500 py-8">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">No orders found.</div>
                ) : (
                  <>
                    {orders.map((order) => {
                      const orderId = order._id?.toString() || order.id || "";
                      const status = order.status || order.deliveryStatus || "pending";
                      const total = order.total || order.totalAmount || 0;
                      return (
                        <Card key={orderId} className="mb-4 w-full max-w-3xl">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="font-semibold text-gray-900">Order #{orderId.slice(-8)}</h3>
                                <p className="text-sm text-gray-600">{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ""}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="capitalize">{status}</Badge>
                                <span className="font-semibold text-gray-900">{formatRupee(total)}</span>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="border-gray-900 text-gray-900">
                                      View
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Order Details - #{orderId.slice(-8)}</DialogTitle>
                                      <DialogDescription>Complete order information</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-6">
                                      <div>
                                        <h4 className="font-semibold mb-2">Order Items</h4>
                                        <div className="space-y-2">
                                          {order.items && order.items.length > 0 ? (
                                            order.items.map((item: any, index: number) => (
                                              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                  <p className="font-medium">{item.name || "Unnamed Product"}</p>
                                                  <p className="text-sm text-gray-600">Size: {item.size || "Size Unavailable"}</p>
                                                  <p className="text-sm text-gray-600">Color: {item.color || "Color Unavailable"}</p>
                                                  <p className="text-sm text-gray-600">Quantity: {item.quantity || 1}</p>
                                                  <p className="text-sm text-gray-600">Price: {formatRupee(item.price || 0)}</p>
                                                </div>
                                                <span className="font-semibold">{formatRupee((item.price ?? 0) * (item.quantity ?? 1))}</span>
                                              </div>
                                            ))
                                          ) : (
                                            <p className="text-gray-500">No items found for this order.</p>
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold mb-2">Shipping Address</h4>
                                        <p className="bg-gray-50 p-4 rounded-lg">{order.shippingAddress || "Address Unavailable"}</p>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div>
                                          <p><strong>Order Date:</strong> {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "Date Unavailable"}</p>
                                          <p><strong>Payment:</strong> {order.paymentMethod || "Payment Method Unavailable"}</p>
                                        </div>
                                        <div>
                                          <p><strong>Status:</strong> {status}</p>
                                          <p><strong>Total:</strong> {formatRupee(total)}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    {ordersHasMore && (
                      <div className="flex justify-center mt-2">
                        <Button size="sm" variant="outline" onClick={() => setOrdersPage((p) => p + 1)}>
                          Load More
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {sidebarTab === 'wishlist' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Wishlist</h2>
                <WishlistTab email={state.user.email} />
              </div>
            )}

            {/* Implement order list view with expandable items for review */}
            {sidebarTab === 'reviews' && (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Reviews</h2>
                {loadingOrders ? (
                  <div className="text-gray-500 text-center py-8">Loading delivered orders...</div>
                ) : (
                  (() => {
                    const delivered = orders.filter(order => {
                      const isDelivered = order.status === 'delivered' || order.deliveryStatus === 'delivered';
                      const hasItems = Array.isArray(order.items) && order.items.length > 0;
                      return isDelivered && hasItems;
                    });

                    if (delivered.length === 0) {
                      return <div className="text-gray-500 text-center py-8">No delivered orders to review yet.</div>;
                    }

                    return (
                      <div className="space-y-6">
                        {delivered.map((order: any) => {
                          const orderId = order._id?.toString() || order.id || "";
                          return (
                            <div key={orderId} className="bg-gradient-to-r from-gray-50 to-white rounded-lg shadow-lg p-6 border border-gray-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">Order #{orderId.slice(-8)}</h3>
                                  <p className="text-sm text-gray-600">Total Amount: {formatRupee(order.totalAmount || order.total || 0)}</p>
                                  <p className="text-sm text-gray-600">Order Date: {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "Date Unavailable"}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-900 text-gray-900 hover:bg-gray-100"
                                  onClick={() => setExpandedOrderId(expandedOrderId === orderId ? null : orderId)}
                                >
                                  {expandedOrderId === orderId ? "Hide Items" : "Show Items"}
                                </Button>
                              </div>

                              {expandedOrderId === orderId && (
                                <div className="mt-4 space-y-4">
                                  {order.items.map((item: any, idx: number) => (
                                    <div key={item.productId || item.id || idx} className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md border border-gray-200">
                                      <img
                                        src={typeof item.image === 'string' && item.image.trim() ? item.image : '/placeholder.jpg'}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                          const target = e.target as HTMLImageElement;
                                          if (!target.src.endsWith('/placeholder.jpg')) {
                                            target.src = '/placeholder.jpg';
                                          }
                                        }}
                                      />
                                      <div>
                                        <p className="font-medium text-gray-900">{item.name}</p>
                                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                        <p className="text-sm text-gray-600">Price: {formatRupee(item.price)}</p>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-gray-900 text-gray-900 hover:bg-gray-100"
                                        onClick={() => {
                                          setSelectedItem(item);
                                          setSelectedOrder(order);
                                          setIsReviewDialogOpen(true);
                                        }}
                                      >
                                        Review
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {isReviewDialogOpen && selectedItem && (
                          <Dialog open={isReviewDialogOpen} onOpenChange={(isOpen) => setIsReviewDialogOpen(isOpen)}>
                            <DialogContent className="max-w-lg bg-gradient-to-r from-gray-50 to-white rounded-lg shadow-lg">
                              <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-gray-900">Review Product</DialogTitle>
                                <DialogDescription className="text-gray-600">Share your experience for this product.</DialogDescription>
                              </DialogHeader>
                              <div className="flex gap-4 items-center mb-4">
                                {selectedItem.image && (
                                  <img src={selectedItem.image} alt={selectedItem.name} className="w-24 h-24 object-cover rounded-lg border border-gray-300" />
                                )}
                                <div>
                                  <div className="font-semibold text-gray-900 text-lg">{selectedItem.name}</div>
                                  <div className="text-sm text-gray-600">Qty: {selectedItem.quantity}</div>
                                  <div className="text-sm text-gray-600">Price: ₹{formatRupee(selectedItem.price)}</div>
                                </div>
                              </div>
                              <form onSubmit={handleSubmitReview} className="flex flex-col gap-2">
                                <textarea
                                  className="border rounded px-3 py-2 focus:ring-2 focus:ring-gray-500"
                                  value={reviewText}
                                  onChange={e => setReviewText(e.target.value)}
                                  placeholder="Write your review..."
                                  rows={3}
                                  required
                                />
                                <div className="flex gap-2 mt-2">
                                  <Button type="submit" size="sm" className="bg-gray-900 text-white hover:bg-gray-800">
                                    Submit Review
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-gray-900 text-gray-900 hover:bg-gray-100" onClick={() => setIsReviewDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>
            )}

            {sidebarTab === 'support' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Support</h2>
                <p className="text-gray-600 mb-4">Type a feedback or support request below. Our team will review it and respond as soon as possible.</p>
                <FeedbackForm userEmail={state.user.email} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

// Feedback form for support tab
function FeedbackForm({ userEmail }: { userEmail: string }) {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [type, setType] = useState("general");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, message, type })
      });
      if (res.ok) {
        setSuccess(true);
        setMessage("");
        toast({ title: "Feedback sent!", description: "Thank you for your feedback." });
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.error || "Failed to send feedback.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to send feedback.", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white rounded-lg shadow p-6 flex flex-col gap-4">
      <label className="font-medium text-gray-700">Type</label>
      <select value={type} onChange={e => setType(e.target.value)} className="border rounded px-3 py-2">
        <option value="general">General</option>
        <option value="bug">Bug Report</option>
        <option value="feature">Feature Request</option>
        <option value="other">Other</option>
      </select>
      <label className="font-medium text-gray-700">Your Feedback</label>
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        rows={4}
        className="border rounded px-3 py-2 resize-none"
        placeholder="Type your feedback or support request here..."
        required
      />
      <button
        type="submit"
        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-60"
        disabled={loading || !message.trim()}
      >
        {loading ? "Sending..." : "Send Feedback"}
      </button>
      {success && <div className="text-green-600 text-sm mt-2">Feedback sent successfully!</div>}
    </form>
  );
}

function ProductReviewDialog({ product, orderId, userId, userName }: { product: any, orderId: string, userId: string, userName: string }) {
  const [open, setOpen] = useState(false);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState<any>(null);

  React.useEffect(() => {
    if (!open) return;
    fetch(`/api/reviews?productId=${product.productId || product.id}&orderId=${orderId}&userId=${userId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.length > 0) {
          setExisting(data[0]);
          setReview(data[0].review);
        } else {
          setExisting(null);
          setReview("");
        }
      });
  }, [open, product, orderId, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/reviews', {
      method: existing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.productId || product.id,
        orderId,
        userId,
        userName,
        review
      })
    });
    setLoading(false);
    if (res.ok) setSubmitted(true);
    setExisting({ review });
    setTimeout(() => setOpen(false), 1200);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="border-gray-900 text-gray-900">
          {existing ? "View Review" : "Review"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Review Product</DialogTitle>
          <DialogDescription>Share your experience for this product.</DialogDescription>
        </DialogHeader>
        <div className="flex gap-4 items-center mb-4">
          {product.image && (
            <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded-lg border" />
          )}
          <div>
            <div className="font-semibold text-gray-900 text-lg">{product.name}</div>
            <div className="text-sm text-gray-600">Qty: {product.quantity}</div>
            <div className="text-sm text-gray-600">Price: {formatRupee(product.price)}</div>
            {product.description && <div className="text-xs text-gray-500 mt-1">{product.description}</div>}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            className="border rounded px-3 py-2"
            value={review}
            onChange={e => setReview(e.target.value)}
            placeholder="Write your review..."
            rows={3}
            disabled={!!existing}
            required
          />
          <div className="flex gap-2 mt-2">
            <Button type="submit" size="sm" className="bg-gray-900 text-white" disabled={loading || !!existing}>
              {existing ? "Review Submitted" : loading ? "Submitting..." : "Submit Review"}
            </Button>
            {submitted && !existing && <span className="text-green-600 text-xs mt-2">Thank you for your review!</span>}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}