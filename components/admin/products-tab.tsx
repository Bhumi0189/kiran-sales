"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Search, Filter } from "lucide-react"
import Image from "next/image"

export default function ProductsTab() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: "", price: "", originalPrice: "", category: "", stock: "", description: "" })

  const categories = ["Surgical Wear", "Doctor Coats", "O.T. Linen", "Nursing Wear"]

  React.useEffect(() => {
    let mounted = true
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => mounted && setProducts(Array.isArray(data) ? data : []))
      .catch(() => mounted && setProducts([]))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  const filteredProducts = products.filter((p) => (p.name || "").toString().toLowerCase().includes(searchTerm.toLowerCase()) && (selectedCategory === "all" || p.category === selectedCategory))

  const handleAddProduct = async () => {
    const payload = { name: newProduct.name, price: Number(newProduct.price) || 0, originalPrice: Number(newProduct.originalPrice) || 0, image: "/placeholder.svg", category: newProduct.category, stock: Number(newProduct.stock) || 0, status: Number(newProduct.stock) > 0 ? "active" : "out_of_stock", description: newProduct.description }
    await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    setNewProduct({ name: "", price: "", originalPrice: "", category: "", stock: "", description: "" })
    setIsAddDialogOpen(false)
    const res = await fetch("/api/products"); const data = await res.json(); setProducts(Array.isArray(data) ? data : [])
  }

  const handleDeleteProduct = async (id: string) => {
    await fetch("/api/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ _id: id }) })
    const res = await fetch("/api/products"); const data = await res.json(); setProducts(Array.isArray(data) ? data : [])
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading products...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2"/>Add Product</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="product-name">Product Name</Label>
                <Input id="product-name" value={newProduct.name} onChange={(e: any) => setNewProduct(p => ({ ...p, name: e.target.value }))} placeholder="Enter product name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="product-price">Price (₹)</Label>
                  <Input id="product-price" type="number" value={newProduct.price} onChange={(e: any) => setNewProduct(p => ({ ...p, price: e.target.value }))} placeholder="2499" />
                </div>
                <div>
                  <Label htmlFor="product-original-price">Original Price (₹)</Label>
                  <Input id="product-original-price" type="number" value={newProduct.originalPrice} onChange={(e: any) => setNewProduct(p => ({ ...p, originalPrice: e.target.value }))} placeholder="2999" />
                </div>
              </div>
              <div>
                <Label htmlFor="product-category">Category</Label>
                <Select value={newProduct.category} onValueChange={(v) => setNewProduct(p => ({ ...p, category: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="product-stock">Stock Quantity</Label>
                <Input id="product-stock" type="number" value={newProduct.stock} onChange={(e: any) => setNewProduct(p => ({ ...p, stock: e.target.value }))} placeholder="50" />
              </div>
              <div>
                <Label htmlFor="product-description">Description</Label>
                <Textarea id="product-description" value={newProduct.description} onChange={(e: any) => setNewProduct(p => ({ ...p, description: e.target.value }))} placeholder="Product description..." />
              </div>
              <Button onClick={handleAddProduct} className="w-full bg-blue-600 hover:bg-blue-700">Add Product</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search products..." value={searchTerm} onChange={(e: any) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product: any) => (
          <Card key={product._id || product.id} className="overflow-hidden">
            <div className="relative">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} width={300} height={200} className="w-full h-48 object-cover" />
              <Badge className={`absolute top-2 right-2 ${(product.status || "").replace("_", " ")}`}>{(product.status || "").replace("_", " ")}</Badge>
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.category}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900">₹{(product.price || 0).toLocaleString()}</span>
                    {product.originalPrice > product.price && (<span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>)}
                  </div>
                  <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(product._id)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No products found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

