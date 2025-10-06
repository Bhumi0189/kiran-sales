"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Filter, Eye, Package, Clock, CheckCircle2, XCircle, Truck, MapPin } from "lucide-react"
import { formatRupee } from '@/lib/format';

interface OrderItem {
  productId?: string
  name: string
  quantity: number
  price: number
}

interface Order {
  _id?: string
  id?: string
  orderId?: string
  customer?: {
    name: string
    email: string
    phone: string
  }
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  status?: string
  deliveryStatus?: string
  paymentStatus?: string
  paymentMethod?: string
  total?: number
  totalAmount?: number
  orderDate?: string
  items?: OrderItem[]
  shippingAddress?: string
}

interface Review {
  productId: string
  userId: string
  userName?: string
  rating?: number
  review: string
}

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")
  const [filterPayment, setFilterPayment] = useState("all")
  const [filterDelivery, setFilterDelivery] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const statuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "out for delivery",
    "delivered",
    "cancelled",
    "drop"
  ]

  const getOrderId = (order: Order) => {
    return order._id || order.id || order.orderId || ""
  }

  React.useEffect(() => {
    let isMounted = true
    let interval: NodeJS.Timeout

    const fetchOrders = async (isInitial = false) => {
      try {
        if (!isMounted) return
        if (isInitial) setLoading(true)
        
        const res = await fetch("/api/orders", {
          headers: {
            authorization: "Bearer admin-token",
          },
        })
        if (!res.ok) throw new Error("Failed to fetch orders")
        const data = await res.json()
        if (isMounted) {
          setOrders(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
        if (isMounted) setOrders([])
      } finally {
        if (isInitial && isMounted) setLoading(false)
      }
    }

    fetchOrders(true)
    interval = setInterval(() => fetchOrders(false), 5000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  const filteredOrders = orders.filter((order) => {
    const orderId = getOrderId(order)
    const customerName = order.customer?.name || order.customerName || ""
    const matchesSearch =
      orderId.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus
    const matchesPayment = filterPayment === "all" || (order.paymentStatus || order.paymentMethod) === filterPayment
    const matchesDelivery = filterDelivery === "all" || order.deliveryStatus === filterDelivery
    return matchesSearch && matchesStatus && matchesPayment && matchesDelivery
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "shipped":
      case "out for delivery":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "confirmed":
        return "bg-cyan-100 text-cyan-800 border-cyan-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      case "drop":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle2 className="w-4 h-4" />
      case "processing":
        return <Clock className="w-4 h-4" />
      case "shipped":
      case "out for delivery":
        return <Truck className="w-4 h-4" />
      case "pending":
      case "confirmed":
        return <Package className="w-4 h-4" />
      case "cancelled":
      case "drop":
        return <XCircle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          "authorization": "Bearer admin-token" 
        },
        body: JSON.stringify({ 
          _id: orderId, 
          status: newStatus, 
          deliveryStatus: newStatus 
        }),
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update order status")
      }
      
      setOrders(orders.map((o) => {
        const currentId = getOrderId(o)
        return currentId === orderId 
          ? { ...o, status: newStatus, deliveryStatus: newStatus } 
          : o
      }))
      
      if (selectedOrder && getOrderId(selectedOrder) === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus, deliveryStatus: newStatus })
      }
    } catch (error) {
      console.error("Failed to update order status:", error)
      alert(error instanceof Error ? error.message : "Failed to update order status")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 font-medium">Loading orders...</p>
        </div>
      </div>
    )
  }

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === "date-desc") {
      const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0
      const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0
      return dateB - dateA
    }
    if (sortBy === "date-asc") {
      const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0
      const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0
      return dateA - dateB
    }
    if (sortBy === "amount-desc") return (b.totalAmount || b.total || 0) - (a.totalAmount || a.total || 0)
    if (sortBy === "amount-asc") return (a.totalAmount || a.total || 0) - (b.totalAmount || b.total || 0)
    return 0
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing" || o.status === "confirmed").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled" || o.status === "drop").length,
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Orders Management</h2>
          <p className="text-gray-600 mt-1">Track and manage all customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
            <span className="text-sm text-gray-600">Total Orders</span>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-gray-900">{stats.processing}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by order ID or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-11">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status: string) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPayment} onValueChange={setFilterPayment}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="cod">COD</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDelivery} onValueChange={setFilterDelivery}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Delivery" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Delivery</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="amount-desc">Highest Amount</SelectItem>
                <SelectItem value="amount-asc">Lowest Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {sortedOrders.map((order) => {
          const orderId = getOrderId(order)
          const customerName = order.customer?.name || order.customerName || ""
          const customerEmail = order.customer?.email || order.customerEmail || ""
          const customerPhone = order.customer?.phone || order.customerPhone || ""
          const status = order.status || order.deliveryStatus || "pending"
          const total = order.total || order.totalAmount || 0
          const orderDate = order.orderDate ? new Date(order.orderDate) : null
          const isDelivered = status === "delivered"
          
          return (
            <Card key={orderId} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">#{orderId}</h3>
                          <Badge className={`${getStatusColor(status)} border flex items-center gap-1`}>
                            {getStatusIcon(status)}
                            {status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">Customer:</span>
                            <span className="text-gray-900">{customerName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">Email:</span>
                            <span className="text-gray-600">{customerEmail}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">Phone:</span>
                            <span className="text-gray-600">{customerPhone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">Date:</span>
                            <span className="text-gray-600">{orderDate ? orderDate.toLocaleDateString() : "-"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-gray-900">₹{formatRupee(total)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2" onClick={() => setSelectedOrder(order)}>
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">Order Details - #{orderId}</DialogTitle>
                          <DialogDescription>Complete order information</DialogDescription>
                        </DialogHeader>
                        {selectedOrder && getOrderId(selectedOrder) === orderId && (
                          <div className="space-y-6">
                            <div>
                              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                Customer Information
                              </h4>
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg space-y-2 border border-blue-100">
                                <p className="flex justify-between">
                                  <strong className="text-gray-700">Name:</strong> 
                                  <span className="text-gray-900">{selectedOrder.customer?.name || selectedOrder.customerName || ""}</span>
                                </p>
                                <p className="flex justify-between">
                                  <strong className="text-gray-700">Email:</strong> 
                                  <span className="text-gray-900">{selectedOrder.customer?.email || selectedOrder.customerEmail || ""}</span>
                                </p>
                                <p className="flex justify-between">
                                  <strong className="text-gray-700">Phone:</strong> 
                                  <span className="text-gray-900">{selectedOrder.customer?.phone || selectedOrder.customerPhone || ""}</span>
                                </p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <Package className="w-5 h-5 text-blue-600" />
                                Order Items
                              </h4>
                              <div className="space-y-3">
                                {selectedOrder.items?.map((item: OrderItem, index: number) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                                  >
                                    <div>
                                      <p className="font-semibold text-gray-900">{item.name}</p>
                                      <p className="text-sm text-gray-600">
                                        Quantity: <span className="font-medium">{item.quantity}</span> × ₹{formatRupee(item.price)}
                                      </p>
                                    </div>
                                    <span className="font-bold text-lg text-gray-900">
                                      ₹{formatRupee(item.price * item.quantity)}
                                    </span>
                                  </div>
                                ))}
                                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border-2 border-blue-300">
                                  <span className="font-bold text-lg text-gray-900">Total Amount</span>
                                  <span className="font-bold text-2xl text-blue-900">
                                    ₹{formatRupee(selectedOrder.total || selectedOrder.totalAmount || 0)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {selectedOrder.shippingAddress && (
                              <div>
                                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                  <Truck className="w-5 h-5 text-blue-600" />
                                  Shipping Address
                                </h4>
                                <p className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border border-green-200 text-gray-800">
                                  {selectedOrder.shippingAddress}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                          <Package className="w-4 h-4" />
                          Update Status
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-xl">Update Order Status</DialogTitle>
                          <DialogDescription>Change the status for order #{orderId}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 py-4">
                          <div className="bg-gray-50 p-3 rounded-lg mb-4">
                            <p className="text-sm text-gray-600">Current Status</p>
                            <Badge className={`${getStatusColor(status)} border mt-1`}>
                              {status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Select New Status:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {statuses.map((statusOption) => (
                              <Button
                                key={statusOption}
                                variant={status === statusOption ? "default" : "outline"}
                                size="sm"
                                className={`h-auto py-3 ${
                                  statusOption === "drop" 
                                    ? "bg-orange-500 text-white hover:bg-orange-600" 
                                    : statusOption === "cancelled"
                                    ? "hover:bg-red-50"
                                    : "hover:bg-blue-50"
                                }`}
                                onClick={() => updateOrderStatus(orderId, statusOption)}
                              >
                                <span className="flex items-center gap-2">
                                  {getStatusIcon(statusOption)}
                                  {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                                </span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {isDelivered && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="gap-2 border-green-300 text-green-700 hover:bg-green-50">
                            <CheckCircle2 className="w-4 h-4" />
                            Reviews
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-xl">Customer Reviews - #{orderId}</DialogTitle>
                            <DialogDescription>Product reviews for this order</DialogDescription>
                          </DialogHeader>
                          <OrderReviews order={order} />
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {sortedOrders.length === 0 && (
          <Card className="shadow-md">
            <CardContent className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-500 font-medium">No orders found matching your criteria</p>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function OrderReviews({ order }: { order: Order }) {
  const [reviews, setReviews] = React.useState<Review[]>([])
  const [loading, setLoading] = React.useState(true)
  
  React.useEffect(() => {
    async function fetchReviews() {
      if (!order.items) {
        setLoading(false)
        return
      }
      const productIds = order.items.map((item) => item.productId).filter(Boolean)
      if (productIds.length === 0) {
        setLoading(false)
        return
      }
      try {
        const orderId = order._id || order.id || order.orderId
        const res = await fetch(`/api/reviews?orderId=${orderId}`)
        if (res.ok) {
          const data = await res.json()
          setReviews(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [order])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  if (!order.items) return null

  return (
    <div className="space-y-4">
      {order.items.map((item: OrderItem, idx: number) => {
        const productReviews = reviews.filter((r) => r.productId === item.productId)
        return (
          <div key={item.productId || idx} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-gray-900">{item.name}</div>
              <Badge variant="outline" className="text-xs">
                {productReviews.length} {productReviews.length === 1 ? 'Review' : 'Reviews'}
              </Badge>
            </div>
            {productReviews.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-sm">No reviews yet for this product</p>
              </div>
            ) : (
              <div className="space-y-3">
                {productReviews.map((r, reviewIdx) => (
                  <div key={reviewIdx} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{r.userName || r.userId}</span>
                      {r.rating && (
                        <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                          <span className="text-yellow-600 text-lg">★</span>
                          <span className="font-bold text-gray-900">{r.rating}/5</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{r.review}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}