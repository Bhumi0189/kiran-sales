//components/admin/orders-tab
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
import { Search, Filter, Eye } from "lucide-react"


export function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [filterPayment, setFilterPayment] = useState("all");
  const [filterDelivery, setFilterDelivery] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const statuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "out for delivery",
    "delivered",
    "cancelled"
  ];

  React.useEffect(() => {
    setLoading(true);
    fetch("/api/orders", {
      headers: {
        "authorization": "Bearer admin-token"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredOrders = Array.isArray(orders)
    ? orders.filter((order) => {
        const orderId = order.id || order._id || order.orderId || "";
        const customerName = order.customer?.name || order.customerName || "";
        const matchesSearch =
          orderId.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
          customerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
        const matchesPayment = filterPayment === "all" || (order.paymentStatus || order.paymentMethod) === filterPayment;
        const matchesDelivery = filterDelivery === "all" || order.deliveryStatus === filterDelivery;
        return matchesSearch && matchesStatus && matchesPayment && matchesDelivery;
      })
    : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // Find the order object
    const order = orders.find((o) => (o.id || o._id || o.orderId) === orderId);
    if (!order) return;
    // Update in DB
    const _id = order._id || order.id || order.orderId;
    try {
      await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "authorization": "Bearer admin-token" },
        body: JSON.stringify({ _id, status: newStatus, deliveryStatus: newStatus }),
      });
      // Update local state for instant UI feedback
      setOrders(orders.map((o) => ((o.id || o._id || o.orderId) === orderId ? { ...o, status: newStatus, deliveryStatus: newStatus } : o)));
    } catch (e) {
      alert("Failed to update order status");
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading orders...</div>;
  }

  const sortedOrders = filteredOrders.slice().sort((a, b) => {
    if (sortBy === "date-desc") return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
    if (sortBy === "date-asc") return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
    if (sortBy === "amount-desc") return (b.totalAmount || b.total) - (a.totalAmount || a.total);
    if (sortBy === "amount-asc") return (a.totalAmount || a.total) - (b.totalAmount || b.total);
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
        <p className="text-gray-600">Manage customer orders and fulfillment</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search orders or customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
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
              <SelectTrigger className="w-full sm:w-40">
                <span className="mr-2">Payment</span>
                <SelectValue />
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
              <SelectTrigger className="w-full sm:w-40">
                <span className="mr-2">Delivery</span>
                <SelectValue />
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
              <SelectTrigger className="w-full sm:w-40">
                <span className="mr-2">Sort</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest</SelectItem>
                <SelectItem value="date-asc">Oldest</SelectItem>
                <SelectItem value="amount-desc">Amount High-Low</SelectItem>
                <SelectItem value="amount-asc">Amount Low-High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {sortedOrders.map((order) => {
          const orderId = order.id || order._id || order.orderId || "";
          const customerName = order.customer?.name || order.customerName || "";
          const customerEmail = order.customer?.email || order.customerEmail || "";
          const customerPhone = order.customer?.phone || order.customerPhone || "";
          const status = order.status || order.deliveryStatus || "pending";
          const total = order.total || order.totalAmount || 0;
          return (
            <Card key={orderId}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{orderId}</h3>
                      <p className="text-sm text-gray-600">{customerName}</p>
                    </div>
                    <Badge className={getStatusColor(status)}>{status}</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">₹{total.toLocaleString()}</span>
                    {/* View Order Button */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Order Details - {orderId}</DialogTitle>
                          <DialogDescription>Complete order information and management</DialogDescription>
                        </DialogHeader>
                        {selectedOrder && ((selectedOrder.id || selectedOrder._id || selectedOrder.orderId) === orderId) && (
                          <div className="space-y-6">
                            {/* Customer Info */}
                            <div>
                              <h4 className="font-semibold mb-2">Customer Information</h4>
                              <div className="bg-gray-50 p-4 rounded-lg space-y-1">
                                <p>
                                  <strong>Name:</strong> {selectedOrder.customer?.name || selectedOrder.customerName || ""}
                                </p>
                                <p>
                                  <strong>Email:</strong> {selectedOrder.customer?.email || selectedOrder.customerEmail || ""}
                                </p>
                                <p>
                                  <strong>Phone:</strong> {selectedOrder.customer?.phone || selectedOrder.customerPhone || ""}
                                </p>
                              </div>
                            </div>
                            {/* Order Items */}
                            <div>
                              <h4 className="font-semibold mb-2">Order Items</h4>
                              <div className="space-y-2">
                                {selectedOrder.items?.map((item: any, index: number) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                                  >
                                    <div>
                                      <p className="font-medium">{item.name}</p>
                                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                    </div>
                                    <span className="font-semibold">
                                      ₹{(item.price * item.quantity).toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {/* Shipping Address */}
                            <div>
                              <h4 className="font-semibold mb-2">Shipping Address</h4>
                              <p className="bg-gray-50 p-4 rounded-lg">{selectedOrder.shippingAddress}</p>
                            </div>
                            {/* Order Status Update */}
                            <div>
                              <h4 className="font-semibold mb-2">Update Status</h4>
                              <div className="flex gap-2">
                                {statuses.map((status) => (
                                  <Button
                                    key={status}
                                    variant={selectedOrder.status === status ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => updateOrderStatus(selectedOrder.id, status)}
                                  >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    {/* View Reviews Button */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-2">
                          Reviews
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Order Reviews - {orderId}</DialogTitle>
                        </DialogHeader>
                        {/* Reviews for this order's products */}
                        <OrderReviews order={order} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {sortedOrders.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">No orders found matching your criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// --- Place at the end of the file ---

function OrderReviews({ order }: { order: any }) {
  const [reviews, setReviews] = React.useState<any[]>([]);
  React.useEffect(() => {
    async function fetchReviews() {
      if (!order.items) return;
      // Fetch all reviews for all products in this order
      const productIds = (order.items as any[]).map((item) => item.productId).filter(Boolean);
      if (productIds.length === 0) return;
      const res = await fetch(`/api/reviews?orderId=${order._id || order.id || order.orderId}`);
      if (res.ok) {
        setReviews(await res.json());
      }
    }
    fetchReviews();
  }, [order]);
  if (!order.items) return null;

  return (
    <div className="space-y-4">
      {(order.items as any[]).map((item: any) => {
        const productReviews = reviews.filter((r: any) => r.productId === item.productId);
        return (
          <div key={item.productId} className="border rounded p-2">
            <div className="font-semibold">{item.name}</div>
            {productReviews.length === 0 ? (
              <div className="text-gray-500 text-sm">No reviews for this product in this order.</div>
            ) : (
              <ul className="text-sm space-y-1">
                {productReviews.map((r: any, idx: number) => (
                  <li key={idx}>
                    <span className="font-medium">{r.userName || r.userId}:</span> {r.review}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

