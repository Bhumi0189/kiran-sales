"use client"

import { ShoppingCart, Star, Filter, Search, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import React, { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { AuthDialog } from "@/components/auth-dialog"
import useSWR, { mutate as globalMutate } from "swr"
import { formatRupee } from '@/lib/format';

const categories = ["All", "Surgical Scrubs", "Doctor Coats", "O.T. Linen", "Nursing Wear"];

// Simple fetcher for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

// Placeholder image - using a data URL as absolute fallback
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

// Dummy images for fallback
const dummyImages = [
  "/surgical-scrubs-medical-uniform.jpg",
  "/white-doctor-coat-medical.jpg",
  "/nurse-uniform-medical-scrubs.jpg",
  "/medical-professionals-wearing-scrubs-hospital-unif.jpg",
  "/hospital-bed-linen-sterile.jpg",
  "/hospital-bed-linen-white-sterile.jpg",
  "/white-doctor-coat-medical-uniform.jpg",
  "/placeholder.svg"
];

// Helper function to get a valid image for a product
function getProductImage(product: any, index: number): string {
  if (product.image && 
      typeof product.image === "string" && 
      product.image.trim() !== "" && 
      product.image !== "/placeholder.svg" &&
      !product.image.includes("undefined")) {
    return product.image;
  }
  
  const productId = product._id || product.id || index;
  const hashCode = productId.toString().split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return dummyImages[Math.abs(hashCode) % dummyImages.length];
}

function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [showAuth, setShowAuth] = useState(false);
  const router = useRouter();
  const { state } = useAuth();
  
  // Fetch products
  const { data: productsRaw, error, isLoading } = useSWR("/api/products", fetcher);
  // Defensive: ensure products is always an array
  const products = Array.isArray(productsRaw) ? productsRaw : [];

  // Filter and sort products
  const filteredProducts = products
    .filter((product: any) =>
      (selectedCategory === "All" || product.category === selectedCategory) &&
      (product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       product.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a: any, b: any) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "price-low") return (a.price || 0) - (b.price || 0);
      if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  return (
    <div className="min-h-screen bg-white">
      {/* Global Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md">
          <AuthDialog />
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <section className="py-8 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-[420px] lg:w-[520px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-4 text-lg border-2 border-gray-200 focus:border-gray-400 bg-white rounded-full shadow-sm focus:shadow-md transition-all"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 rounded-full border-2 border-gray-200 bg-white shadow-sm focus:shadow-md">
                  <Filter className="w-4 h-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 rounded-full border-2 border-gray-200 bg-white shadow-sm focus:shadow-md">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Loading products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-500 text-lg">Error loading products. Please try again.</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-gray-600">
                  Showing {filteredProducts.length} of {products.length} products
                  {selectedCategory !== "All" && ` in ${selectedCategory}`}
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map((product: any, index: number) => (
                  <ProductCard 
                    key={product._id || product.id || index} 
                    product={product}
                    fallbackImage={getProductImage(product, index)}
                    onLoginClick={() => setShowAuth(true)}
                  />
                ))}
              </div>
              {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("All")
                    }}
                    className="mt-4"
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProductsPage;

const sizes = ["S", "M", "L", "XL", "XXL"];
const colors = ["Red", "Blue", "Green", "Black", "White"];

// Add size and color selection to ProductCard
function ProductCard({ product, fallbackImage, onLoginClick }: { product: any; fallbackImage: string; onLoginClick: () => void }) {
  const { state } = useAuth()
  const { dispatch } = useCart()
  const router = useRouter()
  const [reviews, setReviews] = useState<any[]>([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  const { toast } = useToast()
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [imageSrc, setImageSrc] = useState<string>(fallbackImage)
  const [imageError, setImageError] = useState(false)
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  // Fetch wishlist for logged-in user
  const wishlistKey = state.user ? `/api/wishlist?email=${encodeURIComponent(state.user.email)}` : null
  const { data: wishlistDataRaw, mutate: mutateWishlist } = useSWR(wishlistKey, fetcher)
  const wishlistItems = Array.isArray(wishlistDataRaw?.items) ? wishlistDataRaw.items : []
  
  // Check if this product is in wishlist
  const wishlisted = !!wishlistItems.find((item: any) => 
    (item.id === (product._id || product.id)) || (item._id === (product._id || product.id))
  )

  // Set initial image
  useEffect(() => {
    const initialImage = product.image && 
                        typeof product.image === "string" && 
                        product.image.trim() !== "" && 
                        product.image !== "/placeholder.svg" &&
                        !product.image.includes("undefined")
                        ? product.image 
                        : fallbackImage;
    setImageSrc(initialImage);
  }, [product.image, fallbackImage]);

  useEffect(() => {
    setLoadingReviews(true)
    fetch(`/api/reviews?productId=${product._id || product.id}`)
      .then(res => res.json())
      .then(data => {
        setReviews(Array.isArray(data) ? data : [])
        setLoadingReviews(false)
      })
      .catch(() => {
        setReviews([])
        setLoadingReviews(false)
      })
  }, [product._id, product.id])

  const avgRating = reviews.length 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1) 
    : null

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      if (imageSrc !== fallbackImage) {
        setImageSrc(fallbackImage);
      } else if (imageSrc !== PLACEHOLDER_IMAGE) {
        setImageSrc(PLACEHOLDER_IMAGE);
      }
    }
  };

  const addToCart = () => {
    if (!state.user) {
      onLoginClick()
      return
    }
    dispatch({
      type: "ADD_ITEM",
      payload: { product, size: selectedSize, color: selectedColor },
    })
    toast({
      title: "Added to Cart!",
      description: `${product.name} (${selectedSize}, ${selectedColor}) has been added to your cart.`,
    })
  }

  const buyNow = () => {
    if (!state.user) {
      onLoginClick()
      return
    }
    // Send POST request to backend with product, size, color, and user details
    fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: product._id || product.id,
        size: selectedSize,
        color: selectedColor,
        userEmail: state.user.email,
      }),
    })
    .then((res) => {
      if (res.ok) {
        // If order is successful, redirect to checkout page
        router.push("/checkout")
      } else {
        // Handle error (e.g., show toast notification)
        toast({
          title: "Order Error",
          description: "Failed to create order. Please try again.",
          variant: "destructive",
        })
      }
    })
    .catch((error) => {
      console.error("Order error:", error)
      toast({
        title: "Order Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      })
    })
  }

  const handleWishlist = async () => {
    if (!state.user) {
      onLoginClick()
      return
    }
    setWishlistLoading(true)
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: state.user.email,
          product: {
            ...product,
            id: product._id || product.id
          },
          action: wishlisted ? "remove" : "add"
        })
      })
      const data = await res.json()
      if (res.ok) {
        mutateWishlist()
        if (wishlistKey) {
          globalMutate(wishlistKey)
        }
        toast({
          title: wishlisted ? "Removed from Wishlist" : "Added to Wishlist",
          description: `${product.name} has been ${wishlisted ? "removed from" : "added to"} your wishlist.`,
        })
      } else {
        toast({ 
          title: "Wishlist Error", 
          description: data.error || "Failed to update wishlist.", 
          variant: "destructive" 
        })
      }
    } catch (e) {
      toast({ 
        title: "Wishlist Error", 
        description: "Failed to update wishlist.", 
        variant: "destructive" 
      })
    }
    setWishlistLoading(false)
  }

  // Calculate discount percentage
  const discount = Number(product.originalPrice) > Number(product.price)
    ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)
    : null

  return (
    <Card className="group hover:shadow-2xl border border-gray-100 transition-all rounded-3xl overflow-hidden relative bg-white shadow-lg hover:scale-[1.03] duration-300">
      <CardContent className="p-0">
        <div className="relative bg-gray-100">
          <Image
            src={imageSrc}
            alt={product.name || "Product"}
            width={300}
            height={300}
            className="w-full h-64 object-cover rounded-t-3xl"
            onError={handleImageError}
            unoptimized
            loading="lazy"
          />
          {/* Wishlist Heart Icon */}
          <button
            className={`absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all duration-300 border-2 border-gray-200 ${
              wishlisted ? "text-blue-700 scale-110" : "text-gray-400 hover:scale-105"
            } ${wishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            disabled={wishlistLoading}
          >
            <Heart 
              className={`transition-transform duration-300 ${wishlisted ? "text-blue-700 scale-110" : ""}`}
              fill={wishlisted ? "currentColor" : "none"}
              strokeWidth={1.5}
            />
          </button>
          {product.status === "out_of_stock" && (
            <Badge className="absolute top-2 left-2 bg-red-100 text-red-800 font-semibold">
              Out of Stock
            </Badge>
          )}
          {discount && (
            <Badge className="absolute top-2 left-20 bg-gray-200 text-blue-900 font-semibold animate-pulse">
              {discount}% OFF
            </Badge>
          )}
        </div>
      </CardContent>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            {product.category || "Uncategorized"}
          </Badge>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-700 font-semibold">{avgRating || "-"}</span>
            <span className="text-xs text-gray-400">({reviews.length})</span>
          </div>
        </div>
        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">
          {product.name || "Unnamed Product"}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 line-clamp-2 min-h-[2.5em]">
          {product.description || "No description available"}
        </CardDescription>
      </CardHeader>
      {/* Product Reviews Preview */}
      <div className="px-4 pb-2">
        {loadingReviews ? (
          <div className="text-xs text-gray-400">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-xs text-gray-400">No reviews yet</div>
        ) : (
          <ul className="space-y-1">
            {Array.isArray(reviews) && reviews.slice(0, 2).map((r, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                <span className="text-yellow-400 font-bold">
                  {'★'.repeat(r.rating || 0)}{'☆'.repeat(5 - (r.rating || 0))}
                </span>
                <span className="font-medium text-blue-800">{r.userName || "User"}:</span>
                <span className="italic line-clamp-1">{r.review}</span>
                {r.imageUrl && (
                  <img 
                    src={r.imageUrl} 
                    alt="review" 
                    className="h-6 w-6 rounded object-cover ml-1 border border-blue-200" 
                  />
                )}
              </li>
            ))}
            {reviews.length > 2 && (
              <li className="text-blue-500 cursor-pointer hover:underline text-xs">
                +{reviews.length - 2} more reviews
              </li>
            )}
          </ul>
        )}
      </div>
      <CardFooter className="pt-0">
        <div className="w-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-extrabold text-gray-900">
                ₹{formatRupee(product.price)}
              </span>
              {Number(product.originalPrice) > Number(product.price) && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{formatRupee(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 mb-3">
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="border rounded px-2 py-1"
            >
              {sizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="border rounded px-2 py-1"
            >
              {colors.map((color) => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button
              className="w-1/2 font-semibold bg-blue-900 hover:bg-blue-800 text-white shadow-md transition-all duration-200 scale-100 group-hover:scale-105 rounded-full"
              disabled={product.status === "out_of_stock"}
              variant={product.status !== "out_of_stock" ? "default" : "secondary"}
              onClick={addToCart}
            >
              {product.status !== "out_of_stock" ? (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {state.user ? "Add to Cart" : "Login to Add"}
                </>
              ) : (
                "Out of Stock"
              )}
            </Button>
            <Button
              className="w-1/2 font-semibold border-blue-900 text-blue-900 hover:bg-blue-50 hover:text-blue-900 transition-all duration-200 scale-100 group-hover:scale-105 rounded-full"
              disabled={product.status === "out_of_stock"}
              variant="outline"
              onClick={buyNow}
            >
              {state.user ? "Buy Now" : "Login to Buy"}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}