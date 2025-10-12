"use client"

import { useState, useEffect } from "react"
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
import { formatRupee } from '@/lib/format'
import { PaymentSuccess } from "@/components/payment/payment-success"
import AddressSelect from "@/components/checkout/address-select"
// removed jsPDF/invoice download — handled via order details in admin

export default function CheckoutPage() {
  const { state, dispatch } = useCart()
  const { state: authState } = useAuth()
  const [displayedItems, setDisplayedItems] = useState<any[]>(state.items || [])
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

  // Calculate estimated delivery date (7-10 business days from now)
  const getEstimatedDelivery = () => {
    const today = new Date()
    const minDays = 7
    const maxDays = 10
    const minDate = new Date(today)
    const maxDate = new Date(today)
    minDate.setDate(today.getDate() + minDays)
    maxDate.setDate(today.getDate() + maxDays)

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }

    return `${formatDate(minDate)} - ${formatDate(maxDate)}`
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

    // compute total from cart state or localStorage fallback
    const computeTotal = () => {
      const items = (state.items && state.items.length > 0) ? state.items : (() => {
        try {
          const userId = authState.user?.id
          const cartKey = `cart_${userId || 'guest'}`
          const stored = localStorage.getItem(cartKey)
          if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed?.items && Array.isArray(parsed.items)) return parsed.items
          }
        } catch (e) {}
        return []
      })()
      return items.reduce((sum: number, item: any) => sum + ((item.price || item.product?.price || 0) * (Number(item.quantity) || 1)), 0)
    }
    const totalAmount = Math.round(computeTotal() * 1.18)
    const estimatedDelivery = getEstimatedDelivery()

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
        size: item.size || item.defaultSize || "Not Specified", // Ensure size is passed correctly
        color: item.color || item.defaultColor || "Not Specified", // Ensure color is passed correctly
      })),
      totalAmount: totalAmount,
      amountPaid: totalAmount, // Full amount paid for online payment
      amountPaidWithTaxes: totalAmount, // Total amount after taxes
      paymentStatus: "Paid",
      paymentMethod: formData.paymentMethod,
      transactionId: paymentData.transactionId,
      orderDate: new Date().toISOString(),
      estimatedDelivery: estimatedDelivery,
      shippingAddress: `${formData.address || ''}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
      shippingAddressId: selectedAddress?._id || null,
      deliveryStatus: "Pending",
    }

    // Save order to backend
    console.debug('Creating order (POST /api/orders):', order)
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(authState.user?.token ? { Authorization: `Bearer ${authState.user.token}` } : {}) },
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

    const computeTotal = () => {
      const items = (state.items && state.items.length > 0) ? state.items : (() => {
        try {
          const userId = authState.user?.id
          const cartKey = `cart_${userId || 'guest'}`
          const stored = localStorage.getItem(cartKey)
          if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed?.items && Array.isArray(parsed.items)) return parsed.items
          }
        } catch (e) {}
        return []
      })()
      return items.reduce((sum: number, item: any) => sum + ((item.price || item.product?.price || 0) * (Number(item.quantity) || 1)), 0)
    }
    const totalAmount = Math.round(computeTotal() * 1.18)
    const estimatedDelivery = getEstimatedDelivery()

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
        size: item.size || item.defaultSize || "Not Specified",
        color: item.color || item.defaultColor || "Not Specified",
      })),
      totalAmount: totalAmount,
      amountPaid: totalAmount, // Corrected amount for COD orders
      paymentStatus: "Pending", // Payment pending for COD
      paymentMethod: "cod",
      orderDate: new Date().toISOString(),
      estimatedDelivery: estimatedDelivery,
      shippingAddress: `${formData.address || ''}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
      shippingAddressId: selectedAddress?._id || null,
      deliveryStatus: "Pending",
    }

    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    })

    console.debug('Created COD order (POST /api/orders):', order)

    setOrderData(order)
    setOrderPlaced(true)
    dispatch({ type: "CLEAR_CART" })
    setIsProcessing(false)
  }

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const emailQuery = encodeURIComponent(authState.user?.email || formData.email || "")
        if (!emailQuery) {
          console.warn('No email available to fetch orders')
          return
        }

        const response = await fetch(`/api/orders?email=${emailQuery}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(authState.user?.token ? { Authorization: `Bearer ${authState.user.token}` } : {}),
          },
        });

        if (!response.ok) {
          // attempt to read body for debugging
          let body = '';
          try {
            body = await response.text();
          } catch (e) {
            body = '<unreadable response body>';
          }
          if (response.status === 401) {
            console.error("Unauthorized: Please check your authentication token.");
          }
          console.error(`Failed to fetch /api/orders: ${response.status} ${response.statusText}`, body);
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        setOrderData(data);
      } catch (error) {
        console.error("Failed to fetch order data:", error);
      }
    };

    fetchOrderData();
  }, [authState.user?.token, formData.email]);

  // Update the fetchCartItems function to ensure correct product details are fetched
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        // Prefer local client-stored cart (preserves size/color) to avoid overwriting
        // client-side selections due to race with server payloads.
        const userId = authState.user?.id
        const cartKey = `cart_${userId || 'guest'}`
        try {
          const stored = localStorage.getItem(cartKey)
          if (stored) {
            const parsed = JSON.parse(stored)
            if (parsed?.items && Array.isArray(parsed.items)) {
              console.log('Using localStorage cart for checkout (preserves size/color):', parsed.items)
              const updatedItems = (parsed.items as any[]).map((item: any) => ({
                id: item.id || item.product?._id || item.product?.id,
                name: item.name || item.product?.name,
                quantity: Number(item.quantity) || 0,
                price: item.price || item.product?.price,
                size: item.size || item.defaultSize || item.product?.size || "Unknown",
                color: item.color || item.defaultColor || item.product?.color || "Unknown",
                image: item.image || item.product?.image,
                category: item.category || item.product?.category,
                product: item.product || { _id: item.id, name: item.name, price: item.price, image: item.image, category: item.category },
              }))

              const payload = { items: updatedItems }
              console.log("Dispatching SET_ITEMS payload (from localStorage):", payload)
              dispatch({ type: "SET_ITEMS", payload })
              return
            }
          }
        } catch (e) {
          console.warn('Failed to read cart from localStorage, falling back to /api/cart', e)
        }

        // No local cart found — fall back to server endpoint
        const response = await fetch("/api/cart", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(authState.user?.token ? { Authorization: `Bearer ${authState.user.token}` } : {}),
          },
        })

        if (!response.ok) {
          if (response.status === 405) {
            console.error("Method Not Allowed: Please check the HTTP method for /api/cart.");
          }
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched cart items (raw):", data); // Log raw data for debugging

        // Extra debug: log items and type
        console.log("data.items ->", (data as any).items, "isArray:", Array.isArray((data as any).items));

        if (!data.items || !Array.isArray(data.items)) {
          console.error("Invalid cart data: `items` is missing or not an array.", data);
          return;
        }

        // Ensure real-time data for size and color is passed and displayed
        const updatedItems = (data.items as any[]).map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: Number(item.quantity) || 0,
          price: item.price,
          size: item.size || item.defaultSize || "Unknown",
          color: item.color || item.defaultColor || "Unknown",
          image: item.image,
          category: item.category,
          product: {
            _id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            category: item.category,
          },
        }));

        const payload = { items: updatedItems };
        console.log("Dispatching SET_ITEMS payload:", payload, "items is array:", Array.isArray(payload.items), "length:", payload.items.length);

        if (Array.isArray(payload.items)) {
          dispatch({ type: "SET_ITEMS", payload }); // Update cart state with fetched items
        } else {
          console.error("Won't dispatch SET_ITEMS because payload.items is not an array:", payload);
        }
      } catch (error) {
        console.error("Failed to fetch cart items:", error);
      }
    };

    fetchCartItems();
  }, [authState.user?.token, dispatch]);
  // Keep displayedItems in state; hydrate it from context or localStorage on the client
  useEffect(() => {
    if (state.items && state.items.length > 0) {
      setDisplayedItems(state.items.map((item: any) => ({ ...item, product: item.product || { _id: item.id, name: item.name, price: item.price, image: item.image, category: item.category } })))
      return
    }

    // client-only localStorage fallback
    try {
      const userId = authState.user?.id
      const cartKey = `cart_${userId || 'guest'}`
      const stored = typeof window !== 'undefined' ? localStorage.getItem(cartKey) : null
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.items && Array.isArray(parsed.items)) {
          const items = parsed.items.map((item: any) => ({
            ...item,
            product: item.product || { _id: item.id, name: item.name, price: item.price, image: item.image, category: item.category },
          }))
          setDisplayedItems(items)
          return
        }
      }
    } catch (e) {
      console.warn('Failed to read fallback cart from localStorage for display:', e)
    }
  }, [state.items, authState.user?.id])

  // Invoice download removed — admin/order details will provide order exports if needed.

  // Ensure the `amountPaid` field is correctly calculated and passed in the order object
  const totalAmount = Math.round(state.total * 1.18);
  const order = {
    amountPaid: totalAmount,
    // ...existing order properties...
  };

  if (orderPlaced && orderData) {
    return (
      <PaymentSuccess orderData={orderData} />
    );
  }

  if (!displayedItems || displayedItems.length === 0) {
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
                        <SelectItem value="madhya pradesh">Madhya Pradesh</SelectItem>
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
                  {state.items.map((item, index) => (
                    <div key={item.id || index} className="flex items-center space-x-3">
                      <div className="relative">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name || "Unnamed Product"}
                          width={60}
                          height={60}
                          className="rounded-md object-cover"
                        />
                        <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {item.quantity || 1}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{item.name || "Unnamed Product"}</h4>
                        <p className="text-xs text-gray-500">Category: {item.category || "Not Specified"}</p>
                        <p className="text-xs text-gray-400">Size: {item.size || "Unknown"}</p> {/* Correctly display size */}
                        <p className="text-xs text-gray-400">Color: {item.color || "Unknown"}</p> {/* Correctly display color */}
                        <p className="text-xs text-gray-400">Amount: {formatRupee((item.price || 0) * (item.quantity || 1))}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Order Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatRupee(state.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatRupee(Math.round(state.total * 0.18))}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">{formatRupee(Math.round(state.total * 1.18))}</span>
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 text-sm">Project Details</h4>
                  <p className="text-sm text-gray-600">This project is a sales e-commerce platform designed to streamline online shopping experiences. It includes features like user authentication, product management, and order processing.</p>
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
                        Place Order - {formatRupee(Math.round(state.total * 1.18))}
                      </>
                    )}
                  </Button>
                )}

                {/* Invoice Download removed */}

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