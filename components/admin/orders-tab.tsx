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
import { Search, Filter, Eye, Package, Clock, CheckCircle2, XCircle, Truck, MapPin, User, Mail, Phone } from "lucide-react"

interface OrderItem {
  productId?: string
  name: string
  quantity: number
  price: number
  size?: string
  color?: string
}

interface Order {
  _id?: string
  id?: string
  orderId?: string
  customer?: {
    name?: string
    email?: string
    phone?: string
    firstName?: string
    lastName?: string
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
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
    let isMounted = true;
    let interval: NodeJS.Timeout;

    const fetchOrders = async (isInitial = false) => {
      try {
        if (!isMounted) return;
        if (isDialogOpen) return;
        if (isInitial) setLoading(true);

        const res = await fetch("/api/orders", {
          headers: {
            authorization: "Bearer admin-token",
          },
        });
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();

        // API returns either an array (legacy) or an object { orders, hasMore }
        const ordersArray: Order[] = Array.isArray(data) ? data : (data?.orders || []);

        if (isMounted) {
          setOrders(ordersArray);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        if (isMounted) setOrders([]);
      } finally {
        if (isInitial && isMounted) setLoading(false);
      }
    };

    fetchOrders(true);
    interval = setInterval(() => fetchOrders(false), 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isDialogOpen])

  const filteredOrders = orders.filter((order) => {
    const orderId = getOrderId(order);
    const customerName = order.customer?.name || order.customerName || "";
    const matchesSearch =
      orderId.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase());
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
        {sortedOrders.map((order) => (
          <Card key={getOrderId(order)} className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-gray-900">
                      Order #{getOrderId(order).slice(-8)}
                    </h3>
                    <Badge className={`${getStatusColor(order.status || "pending")} flex items-center gap-1`}>
                      {getStatusIcon(order.status || "pending")}
                      {(order.status || "pending").charAt(0).toUpperCase() + (order.status || "pending").slice(1)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Customer</p>
                      <p className="font-medium text-gray-900">
                        {order.customer?.firstName && order.customer?.lastName
                          ? `${order.customer.firstName} ${order.customer.lastName}`
                          : order.customer?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-medium text-gray-900">
                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-bold text-gray-900">
                        ₹{(order.totalAmount || order.total || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Payment</p>
                      <p className="font-medium text-gray-900">
                        {order.paymentMethod || order.paymentStatus || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                <Dialog open={isDialogOpen && selectedOrder === order} onOpenChange={(open) => {
                  if (!open) {
                    setIsDialogOpen(false);
                    setSelectedOrder(null);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsDialogOpen(true);
                      }}
                      className="ml-4"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    className="max-w-4xl max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DialogHeader>
                      <DialogTitle className="text-2xl">Order Details #{getOrderId(order).slice(-8)}</DialogTitle>
                      <DialogDescription>
                        Complete information about this order
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* Customer Information */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Customer Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">
                              {order.customer?.firstName && order.customer?.lastName
                                ? `${order.customer.firstName} ${order.customer.lastName}`
                                : order.customer?.name || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{order.customer?.email || order.customerEmail || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{order.customer?.phone || order.customerPhone || "N/A"}</span>
                          </div>
                          {order.shippingAddress && (
                            <div className="flex items-start gap-2 md:col-span-2">
                              <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                              <span className="text-gray-600">Address:</span>
                              <span className="font-medium flex-1">{order.shippingAddress}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="font-bold text-lg mb-3">Order Items</h4>
                        <div className="space-y-2">
                          {order.items?.map((item, index) => (
                            <div key={index} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">{item.name || "Unnamed Product"}</p>
                                  <div className="flex gap-4 mt-1 text-sm text-gray-600">
                                    <span>Size: {item.size || "N/A"}</span>
                                    <span>Color: {item.color || "N/A"}</span>
                                    <span>Quantity: {item.quantity || 0}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900">₹{(item.price || 0).toLocaleString()}</p>
                                  <p className="text-sm text-gray-500">per item</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Reviews Section */}
                      <div>
                        <h4 className="font-bold text-lg mb-3">Product Reviews</h4>
                        <OrderReviews order={order} />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {/* Update Order Status Section */}
              <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg mt-4">
                <h4 className="font-bold text-sm text-blue-800">Update Status</h4>
                <div className="flex items-center gap-2">
                  <Select
                    value={order.status || "pending"}
                    onValueChange={(newStatus) => setSelectedOrder({ ...order, status: newStatus })}
                  >
                    <SelectTrigger className="h-8 w-32 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateOrderStatus(getOrderId(order), selectedOrder?.status || "pending")}
                  >
                    Update
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

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
  const [reviews, setReviews] = React.useState<Record<string, Review[]>>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchReviews() {
      if (!order.items) {
        console.log("No items in the order.", order);
        setLoading(false);
        return;
      }

      // Resolve product IDs from multiple possible fields an item may have
      const resolved = order.items.map((item) => {
        const possible = [
          item.productId,
          (item as any).productId,
          (item as any).id,
          (item as any)._id,
          (item as any).product && (item as any).product._id,
          (item as any).product && (item as any).product.id,
        ]
          .filter(Boolean)
          .map((v) => String(v));

        const resolvedId = possible.length > 0 ? possible[0] : undefined;
        if (!resolvedId) console.warn("Could not resolve product id for item:", item);
        return { item, resolvedId, allPossible: possible };
      });

      const productIds = Array.from(new Set(resolved.map((r) => r.resolvedId).filter(Boolean) as string[]));

      if (productIds.length === 0) {
        console.log("No valid product IDs found in the order items.", order.items);
        setLoading(false);
        return;
      }

      try {
        // Determine customer identity from the order (name and id if available)
        const customerName = order.customer?.firstName && order.customer?.lastName
          ? `${order.customer.firstName} ${order.customer.lastName}`
          : order.customer?.name || order.customerName || "";

        // Try common places for customer id on the order object
        const customerId = (order as any).userId || (order.customer as any)?._id || (order as any).customerId || "";
        const orderId = (order as any)._id || (order as any).id || (order as any).orderId || "";

        // Prefer fetching reviews that are explicitly tied to this order. Using orderId is
        // more reliable than matching by name and works even when a userId isn't present
        // on the order object. If both orderId and userId are present we still fetch by
        // orderId (it's sufficient) and can use userId for additional verification if needed.
        let userReviews: Review[] = [];

        if (orderId) {
          try {
            const ur = await fetch(`/api/reviews?orderId=${encodeURIComponent(orderId)}`);
            if (ur.ok) {
              userReviews = await ur.json();
              console.log("Fetched order-scoped reviews for this order:", userReviews);
            } else {
              console.warn("Order-scoped reviews fetch failed:", ur.statusText);
            }
          } catch (err) {
            console.warn("Error fetching order-scoped reviews:", err);
          }
        } else if (customerId) {
          // Fallback: if orderId is missing but customerId exists, try fetching reviews by user+maybe product
          try {
            const ur = await fetch(`/api/reviews?userId=${encodeURIComponent(customerId)}`);
            if (ur.ok) {
              userReviews = await ur.json();
              console.log("Fetched user-scoped reviews (no orderId) for this customer:", userReviews);
            } else {
              console.warn("User-scoped reviews fetch failed:", ur.statusText);
            }
          } catch (err) {
            console.warn("Error fetching user-scoped reviews:", err);
          }
        }

        const reviewsMap: Record<string, Review[]> = {};

        // Map user-specific reviews to product ids. For products without a review by this customer,
        // we set an empty array. We optionally fetch product-level total counts (other customers) only
        // when we need to display that information.
        const productIdsToCheck: string[] = [];
        resolved.forEach(({ resolvedId }) => {
          const pid = resolvedId || "";
          reviewsMap[pid] = [];
          (reviewsMap as any)[`${pid}__totalCount`] = 0;
          if (pid) productIdsToCheck.push(pid);
        });

        if (userReviews && userReviews.length > 0) {
          userReviews.forEach((r) => {
            const pid = String(r.productId || "");
            if (!reviewsMap[pid]) reviewsMap[pid] = [];
            reviewsMap[pid].push(r);
          });
        }

        // For display nicety: fetch product-level counts for any product where we want to inform how many
        // other reviews exist. This is optional and kept lightweight (one request per product). Orders typically
        // have a small number of items so this is acceptable.
        await Promise.all(productIdsToCheck.map(async (pid) => {
          try {
            const pr = await fetch(`/api/reviews?productId=${encodeURIComponent(pid)}`);
            if (pr.ok) {
              const all = await pr.json();
              ;(reviewsMap as any)[`${pid}__totalCount`] = Array.isArray(all) ? all.length : 0;
            } else {
              ;(reviewsMap as any)[`${pid}__totalCount`] = 0;
            }
          } catch (err) {
            ;(reviewsMap as any)[`${pid}__totalCount`] = 0;
          }
        }));

        console.log("Final reviewsMap (order-scoped):", reviewsMap);
        setReviews(reviewsMap);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [order]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {order.items?.map((item, idx) => {
        // Resolve item product id same as fetch logic so it matches reviewsMap keys
        const possible = [
          item.productId,
          (item as any).productId,
          (item as any).id,
          (item as any)._id,
          (item as any).product && (item as any).product._id,
          (item as any).product && (item as any).product.id,
        ].filter(Boolean).map((v) => String(v));

        const pid = possible.length > 0 ? possible[0] : "";
        const productReviews = reviews[pid] || [];
        const totalCount = (reviews as any)[`${pid}__totalCount`] || 0;

        return (
          <div
            key={pid || idx}
            className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-gray-900">{item.name || "Unnamed Product"}</div>
              <Badge variant="outline" className="text-xs">
                {productReviews.length} {productReviews.length === 1 ? "Review" : "Reviews"}
              </Badge>
            </div>
            {productReviews.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                {/* If there are other reviews by other customers, show a small note */}
                {totalCount > 0 ? (
                  <>
                    <p className="text-gray-500 text-sm">No reviews by this customer for this product</p>
                    <p className="text-gray-400 text-xs mt-2">{totalCount} other review(s) exist for this product</p>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">No reviews yet for this product</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {productReviews.map((r, reviewIdx) => (
                  <div
                    key={reviewIdx}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100"
                  >
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
        );
      })}
    </div>
  );
}

