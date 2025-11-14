"use client"

import React, { useState } from "react"
import { mutate as globalMutate } from 'swr'
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

  // text fields for comma-separated sizes/colors in Add dialog
  const [newSizesText, setNewSizesText] = useState("")
  const [newColorsText, setNewColorsText] = useState("")

  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [editSizesText, setEditSizesText] = useState("")
  const [editColorsText, setEditColorsText] = useState("")

  React.useEffect(() => {
    if (editingProduct) {
      setEditSizesText(Array.isArray(editingProduct.sizes) ? editingProduct.sizes.join(', ') : (editingProduct.sizes || '').toString())
      setEditColorsText(Array.isArray(editingProduct.colors) ? editingProduct.colors.join(', ') : (editingProduct.colors || '').toString())
    }
  }, [editingProduct])
  // Fetch products from API
  const handleEditProduct = async () => {
    if (!editingProduct) return
    const { _id, ...update } = editingProduct
    // parse sizes/colors from edit text fields
    const sizes = editSizesText ? editSizesText.split(',').map(s => s.trim()).filter(Boolean) : []
    const colors = editColorsText ? editColorsText.split(',').map(c => c.trim()).filter(Boolean) : []
    update.sizes = sizes
    update.colors = colors
    await fetch("/api/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id, ...update }),
    })
    setEditingProduct(null)
    // update local admin list and notify public product list to revalidate
    fetchProducts()
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('kiran-products')
        bc.postMessage({ type: 'product:updated', id: _id, payload: update })
        bc.close()
      }
    } catch (e) {
      console.debug('Broadcast failed', e)
    }
    try { globalMutate('/api/products') } catch (e) { /* noop */ }
  }

  const handleDeleteProduct = async (_id: string) => {
    await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id }),
    })
    fetchProducts()
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('kiran-products')
        bc.postMessage({ type: 'product:deleted', id: _id })
        bc.close()
      }
    } catch (e) { console.debug('Broadcast failed', e) }
    try { globalMutate('/api/products') } catch (e) { }
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

  // Close Add dialog on Escape for the custom modal
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAddDialogOpen) setIsAddDialogOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isAddDialogOpen])

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    if (isAddDialogOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
    return
  }, [isAddDialogOpen])

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
            console.error("Upload succeeded but no URL returned", data);
            // fallback: convert file to data URL and use that so product still has an image
            const dataUrl = await fileToDataUrl(file)
            imageUrl = dataUrl
            setImagePreview(imageUrl)
            toast({ title: 'Upload returned no URL', description: 'Stored image as inline data URL.' })
          }
        } else {
          const contentType = res.headers.get('content-type') || ''
          let errBody = ''
          try {
            if (contentType.includes('application/json')) errBody = JSON.stringify(await res.json())
            else errBody = await res.text()
          } catch (e) { errBody = 'Failed to read error body' }
          console.error("Failed to upload image", res.status, errBody);
          // fallback: convert file to data URL so the product still gets an image
          const dataUrl = await fileToDataUrl(file)
          imageUrl = dataUrl
          setImagePreview(imageUrl)
          toast({ title: 'Upload failed', description: `Upload failed (${res.status}). Using inline image instead.` })
        }
        } catch (error) {
        console.error("Error uploading image:", error);
        // try fallback to inline data URL so admin can continue
        try {
          const dataUrl = await fileToDataUrl(file)
          imageUrl = dataUrl
          setImagePreview(imageUrl)
          toast({ title: 'Upload error', description: 'Could not upload file; using inline image instead.' })
        } catch (e) {
          console.error('Failed to create data URL fallback', e)
          toast({ title: 'Upload error', description: 'Could not upload file and failed to create inline fallback. Please paste an image URL.' })
          return
        }
      }
    }

    // Parse numbers safely, fallback to 0 if invalid
    const price = Number.parseFloat(newProduct.price) || 0;
    const originalPrice = Number.parseFloat(newProduct.originalPrice) || price;
    const stock = Number.parseInt(newProduct.stock) || 0;

    // parse sizes and colors from comma-separated admin input
    const sizes = newSizesText ? newSizesText.split(',').map(s => s.trim()).filter(Boolean) : []
    const colors = newColorsText ? newColorsText.split(',').map(c => c.trim()).filter(Boolean) : []

    const product = {
      name: newProduct.name?.trim() || "",
      price,
      originalPrice,
      image: imageUrl,
      // API expects sizes and colors arrays — provide empty arrays when not specified
      sizes,
      colors,
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

      // Try to parse JSON response for helpful error messages
      let body
      try {
        body = await res.json()
      } catch (e) {
        const text = await res.text()
        body = { error: text }
      }

      if (!res.ok) {
        console.error('Create product failed', body)
        const message = body?.error || body?.message || 'Server returned an error while creating the product.'
        toast({ title: 'Create product failed', description: String(message) })
        return
      }

      // Success
      toast({
        title: "Product Added",
        description: `Product '${product.name}' was added successfully!`,
        duration: 2500,
      });
    } catch (err: any) {
      console.error("Error adding product:", err);
      toast({ title: 'Create product failed', description: err?.message || 'Failed to add product. Please check your input and try again.' })
      return;
    }

    // small helper to convert a File to data URL (used as fallback when upload fails)
    async function fileToDataUrl(file: File) {
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = (e) => reject(e)
        reader.readAsDataURL(file)
      })
    }

    setNewProduct({ name: "", price: "", originalPrice: "", category: "", subcategory: "", stock: "", description: "", image: "" });
    setNewSizesText("")
    setNewColorsText("")
    setIsAddDialogOpen(false);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    // refresh admin list and notify public product list clients to revalidate
    fetchProducts();
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('kiran-products')
        bc.postMessage({ type: 'product:created', payload: product })
        bc.close()
      }
    } catch (e) { console.debug('Broadcast failed', e) }
    try { globalMutate('/api/products') } catch (e) { }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
          <p className="text-gray-600">Add and manage your product inventory</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>

        {isAddDialogOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsAddDialogOpen(false)} />
            <div className="relative w-full max-w-5xl mx-4">
              <div className="bg-white rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-auto">
                <button
                  onClick={() => setIsAddDialogOpen(false)}
                  className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 rounded-md p-1"
                  aria-label="Close dialog"
                >
                  ✕
                </button>
                <div className="mb-3 text-center">
                  <h3 className="text-2xl font-semibold">Add New Product</h3>
                  <p className="text-sm text-gray-500">Add a new product to your inventory</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleAddProduct(); }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left: form (spans 2 on md) */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="product-name" className="text-sm font-medium">Product Name</Label>
                      <Input
                        id="product-name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter product name"
                        className="h-11 text-sm rounded-md border-gray-200 shadow-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="product-price" className="text-sm font-medium">Price (₹)</Label>
                        <Input
                          id="product-price"
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
                          placeholder="2499"
                          className="h-11 text-sm rounded-md border-gray-200 shadow-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="product-original-price" className="text-sm font-medium">Original Price (₹)</Label>
                        <Input
                          id="product-original-price"
                          type="number"
                          value={newProduct.originalPrice}
                          onChange={(e) => setNewProduct((prev) => ({ ...prev, originalPrice: e.target.value }))}
                          placeholder="2999"
                          className="h-11 text-sm rounded-md border-gray-200 shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="product-sizes" className="text-sm font-medium">Available Sizes</Label>
                        <Input
                          id="product-sizes"
                          value={newSizesText}
                          onChange={(e) => setNewSizesText(e.target.value)}
                          placeholder="e.g. XS, S, M, L, XL"
                          className="h-11 text-sm rounded-md border-gray-200 shadow-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="product-colors" className="text-sm font-medium">Available Colors</Label>
                        <Input
                          id="product-colors"
                          value={newColorsText}
                          onChange={(e) => setNewColorsText(e.target.value)}
                          placeholder="e.g. Blue, Pink, Green"
                          className="h-11 text-sm rounded-md border-gray-200 shadow-sm"
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
                      <Label htmlFor="product-image" className="text-sm font-medium">Product Image</Label>
                      <div className="flex gap-2 items-start">
                        <div className="flex-1">
                          <Input
                            id="product-image"
                            value={newProduct.image}
                            onChange={(e) => setNewProduct((prev) => ({ ...prev, image: e.target.value }))}
                            placeholder="Paste image URL or upload"
                            className="h-11 text-sm rounded-md border-gray-200 shadow-sm"
                          />
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF — up to 5MB. If upload fails we use an inline preview.</p>
                        </div>
                        <div>
                          <label className="inline-block px-3 py-2 bg-white border border-dashed rounded-md text-sm cursor-pointer hover:bg-gray-50">
                            Choose File
                            <input
                              type="file"
                              accept="image/*"
                              ref={fileInputRef}
                              className="hidden"
                              onChange={e => {
                                if (e.target.files && e.target.files[0]) {
                                  const url = URL.createObjectURL(e.target.files[0])
                                  setImagePreview(url)
                                } else {
                                  setImagePreview(null)
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                      {imagePreview && (
                        <div className="mt-2 flex justify-start">
                          <div className="w-48 h-36 rounded-md overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center">
                            <img src={imagePreview} alt="Preview" className="object-contain max-h-full max-w-full" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="mr-3">Cancel</Button>
                      <Button type="submit" size="sm" className="w-36 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 h-10 text-sm">
                        Add Product
                      </Button>
                    </div>
                  </div>

                  {/* Right: preview card */}
                  <div className="md:col-span-1">
                    <div className="border rounded-lg p-4 bg-gray-50 h-full flex flex-col">
                      <div className="w-full h-44 rounded-md overflow-hidden bg-white flex items-center justify-center mb-3">
                        <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="object-contain max-h-full max-w-full" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 truncate">{newProduct.name || "Product name"}</h4>
                        <p className="text-sm text-gray-600 mt-1">{newProduct.category || "Category"} • {newProduct.subcategory || "Subcategory"}</p>
                        <div className="mt-3">
                          <div className="flex gap-2 flex-wrap">
                            {(newSizesText ? newSizesText.split(',').map(s=>s.trim()).filter(Boolean) : []).map(s => (
                              <Badge key={s} className="text-xs">{s}</Badge>
                            ))}
                            {(!newSizesText || newSizesText.split(',').filter(Boolean).length===0) && (
                              <span className="text-xs text-gray-400">XS S M L XL</span>
                            )}
                          </div>
                          <div className="flex gap-2 flex-wrap mt-2">
                            {(newColorsText ? newColorsText.split(',').map(c=>c.trim()).filter(Boolean) : []).map(c => (
                              <span key={c} className="px-2 py-0.5 rounded-full text-xs border bg-white">{c}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
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
                {/* display available sizes and colors to admin */}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                    <div className="flex items-center gap-2">
                      {product.sizes.slice(0,5).map((s:any)=> (
                        <Badge key={s} className="text-xs">{s}</Badge>
                      ))}
                      {product.sizes.length > 5 && <span className="text-xs text-gray-400">+{product.sizes.length-5}</span>}
                    </div>
                  )}
                  {Array.isArray(product.colors) && product.colors.length > 0 && (
                    <div className="flex items-center gap-1">
                      {product.colors.slice(0,5).map((c:any)=> (
                        <span key={c} className="h-4 px-2 rounded-full text-xs border bg-white border-gray-200">{c}</span>
                      ))}
                      {product.colors.length > 5 && <span className="text-xs text-gray-400">+{product.colors.length-5}</span>}
                    </div>
                  )}
                </div>
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
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="edit-product-sizes">Available Sizes</Label>
                  <Input
                    id="edit-product-sizes"
                    value={editSizesText}
                    onChange={(e) => setEditSizesText(e.target.value)}
                    placeholder="XS, S, M, L, XL"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-product-colors">Available Colors</Label>
                  <Input
                    id="edit-product-colors"
                    value={editColorsText}
                    onChange={(e) => setEditColorsText(e.target.value)}
                    placeholder="Blue, Pink, Green"
                  />
                </div>
              </div>
              <Button onClick={handleEditProduct} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 h-10">
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
