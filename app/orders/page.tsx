//app/api/orders/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft, Package, Truck, Calendar, CreditCard } from "lucide-react"
import { formatRupee } from '@/lib/format'
import Link from "next/link"
import Image from "next/image"

// Updated Order type to match your actual data structure
interface OrderItem {
  id?: string;
  name: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
  image?: string;
}

interface Order {
  _id?: string;
  orderId?: string;
  orderDate: string;
  deliveryStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  items: OrderItem[];
  totalAmount: number;
  estimatedDelivery?: string;
  trackingNumber?: string;
  shippingAddress?: string;
  transactionId?: string;
  customer?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}

export default function OrdersPage() {
  const { state } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      if (!state.user) return;
      try {
        const res = await fetch(`/api/orders?email=${state.user.email}`);
        if (!res.ok) throw new Error("Failed to fetch orders. Please try again later.");
        const data = await res.json();
        console.log("Fetched orders:", data); // Debug log
        setOrders(data.orders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        alert("Unable to load orders. Please check your connection and try again.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [state.user]);

  const getStatusColor = (status: string = "pending") => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
      case "out for delivery":
        return "bg-blue-100 text-blue-800";
      case "processing":
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string = "pending") => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!state.user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h1>
              <p className="text-gray-600 mb-6">You need to be logged in to view your orders.</p>
              <Link href="/">
                <Button>Go to Homepage</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Homepage
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.length === 0 ? (
            <Card className="text-center">
              <CardContent className="pt-12 pb-8">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
                <p className="text-gray-600 mb-6">When you place your first order, it will appear here.</p>
                <Link href="/">
                  <Button>Start Shopping</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order._id || order.orderId}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">
                        Order #{order.orderId || order._id}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.orderDate).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        {order.paymentMethod && (
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-4 h-4" />
                            {order.paymentMethod.toUpperCase()}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge className={getStatusColor(order.deliveryStatus)}>
                        {order.deliveryStatus || "Pending"}
                      </Badge>
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        {order.paymentStatus || "Pending"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Items ({order.items?.length || 0})
                      </h4>
                      <div className="space-y-3">
                        {order.items?.map((item, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="relative w-16 h-16 flex-shrink-0">
                              <Image
                                src={item.image || '/placeholder.svg'}
                                alt={item.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover rounded-md"
                              />
                              <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-1.5 py-0.5">
                                {item.quantity}
                              </Badge>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-gray-900 font-medium truncate">
                                {item.name || "Unnamed Product"}
                              </div>
                              <div className="text-gray-600 text-sm flex flex-wrap gap-2 mt-1">
                                {item.size && item.size !== "Not Specified" && (
                                  <span className="bg-white px-2 py-0.5 rounded text-xs">
                                    Size: {item.size}
                                  </span>
                                )}
                                {item.color && item.color !== "Not Specified" && (
                                  <span className="bg-white px-2 py-0.5 rounded text-xs">
                                    Color: {item.color}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="font-semibold text-gray-900 text-right">
                              ₹{formatRupee((item.price || 0) * (item.quantity || 0))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          Shipping Address
                        </h4>
                        <p className="text-gray-600 text-sm">{order.shippingAddress}</p>
                      </div>
                    )}

                    {/* Order Summary */}
                    <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                        <p className="font-bold text-xl text-blue-600">
                          ₹{formatRupee(order.totalAmount || 0)}
                        </p>
                        {order.paymentMethod === 'cod' && order.paymentStatus === 'Pending' && (
                          <p className="text-xs text-gray-500 mt-1">Pay on Delivery</p>
                        )}
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Estimated Delivery</p>
                        <p className="font-medium text-gray-900">
                          {order.estimatedDelivery || "Not available"}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                        <p className="font-medium text-gray-900">
                          {order.trackingNumber || "Not assigned yet"}
                        </p>
                      </div>
                    </div>

                    {/* Transaction ID for online payments */}
                    {order.transactionId && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600">
                          Transaction ID: <span className="font-mono text-gray-900">{order.transactionId}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}