//app/api/orders/page.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft, Package, Eye, Download } from "lucide-react"
import { formatRupee } from '@/lib/format'
import Link from "next/link"

// Mock orders data
const mockOrders = [
  {
    id: "ORD-1234567890",
    date: "2024-01-20",
    status: "delivered",
    total: 6897,
    items: [
      { name: "Premium Surgical Scrubs Set", quantity: 2, price: 2499 },
      { name: "Doctor White Coat", quantity: 1, price: 1899 },
    ],
    trackingNumber: "TRK123456789",
    estimatedDelivery: "2024-01-22",
  },
  {
    id: "ORD-1234567891",
    date: "2024-01-18",
    status: "shipped",
    total: 5097,
    items: [{ name: "Nurse Uniform - Comfort Fit", quantity: 3, price: 1699 }],
    trackingNumber: "TRK123456790",
    estimatedDelivery: "2024-01-21",
  },
  {
    id: "ORD-1234567892",
    date: "2024-01-15",
    status: "processing",
    total: 17495,
    items: [{ name: "O.T. Linen Set - Sterile", quantity: 5, price: 3499 }],
    trackingNumber: null,
    estimatedDelivery: "2024-01-25",
  },
]

export default function OrdersPage() {
  const { state } = useAuth()
  const [orders] = useState(mockOrders)

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
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
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
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{order.id}</CardTitle>
                      <CardDescription>Placed on {new Date(order.date).toLocaleDateString()}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Items ({order.items.length})</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.name} × {item.quantity}
                            </span>
                            <span className="font-medium">₹{formatRupee((item.price ?? 0) * (item.quantity ?? 0))}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-semibold text-lg">₹{formatRupee(order.total)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Estimated Delivery</p>
                        <p className="font-medium">{new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tracking Number</p>
                        <p className="font-medium">{order.trackingNumber || "Not assigned yet"}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download Invoice
                      </Button>
                      {order.status === "delivered" && (
                        <Button variant="outline" size="sm">
                          Reorder
                        </Button>
                      )}
                    </div>
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
