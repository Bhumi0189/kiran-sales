"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/lib/cart-context'
import { formatRupee } from '../lib/format';
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'
import useSWR from 'swr'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const ProductCard = React.memo(({ product, onLoginClick }: { product: any, onLoginClick?: () => void }) => {
  const { dispatch } = useCart()
  const { toast } = useToast()
  const { state } = useAuth()
  const router = useRouter()
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [imageSrc, setImageSrc] = useState(() => {
    const dummyImages = [
      "/surgical-scrubs-medical-uniform.jpg",
      "/white-doctor-coat-medical-uniform.jpg",
      "/nurse-uniform-medical-scrubs.jpg",
      "/medical-professionals-wearing-scrubs-hospital-unif.jpg",
      "/hospital-bed-linen-sterile.jpg",
      "/hospital-bed-linen-white-sterile.jpg",
      "/white-doctor-coat-medical.jpg",
      "/placeholder.jpg"
    ];
    if (product.image && typeof product.image === "string" && product.image.trim() !== "" && product.image !== "/placeholder.svg") {
      return product.image;
    }
    const idx = (product._id || product.id || 0).toString().split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
    return dummyImages[idx % dummyImages.length];
  })
  
  const wishlistKey = state.user ? `/api/wishlist?email=${encodeURIComponent(state.user.email)}` : null
  const { data: wishlistDataRaw, mutate: mutateWishlist } = useSWR(wishlistKey, null, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })
  
  const wishlistItems = Array.isArray(wishlistDataRaw?.items) ? wishlistDataRaw.items : []
  const wishlisted = React.useMemo(() =>
    !!wishlistItems.find((item: any) =>
      (item.id === (product._id || product.id)) || (item._id === (product._id || product.id))
    ),
    [wishlistItems, product._id, product.id]
  )

  const [localWishlisted, setLocalWishlisted] = useState(wishlisted)
  const [selectedSize, setSelectedSize] = useState("M")
  const [selectedColor, setSelectedColor] = useState(
    Array.isArray(product.colors) && product.colors.length > 0 ? product.colors[0] : "Default Color"
  )

  React.useEffect(() => {
    setLocalWishlisted(wishlisted)
  }, [wishlisted])

  // Implement functionality for the ADD TO CART section
  const addToCart = () => {
    if (!state.user) {
      if (onLoginClick) {
        onLoginClick();
      } else {
        router.push('/profile');
      }
      return;
    }
    if (product.status === "out_of_stock" || product.stock === 0) {
      toast({
        title: "Out of Stock",
        description: "This item is currently out of stock.",
        variant: "destructive",
      });
      return;
    }
    // Ensure selected size and color are passed to the cart correctly
    dispatch({
      type: "ADD_ITEM",
      payload: {
        product,
        size: selectedSize,
        color: selectedColor,
      },
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart with size ${selectedSize} and color ${selectedColor}.`,
    })
  }

  // Implement functionality for Shop the Look
  const shopTheLook = () => {
    if (!state.user) {
      if (onLoginClick) {
        onLoginClick();
      } else {
        router.push('/profile');
      }
      return;
    }
    if (product.status === "out_of_stock" || product.stock === 0) {
      toast({
        title: "Out of Stock",
        description: "This item is currently out of stock.",
        variant: "destructive",
      });
      return;
    }
    dispatch({
      type: "ADD_ITEM",
      payload: {
        product,
        size: selectedSize,
        color: selectedColor,
      },
    });
    toast({
      title: "Shop the Look",
      description: `${product.name} has been added to your cart with size ${selectedSize} and color ${selectedColor}.`,
    });
  };

  const handleWishlist = async () => {
    if (!state.user) {
      toast({
        title: "Login Required",
        description: "Please login to add to your wishlist.",
        variant: "destructive",
      })
      return
    }
    setLocalWishlisted(!localWishlisted)
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
        toast({
          title: wishlisted ? "Removed from Wishlist" : "Added to Wishlist",
          description: `${product.name} has been ${wishlisted ? "removed from" : "added to"} your wishlist.`,
        })
      } else {
        setLocalWishlisted(wishlisted)
        toast({ title: "Wishlist Error", description: data.error || "Failed to update wishlist.", variant: "destructive" })
      }
    } catch (e) {
      setLocalWishlisted(wishlisted)
      toast({ title: "Wishlist Error", description: "Failed to update wishlist.", variant: "destructive" })
    }
    setWishlistLoading(false)
  }

  return (
    <Card className="group glass-card hover:shadow-2xl transition-shadow border-0">
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <Image
            src={imageSrc}
            alt={product.name}
            width={300}
            height={400}
            loading="eager"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="w-full h-80 object-contain group-hover:scale-105 transition-transform duration-500"
            onError={() => setImageSrc("/placeholder.svg")}
          />
          <button
            className={`absolute top-3 right-3 z-10 bg-white/90 rounded-full p-2 shadow-lg hover:bg-pink-100 transition-all duration-300 border border-gray-200 ${
              localWishlisted ? "text-pink-500 scale-110" : "text-gray-400 hover:scale-105"
            } ${wishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleWishlist}
            aria-label={localWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            disabled={wishlistLoading}
          >
            <Heart className={`transition-transform duration-300 ${localWishlisted ? "fill-pink-500 scale-110" : ""}`} />
          </button>
          {(product.status === "out_of_stock" || product.stock === 0) && (
            <Badge className="absolute top-2 left-2 bg-red-100 text-red-800">Out of Stock</Badge>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              onClick={addToCart}
              disabled={product.status === "out_of_stock" || product.stock === 0}
              className="btn-gradient font-medium"
            >
              {!state.user ? "LOGIN TO ADD" : (product.status === "out_of_stock" || product.stock === 0 ? "OUT OF STOCK" : "ADD TO CART")}
            </Button>
          </div>
        </div>
        <div className="p-4 text-center">
          <h3 className="font-medium text-gray-900 mb-2 text-sm">{product.name}</h3>
          <p className="text-lg font-bold text-gray-900">
            ₹{formatRupee(product.price)}
          </p>
          {product.originalPrice > product.price && (
            <p className="text-sm text-gray-500 line-through">
              ₹{formatRupee(product.originalPrice)}
            </p>
          )}
          <div className="flex items-center justify-between mt-4">
            {/* Size Selection */}
            <div className="size-selection w-1/2 pr-2 flex flex-col items-center">
              <p className="text-sm font-medium mb-1">Size:</p>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="h-10 w-32 text-sm"> {/* Adjusted height, width, and font size */}
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {product.sizes.map((size) => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color Selection */}
            <div className="color-selection w-1/2 pl-2">
              <p className="text-sm font-medium mb-1">Color:</p>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger className="h-12 text-lg w-full">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {['Blue', 'Red', 'Black', 'Green'].map((color) => (
                    <SelectItem key={color} value={color}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

ProductCard.displayName = 'ProductCard'
export default ProductCard