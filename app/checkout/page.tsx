"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft, Truck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { PaymentForm } from "@/components/payment/payment-form"
import { PaymentSuccess } from "@/components/payment/payment-success"
import AddressSelect from "@/components/checkout/address-select"

export default function CheckoutPage() {
  const { state, dispatch } = useCart()
  const { state: authState } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)

  const [formData, setFormData] = useState({
    email: authState.user?.email || "",
    firstName: authState.user?.firstName || "",
    lastName: authState.user?.lastName || "",
    phone: authState.user?.phone || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "cod",
  })
  const [selectedAddress, setSelectedAddress] = useState<any>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }
  // When address is selected, auto-fill formData
  const handleAddressSelect = (addr: any) => {
    setSelectedAddress(addr)
    setFormData((prev) => ({
      ...prev,
      firstName: addr.name || "",
      lastName: "",
      phone: addr.phone || "",
      address: addr.address || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
    }))
  }

  const handlePaymentComplete = async (paymentData: any) => {
    setIsProcessing(true)
    // Simulate payment gateway confirmation
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const order = {
      orderId: `ORD-${Date.now()}`,
      userId: authState.user?.id,
      customer: {
        email: authState.user?.email || formData.email,
        firstName: authState.user?.firstName || formData.firstName,
        lastName: authState.user?.lastName || formData.lastName,
        phone: authState.user?.phone || formData.phone,
      },
      items: state.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        id: item.id,
      })),
      totalAmount: Math.round(state.total * 1.18),
      paymentStatus: "Paid",
      paymentMethod: formData.paymentMethod,
      transactionId: paymentData.transactionId,
      orderDate: new Date().toISOString(),
      shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
      shippingAddressId: selectedAddress?._id || null,
      deliveryStatus: "Pending",
    }
    // Save order to backend
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    })
    setOrderData(order)
    setOrderPlaced(true)
    dispatch({ type: "CLEAR_CART" })
    setIsProcessing(false)
  }

  const handleCODOrder = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const order = {
      orderId: `ORD-${Date.now()}`,
      userId: authState.user?.id,
      customer: {
        email: authState.user?.email || formData.email,
        firstName: authState.user?.firstName || formData.firstName,
        lastName: authState.user?.lastName || formData.lastName,
        phone: authState.user?.phone || formData.phone,
      },
      items: state.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        id: item.id,
      })),
      totalAmount: Math.round(state.total * 1.18),
      paymentStatus: "Pending",
      paymentMethod: "cod",
      orderDate: new Date().toISOString(),
      shippingAddress: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
      shippingAddressId: selectedAddress?._id || null,
      deliveryStatus: "Pending",
    }
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    })
    setOrderData(order)
    setOrderPlaced(true)
    dispatch({ type: "CLEAR_CART" })
    setIsProcessing(false)
  }

  if (orderPlaced && orderData) {
    return <PaymentSuccess orderData={orderData} />
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
              <p className="text-gray-600 mb-6">Add some products to your cart before checking out.</p>
              <Link href="/">
                <Button>Continue Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shopping
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>We'll use this to send you order updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Address selection for logged-in users */}
                {authState.user?._id && (
                  <AddressSelect userId={authState.user._id} value={selectedAddress} onChange={handleAddressSelect} />
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Street address, apartment, suite, etc."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="karnataka">Karnataka</SelectItem>
                        <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                        <SelectItem value="gujarat">Gujarat</SelectItem>
                        <SelectItem value="rajasthan">Rajasthan</SelectItem>
                        <SelectItem value="west-bengal">West Bengal</SelectItem>
                        <SelectItem value="uttar-pradesh">Uttar Pradesh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="pincode">PIN Code</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange("pincode", e.target.value)}
                    placeholder="400001"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <PaymentForm
              paymentMethod={formData.paymentMethod}
              onPaymentMethodChange={(method) => handleInputChange("paymentMethod", method)}
              onPaymentComplete={handlePaymentComplete}
              total={state.total}
              isProcessing={isProcessing}
            />
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {state.items.map((item) => (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-center space-x-3">
                      <div className="relative">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={60}
                          height={60}
                          className="rounded-md object-cover"
                        />
                        <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {item.quantity}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-gray-500">{item.category}</p>
                        {item.size && <p className="text-xs text-gray-400">Size: {item.size}</p>}
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Order Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{state.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>₹{Math.round(state.total * 0.18).toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">₹{Math.round(state.total * 1.18).toLocaleString()}</span>
                  </div>
                </div>

                {/* COD Order Button */}
                {formData.paymentMethod === "cod" && (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleCODOrder}
                    disabled={isProcessing || !formData.email || !formData.firstName || !formData.address}
                  >
                    {isProcessing ? (
                      "Processing..."
                    ) : (
                      <>
                        <Truck className="w-4 h-4 mr-2" />
                        Place Order - ₹{Math.round(state.total * 1.18).toLocaleString()}
                      </>
                    )}
                  </Button>
                )}

                <div className="text-xs text-gray-500 text-center">
                  By placing your order, you agree to our Terms of Service and Privacy Policy.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
