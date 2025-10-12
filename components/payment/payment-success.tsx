"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Download, Mail, ArrowRight } from "lucide-react"
import { formatRupee } from '@/lib/format'
import Link from "next/link"
import jsPDF from 'jspdf';

interface PaymentSuccessProps {
  orderData: {
    orderId: string
    amount: number
    paymentMethod: string
    transactionId?: string
    customerEmail: string
    estimatedDelivery: string
  }
}

export function PaymentSuccess({ orderData }: PaymentSuccessProps) {
  const handleDownloadInvoice = () => {
    const doc = new jsPDF()

    // Add content to the PDF
    doc.setFontSize(16)
    doc.text('Order Placed Successfully!', 10, 10)

  doc.setFontSize(12)
  doc.text(`Order ID: ${orderData.orderId}`, 10, 30)
  const amountPaid = (orderData as any).amountPaid ?? (orderData as any).amount ?? 0
  const paymentMethod = (orderData as any).paymentMethod ?? 'N/A'
  doc.text(`Amount Paid: ₹${amountPaid}`, 10, 40)
  doc.text(`Payment Method: ${paymentMethod}`, 10, 50)
  doc.text(`Estimated Delivery: ${orderData.estimatedDelivery}`, 10, 60)

    // Save the PDF
    doc.save(`Invoice_${orderData.orderId}.pdf`)
  }

  const handleEmailInvoice = () => {
    // Mock email invoice
    console.log("Emailing invoice to:", orderData.customerEmail)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="text-center">
          <CardContent className="pt-12 pb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-8">
              Thank you for your order. We'll send you a confirmation email shortly with your order details and tracking
              information.
            </p>

            {/* Order Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium">{orderData.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium">
                    {typeof orderData.amountPaid === "number" && !isNaN(orderData.amountPaid) ? formatRupee(orderData.amountPaid) : "0"}                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <Badge variant="secondary">{(orderData?.paymentMethod || 'N/A').toString().toUpperCase()}</Badge>
                </div>
                {orderData.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium text-sm">{orderData.transactionId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Delivery:</span>
                  <span className="font-medium">{orderData.estimatedDelivery}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleDownloadInvoice} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </Button>
                <Button onClick={handleEmailInvoice} variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Invoice
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/orders">
                  <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                    Track Your Order
                  </Button>
                </Link>
                <Link href="/">
                  <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                    Continue Shopping
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                📧 A confirmation email has been sent to <strong>{orderData?.customerEmail || orderData?.customer?.email || 'your email'}</strong>
              </p>
              <p className="text-sm text-blue-700 mt-2">
                For any queries, contact us at <strong>support@kiransales.com</strong> or call{" "}
                <strong>+91 98765 43210</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
