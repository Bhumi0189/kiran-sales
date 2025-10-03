"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Users, Truck } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    inquiryType: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
    alert("Thank you for your inquiry! We'll get back to you within 24 hours.")
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      inquiryType: "",
      message: "",
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
  <div className="min-h-screen bg-white">
      {/* Header */}
  <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Kiran Sales</h1>
                <p className="text-xs text-gray-600">Medical Uniforms & Linen</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
                Home
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-blue-600 font-medium">
                Products
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">
                About
              </Link>
              <Link href="/contact" className="text-blue-600 font-medium">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
  <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Badge className="mb-4 bg-gray-100 text-blue-900">Get in Touch</Badge>
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4 drop-shadow">Contact Our Team</h1>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Whether you’re a hospital, clinic, or individual professional, we’re here to help. Reach out for quotes, product info, or just to say hello—our Mumbai-based team responds within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
  <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="text-center bg-white border shadow-sm">
              <CardHeader>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-blue-900" />
                </div>
                <CardTitle>Visit Us</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  123 Industrial Area
                  <br />
                  Andheri East, Mumbai
                  <br />
                  Maharashtra 400069
                  <br />
                  India
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center bg-white border shadow-sm">
              <CardHeader>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-blue-900" />
                </div>
                <CardTitle>Call Us</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Sales: +91 98765 43210
                  <br />
                  Support: +91 98765 43211
                  <br />
                  Bulk Orders: +91 98765 43212
                  <br />
                  Toll Free: 1800-123-4567
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center bg-white border shadow-sm">
              <CardHeader>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-900" />
                </div>
                <CardTitle>Email Us</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  General: info@kiransales.com
                  <br />
                  Sales: sales@kiransales.com
                  <br />
                  Support: support@kiransales.com
                  <br />
                  Bulk: bulk@kiransales.com
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center bg-white border shadow-sm">
              <CardHeader>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-blue-900" />
                </div>
                <CardTitle>Business Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Monday - Friday
                  <br />
                  9:00 AM - 6:00 PM
                  <br />
                  Saturday
                  <br />
                  9:00 AM - 2:00 PM
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form and Info */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-white border shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-blue-900" />
                  Send us a Message
                </CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you within 24 hours.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Full Name *</label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter your full name"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Email Address *</label>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Enter your email"
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Phone Number</label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+91 98765 43210"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Company/Hospital</label>
                      <Input
                        value={formData.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                        placeholder="Enter company name"
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Inquiry Type *</label>
                    <Select
                      value={formData.inquiryType}
                      onValueChange={(value) => handleInputChange("inquiryType", value)}
                    >
                      <SelectTrigger className="bg-white border-gray-200">
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="bulk">Bulk Order</SelectItem>
                        <SelectItem value="custom">Custom Requirements</SelectItem>
                        <SelectItem value="support">Product Support</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Message *</label>
                    <Textarea
                      required
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Tell us about your requirements..."
                      rows={5}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800 text-white text-lg font-semibold py-3 rounded-full" size="lg">
                    <Send className="w-4 h-4 mr-2 text-white" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <div className="space-y-8">
              <Card className="bg-white border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-900" />
                    Bulk Orders & Partnerships
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Special pricing and services for hospitals, clinics, and healthcare institutions.
                  </CardDescription>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Volume discounts available</li>
                    <li>• Custom sizing and branding</li>
                    <li>• Dedicated account management</li>
                    <li>• Flexible payment terms</li>
                    <li>• Priority delivery scheduling</li>
                  </ul>
                  <Button className="mt-4 bg-blue-900 hover:bg-blue-800 text-white rounded-full" variant="default">
                    Request Bulk Quote
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="w-5 h-5 mr-2 text-blue-900" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Fast and reliable delivery across India with tracking support.
                  </CardDescription>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Free delivery on orders above ₹5,000</li>
                    <li>• Express delivery in 24-48 hours</li>
                    <li>• Pan-India coverage</li>
                    <li>• Real-time order tracking</li>
                    <li>• Secure packaging</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-blue-900">Need Immediate Assistance?</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-blue-900 mb-4">
                    For urgent inquiries or immediate support, call our dedicated helpline.
                  </CardDescription>
                  <div className="flex items-center space-x-2 text-blue-900 font-semibold">
                    <Phone className="w-4 h-4 text-blue-900" />
                    <span>+91 98765 43210</span>
                  </div>
                  <p className="text-xs text-blue-900 mt-2">Available Monday-Friday, 9 AM - 6 PM</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
  <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Visit Our Facility</h2>
            <p className="text-gray-600">
              Located in the heart of Mumbai's industrial area, easily accessible by road and rail.
            </p>
          </div>

          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-blue-900 mx-auto mb-4" />
              <p className="text-gray-600">Interactive map would be integrated here</p>
              <p className="text-sm text-gray-500">123 Industrial Area, Andheri East, Mumbai</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
