import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import React from "react"

const productCategories = [
  {
    name: "O.T. Linen",
    description: "Includes surgeon gowns, drapes, hole sheets, and customized linen as per demand.",
    products: [
      { name: "Surgeon Gown", sizes: ["S", "M", "L", "XL"], customizable: true, image: "/placeholder.svg", description: "High quality surgeon gown.", price: 1200 },
      { name: "Drape", sizes: ["Standard", "Custom"], customizable: true, image: "/placeholder.svg", description: "Sterile drape for O.T.", price: 500 },
      { name: "Hole Sheet", sizes: ["Standard", "Custom"], customizable: true, image: "/placeholder.svg", description: "Hole sheet for surgery.", price: 350 },
      { name: "Custom Linen", sizes: ["Custom"], customizable: true, image: "/placeholder.svg", description: "Custom O.T. linen.", price: 800 },
    ],
  },
  {
    name: "Hospital Linen",
    description: "Bedsheets, pillow covers, blankets, and patient gowns.",
    products: [
      { name: "Bedsheet", sizes: ["Single", "Double"], customizable: true, image: "/placeholder.svg", description: "Soft hospital bedsheet.", price: 250 },
      { name: "Pillow Cover", sizes: ["Standard"], customizable: false, image: "/placeholder.svg", description: "Standard pillow cover.", price: 60 },
      { name: "Blanket", sizes: ["Standard"], customizable: false, image: "/placeholder.svg", description: "Warm hospital blanket.", price: 350 },
      { name: "Patient Gown", sizes: ["S", "M", "L", "XL"], customizable: true, image: "/placeholder.svg", description: "Patient gown for comfort.", price: 200 },
    ],
  },
  {
    name: "Scrub Suits",
    description: "Unisex scrub tops and bottoms in multiple sizes and colors.",
    products: [
      { name: "Scrub Top", sizes: ["S", "M", "L", "XL", "XXL"], customizable: true, image: "/placeholder.svg", description: "Unisex scrub top.", price: 400 },
      { name: "Scrub Bottom", sizes: ["S", "M", "L", "XL", "XXL"], customizable: true, image: "/placeholder.svg", description: "Unisex scrub bottom.", price: 350 },
    ],
  },
  {
    name: "Lab Coats",
    description: "Doctor coats, technician coats, and custom embroidered coats.",
    products: [
      { name: "Doctor Coat", sizes: ["S", "M", "L", "XL"], customizable: true, image: "/placeholder.svg", description: "Classic doctor coat.", price: 500 },
      { name: "Technician Coat", sizes: ["S", "M", "L", "XL"], customizable: true, image: "/placeholder.svg", description: "Technician lab coat.", price: 450 },
      { name: "Embroidered Coat", sizes: ["S", "M", "L", "XL"], customizable: true, image: "/placeholder.svg", description: "Custom embroidered coat.", price: 700 },
    ],
  },
  // Leave space for additional categories
]

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

export default function ProductCategoriesSection() {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  // Dummy images for demo
  const dummyImages = [
    "/medical-professionals-wearing-scrubs-hospital-unif.jpg",
    "/nurse-uniform-medical-scrubs.jpg",
    "/white-doctor-coat-medical-uniform.jpg",
    "/hospital-bed-linen-white-sterile.jpg",
    "/surgical-scrubs-medical-uniform.jpg",
    "/placeholder-user.jpg",
    "/placeholder-logo.png",
    "/placeholder.jpg"
  ]
  let imgIdx = 0
  const filtered = productCategories.flatMap((cat) =>
    cat.products
      .filter((prod) =>
        (selectedCategory === "All" || cat.name === selectedCategory) &&
        (prod.name.toLowerCase().includes(search.toLowerCase()) ||
          cat.name.toLowerCase().includes(search.toLowerCase()))
      )
      .map((prod) => ({
        ...prod,
        category: cat.name,
        categoryDesc: cat.description,
        image: dummyImages[imgIdx++ % dummyImages.length],
        description: prod.description || "High quality medical product.",
        price: prod.price || "-"
      }))
  )
  return (
  <section className="py-16 bg-white border-t border-b border-blue-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">Product Catalog</h2>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between max-w-4xl mx-auto mb-8">
          <Input
            placeholder="Search products or categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="rounded-lg shadow-sm border-blue-200 md:w-2/3"
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {productCategories.map((cat) => (
                <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((prod) => (
            <Card key={prod.name} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow flex flex-col overflow-hidden border border-blue-50">
              <div className="relative w-full h-48 bg-blue-100">
                <Image
                  src={prod.image || "/placeholder.svg"}
                  alt={prod.name}
                  fill
                  className="object-cover w-full h-full"
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <CardContent className="flex-1 flex flex-col justify-between p-4">
                <h3 className="font-semibold text-blue-900 text-lg mb-1 truncate">{prod.name}</h3>
                <div className="text-xs text-blue-500 mb-1">{prod.category}</div>
                <div className="text-xs text-gray-500 mb-2 truncate">{prod.categoryDesc}</div>
                <div className="text-sm text-gray-700 mb-2 line-clamp-2">{prod.description}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-blue-700 text-lg">₹{prod.price}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="default">Add to Cart</Button>
                    <Button size="sm" variant="outline">Bulk Inquiry</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {/* Placeholder for additional categories */}
          <Card className="bg-white/70 border-dashed border-2 border-blue-200 flex items-center justify-center min-h-[200px]">
            <span className="text-blue-400">More categories coming soon...</span>
          </Card>
        </div>
        <div className="mt-12 text-center space-y-2 text-sm text-gray-600">
          <div>Goods once sold will not be taken back.</div>
          <div>Prices are subject to change without prior notice.</div>
          <div>Payment: NEFT / RTGS / IMPS / Cash on Delivery</div>
          <div>Delivery Terms: Doorstep delivery available.</div>
        </div>
      </div>
    </section>
  )
}
