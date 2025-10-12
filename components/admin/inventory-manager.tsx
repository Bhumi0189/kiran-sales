"use client"

import React, { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react"
import Image from "next/image"

const categories = ["Surgical Wear", "Doctor Coats", "O.T. Linen", "Nursing Wear"]
const subcategories = [
  "Surgeons Dress", "Surgeons Gown", "Essentials", "O.T. Towels / Sheets", "Wrappers / Covers"
]
const stockStatuses = ["active", "out_of_stock"]

export default function InventoryManager() {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubcategory, setSelectedSubcategory] = useState("")
  const [selectedStockStatus, setSelectedStockStatus] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Read category from URL if present
  const getCategoryFromUrl = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      return params.get("category") || "all"
    }
    return "all"
  }
  const [selectedCategory, setSelectedCategory] = useState(getCategoryFromUrl())

  // Sync category filter with URL changes
  React.useEffect(() => {
    const onPopState = () => setSelectedCategory(getCategoryFromUrl())
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "",
    subcategory: "",
    stock: "",
    description: "",
    image: ""
  })

  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  // Fetch products from API
  const handleEditProduct = async () => {
    if (!editingProduct) return
    const { _id, ...update } = editingProduct
    await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id, ...update }),
    })
    setEditingProduct(null)
    fetchProducts()
  }

  const handleDeleteProduct = async (_id: string) => {
    await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id }),
    })
    fetchProducts()
  }
  const fetchProducts = () => {
    setLoading(true)
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  React.useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    // Allow category match by slug (e.g., coats) or label (e.g., Doctor Coats)
    let matchesCategory = selectedCategory === "all"
    if (!matchesCategory) {
      const catSlug = product.category.toLowerCase().replace(/\s+/g, "-")
      matchesCategory = selectedCategory === catSlug || product.category === selectedCategory
    }
    let matchesSubcategory = true
    if (selectedSubcategory && selectedSubcategory !== "all") {
      matchesSubcategory = product.subcategory === selectedSubcategory
    }
    let matchesStock = true
    if (selectedStockStatus && selectedStockStatus !== "all") {
      matchesStock = product.status === selectedStockStatus
    }
    return matchesSearch && matchesCategory && matchesSubcategory && matchesStock
  })

  const handleAddProduct = async () => {
    let imageUrl = newProduct.image?.trim() || "/placeholder.svg";

    // If file is selected, upload it
    if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files[0]) {
      const file = fileInputRef.current.files[0];
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          console.debug('Upload response:', data)
          if (data?.url) {
            imageUrl = data.url;
            // Use the returned URL for the preview so admin sees the final image that will be saved
            setImagePreview(imageUrl)
          } else {
            console.error("Upload succeeded but no URL returned");
            alert("Image uploaded but no URL returned. Using placeholder instead.");
          }
        } else {
          const text = await res.text()
          console.error("Failed to upload image", text);
          alert("Failed to upload image. Using placeholder instead.");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Error uploading image. Please enter an image URL instead.");
      }
    }

    // Parse numbers safely, fallback to 0 if invalid
    const price = Number.parseFloat(newProduct.price) || 0;
    const originalPrice = Number.parseFloat(newProduct.originalPrice) || price;
    const stock = Number.parseInt(newProduct.stock) || 0;

    const product = {
      name: newProduct.name?.trim() || "",
      price,
      originalPrice,
      image: imageUrl,
      // API expects sizes and colors arrays — provide empty arrays when not specified
      sizes: [],
      colors: [],
      category: newProduct.category?.trim() || "",
      subcategory: newProduct.subcategory?.trim() || "",
      stock,
      status: stock > 0 ? "active" : "out_of_stock",
      description: newProduct.description?.trim() || "",
    };

    try {
      console.debug('Submitting product payload:', product)
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const text = await res.text();
      let ok = res.ok
      try {
        // try parse JSON
        const json = JSON.parse(text)
        console.debug('Create product response JSON:', json)
      } catch (e) {
        console.debug('Create product response text:', text)
      }
      if (!ok) {
        throw new Error(text || "Failed to add product")
      }
      // Show toast on success
      toast({
        title: "Product Added",
        description: `Product '${product.name}' was added successfully!`,
        duration: 2500,
        // If your toast supports a 'variant' or 'type', use it here, e.g. variant: "success"
      });
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Failed to add product. Please check your input and try again.");
      return;
    }

    setNewProduct({ name: "", price: "", originalPrice: "", category: "", subcategory: "", stock: "", description: "", image: "" });
    setIsAddDialogOpen(false);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    fetchProducts();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
          <p className="text-gray-600">Add and manage your product inventory</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xs p-4 rounded-lg shadow-lg">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-lg font-semibold text-center">Add New Product</DialogTitle>
              <DialogDescription className="text-center text-gray-500">Add a new product to your inventory</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="product-name" className="text-xs">Product Name</Label>
                <Input
                  id="product-name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                  className="h-8 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="product-price" className="text-xs">Price (₹)</Label>
                  <Input
                    id="product-price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="2499"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="product-original-price" className="text-xs">Original Price (₹)</Label>
                  <Input
                    id="product-original-price"
                    type="number"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, originalPrice: e.target.value }))}
                    placeholder="2999"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="product-category" className="text-xs">Category</Label>
                <Select
                  value={newProduct.category}
                  onValueChange={(value) => setNewProduct((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category} className="text-sm">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="product-subcategory" className="text-xs">Subcategory</Label>
                <Select
                  value={newProduct.subcategory || ""}
                  onValueChange={(value) => setNewProduct((prev) => ({ ...prev, subcategory: value }))}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((subcategory) => (
                      <SelectItem key={subcategory} value={subcategory} className="text-sm">
                        {subcategory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="product-stock" className="text-xs">Stock Quantity</Label>
                <Input
                  id="product-stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, stock: e.target.value }))}
                  placeholder="50"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="product-description" className="text-xs">Description</Label>
                <Textarea
                  id="product-description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Product description..."
                  className="text-sm min-h-[48px]"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="product-image" className="text-xs">Product Image</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="product-image"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, image: e.target.value }))}
                    placeholder="Paste image URL or upload"
                    className="h-8 text-sm"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ width: 70 }}
                    className="text-xs"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        const url = URL.createObjectURL(e.target.files[0])
                        setImagePreview(url)
                      } else {
                        setImagePreview(null)
                      }
                    }}
                  />
                </div>
                {imagePreview && (
                  <div className="mt-1 flex justify-center">
                    {/* Use a standard <img> for preview to support blob/object URLs and local /uploads paths reliably */}
                    <img src={imagePreview} alt="Preview" width={128} height={96} className="rounded border object-contain" />
                  </div>
                )}
              </div>
              <div className="flex justify-center mt-2">
                <Button size="sm" onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-700 w-28 h-8 text-sm">
                  Add Product
                </Button>
              </div>
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
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={(val) => {
              setSelectedCategory(val)
              if (typeof window !== "undefined") {
                const url = new URL(window.location.href)
                if (val === "all") {
                  url.searchParams.delete("category")
                } else {
                  url.searchParams.set("category", val)
                }
                window.history.pushState({}, "", url)
              }
            }}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => {
                  const slug = category.toLowerCase().replace(/\s+/g, "-")
                  return (
                    <SelectItem key={slug} value={slug}>
                      {category}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <Select value={selectedSubcategory || "all"} onValueChange={setSelectedSubcategory}>
              <SelectTrigger className="w-full sm:w-48">
                <span className="mr-2">Subcategory</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subcategories</SelectItem>
                {subcategories.map((subcategory) => (
                  <SelectItem key={subcategory} value={subcategory}>{subcategory}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStockStatus || "all"} onValueChange={setSelectedStockStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <span className="mr-2">Stock</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                {stockStatuses.map((status) => (
                  <SelectItem key={status} value={status}>{status.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product._id} className="overflow-hidden">
            <div className="relative">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                width={300}
                height={200}
                className="w-full h-48 object-cover"
              />
              <Badge className={`absolute top-2 right-2 ${product.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {(typeof product.status === "string" ? product.status.replace(/_/g, " ") : "active")}
              </Badge>
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.category}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900">₹{Number(product.price || 0).toLocaleString()}</span>
                    {Number(product.originalPrice) > Number(product.price) && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{Number(product.originalPrice || 0).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingProduct(product)}>
                    <Edit className="w-4 h-4 mr-1" />Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(product._id)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product details</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-product-name">Product Name</Label>
                <Input
                  id="edit-product-name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct((prev: any) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-product-price">Price (₹)</Label>
                  <Input
                    id="edit-product-price"
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct((prev: any) => ({ ...prev, price: e.target.value }))}
                    placeholder="2499"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-product-original-price">Original Price (₹)</Label>
                  <Input
                    id="edit-product-original-price"
                    type="number"
                    value={editingProduct.originalPrice}
                    onChange={(e) => setEditingProduct((prev: any) => ({ ...prev, originalPrice: e.target.value }))}
                    placeholder="2999"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-product-category">Category</Label>
                <Select
                  value={editingProduct.category}
                  onValueChange={(value) => setEditingProduct((prev: any) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-product-stock">Stock Quantity</Label>
                <Input
                  id="edit-product-stock"
                  type="number"
                  value={editingProduct.stock}
                  onChange={(e) => setEditingProduct((prev: any) => ({ ...prev, stock: e.target.value }))}
                  placeholder="50"
                />
              </div>
              <div>
                <Label htmlFor="edit-product-description">Description</Label>
                <Textarea
                  id="edit-product-description"
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct((prev: any) => ({ ...prev, description: e.target.value }))}
                  placeholder="Product description..."
                />
              </div>
              <div>
                <Label htmlFor="edit-product-image">Product Image URL</Label>
                <Input
                  id="edit-product-image"
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct((prev: any) => ({ ...prev, image: e.target.value }))}
                  placeholder="Paste image URL or upload below"
                />
              </div>
              <Button onClick={handleEditProduct} className="w-full bg-blue-600 hover:bg-blue-700">
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
