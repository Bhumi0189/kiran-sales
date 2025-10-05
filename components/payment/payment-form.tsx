"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, Smartphone, Building, Truck, Shield, CheckCircle } from "lucide-react"
import { formatRupee } from '@/lib/format'

interface PaymentFormProps {
  paymentMethod: string
  onPaymentMethodChange: (method: string) => void
  onPaymentComplete: (paymentData: any) => void
  total: number
  isProcessing: boolean
}

export function PaymentForm({
  paymentMethod,
  onPaymentMethodChange,
  onPaymentComplete,
  total,
  isProcessing,
}: PaymentFormProps) {
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  })

  const [upiData, setUpiData] = useState({
    upiId: "",
    verificationCode: "",
  })

  const [netBankingData, setNetBankingData] = useState({
    bank: "",
    accountNumber: "",
    ifsc: "",
  })

  const [paymentStep, setPaymentStep] = useState<"select" | "details" | "processing" | "success">("select")
  const [paymentError, setPaymentError] = useState("")

  const handlePaymentSubmit = async () => {
    setPaymentStep("processing")
    setPaymentError("")

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock payment validation
      if (paymentMethod === "card" && cardData.cardNumber.length < 16) {
        throw new Error("Invalid card number")
      }
      if (paymentMethod === "upi" && !upiData.upiId.includes("@")) {
        throw new Error("Invalid UPI ID")
      }
      if (paymentMethod === "netbanking" && !netBankingData.bank) {
        throw new Error("Please select a bank")
      }

      setPaymentStep("success")

      // Call parent callback with payment data
      const paymentData = {
        method: paymentMethod,
        transactionId: `TXN${Date.now()}`,
        amount: total,
        status: "success",
        timestamp: new Date().toISOString(),
      }

      setTimeout(() => {
        onPaymentComplete(paymentData)
      }, 1500)
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Payment failed")
      setPaymentStep("details")
    }
  }

  if (paymentStep === "processing") {
    return (
      <Card>
        <CardContent className="pt-12 pb-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
          <p className="text-gray-600">Please wait while we process your payment...</p>
        </CardContent>
      </Card>
    )
  }

  if (paymentStep === "success") {
    return (
      <Card>
        <CardContent className="pt-12 pb-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
          <p className="text-gray-600">Your payment has been processed successfully.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>Choose your preferred payment method</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Method Selection */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant={paymentMethod === "card" ? "default" : "outline"}
            className="h-20 flex-col"
            onClick={() => onPaymentMethodChange("card")}
          >
            <CreditCard className="w-6 h-6 mb-2" />
            <span className="text-sm">Card</span>
          </Button>

          <Button
            variant={paymentMethod === "upi" ? "default" : "outline"}
            className="h-20 flex-col"
            onClick={() => onPaymentMethodChange("upi")}
          >
            <Smartphone className="w-6 h-6 mb-2" />
            <span className="text-sm">UPI</span>
          </Button>

          <Button
            variant={paymentMethod === "netbanking" ? "default" : "outline"}
            className="h-20 flex-col"
            onClick={() => onPaymentMethodChange("netbanking")}
          >
            <Building className="w-6 h-6 mb-2" />
            <span className="text-sm">Net Banking</span>
          </Button>

          <Button
            variant={paymentMethod === "cod" ? "default" : "outline"}
            className="h-20 flex-col"
            onClick={() => onPaymentMethodChange("cod")}
          >
            <Truck className="w-6 h-6 mb-2" />
            <span className="text-sm">Cash on Delivery</span>
          </Button>
        </div>

        {/* Payment Details Forms */}
        {paymentMethod === "card" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardData.cardNumber}
                onChange={(e) => setCardData((prev) => ({ ...prev, cardNumber: e.target.value }))}
                maxLength={19}
              />
            </div>

            <div>
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                placeholder="John Doe"
                value={cardData.cardholderName}
                onChange={(e) => setCardData((prev) => ({ ...prev, cardholderName: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={cardData.expiryDate}
                  onChange={(e) => setCardData((prev) => ({ ...prev, expiryDate: e.target.value }))}
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={(e) => setCardData((prev) => ({ ...prev, cvv: e.target.value }))}
                  maxLength={4}
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-gray-700">Your payment information is secure and encrypted</span>
              </div>
            </div>
          </div>
        )}

        {paymentMethod === "upi" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="upiId">UPI ID</Label>
              <Input
                id="upiId"
                placeholder="yourname@paytm"
                value={upiData.upiId}
                onChange={(e) => setUpiData((prev) => ({ ...prev, upiId: e.target.value }))}
              />
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Smartphone className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800">You'll receive a payment request on your UPI app</span>
              </div>
            </div>
          </div>
        )}

        {paymentMethod === "netbanking" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bank">Select Bank</Label>
              <Select
                value={netBankingData.bank}
                onValueChange={(value) => setNetBankingData((prev) => ({ ...prev, bank: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose your bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sbi">State Bank of India</SelectItem>
                  <SelectItem value="hdfc">HDFC Bank</SelectItem>
                  <SelectItem value="icici">ICICI Bank</SelectItem>
                  <SelectItem value="axis">Axis Bank</SelectItem>
                  <SelectItem value="kotak">Kotak Mahindra Bank</SelectItem>
                  <SelectItem value="pnb">Punjab National Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <Building className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">You'll be redirected to your bank's secure login page</span>
              </div>
            </div>
          </div>
        )}

        {paymentMethod === "cod" && (
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <Truck className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm text-green-800">
                Pay ₹{formatRupee(Math.round(total * 1.18))} when your order is delivered
              </span>
            </div>
          </div>
        )}

        {paymentError && (
          <Alert variant="destructive">
            <AlertDescription>{paymentError}</AlertDescription>
          </Alert>
        )}

        {/* Payment Button */}
        {paymentMethod !== "cod" && (
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handlePaymentSubmit}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : `Pay ₹${formatRupee(Math.round(total * 1.18))}`}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
