"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { CartSheet } from "@/components/cart-sheet"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { AuthDialog } from "@/components/auth-dialog"
import ProductCard from "@/components/product-card"
import useSWR from "swr"

// Category cards data
const categories = [
  { name: "SCRUB SUITS", image: "/surgical-scrubs-medical-uniform.jpg", link: "/products?category=scrubs" },
  { name: "COATS", image: "/white-doctor-coat-medical.jpg", link: "/products?category=coats" },
  { name: "NURSE UNIFORMS", image: "/nurse-uniform-medical-scrubs.jpg", link: "/products?category=nurse" },
  {
    name: "T-SHIRTS",
    image: "/medical-professionals-wearing-scrubs-hospital-unif.jpg",
    link: "/products?category=tshirts",
  },
]

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json())

function AuthSection() {
  const { state, logout } = useAuth()
  const initials = state.user ? `${state.user.firstName[0]}${state.user.lastName[0]}`.toUpperCase() : ''
  return (
    <div className="flex items-center space-x-2">
      {!state.user ? (
        <AuthDialog />
      ) : (
        <>
          <Link href="/profile">
            <button className="relative h-10 w-10 rounded-full ring-2 ring-blue-500 shadow-lg flex items-center justify-center bg-white text-blue-700 font-bold hover:ring-blue-600 transition-all">
              {initials}
            </button>
          </Link>
          <Button variant="outline" onClick={logout} className="ml-2">Logout</Button>
        </>
      )}
    </div>
  )
}

function FeaturedProductSection() {
  const { dispatch } = useCart()
  const { toast } = useToast()
  const { state } = useAuth()
  const [selectedSize, setSelectedSize] = useState("M")
  const [showAuth, setShowAuth] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  const featuredProduct = {
    id: 5,
    name: "CP STRETCH - FEMALE STRETCH SCRUB SUIT - DSVF - DEEP WINE",
    price: 1500,
    image: "/nurse-uniform-medical-scrubs-pink.jpg",
    category: "Nursing Wear",
    inStock: true,
  }

  // Wishlist logic
  const wishlistKey = state.user ? `/api/wishlist?email=${encodeURIComponent(state.user.email)}` : null
  const { data: wishlistDataRaw, mutate: mutateWishlist } = useSWR(wishlistKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })
  const wishlistItems = Array.isArray(wishlistDataRaw?.items) ? wishlistDataRaw.items : []
  const wishlisted = React.useMemo(() =>
    !!wishlistItems.find((item: any) => (item.id === featuredProduct.id) || (item._id === featuredProduct.id)),
    [wishlistItems, featuredProduct.id]
  )

  const handleWishlist = async () => {
    if (!state.user) {
      setShowAuth(true)
      return
    }
    setWishlistLoading(true)
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: state.user.email,
          product: { ...featuredProduct, id: featuredProduct.id },
          action: wishlisted ? "remove" : "add"
        })
      })
      const data = await res.json()
      if (res.ok) {
        mutateWishlist()
        toast({
          title: wishlisted ? "Removed from Wishlist" : "Added to Wishlist",
          description: `${featuredProduct.name} has been ${wishlisted ? "removed from" : "added to"} your wishlist.`,
        })
      } else {
        toast({ title: "Wishlist Error", description: data.error || "Failed to update wishlist.", variant: "destructive" })
      }
    } catch (e) {
      toast({ title: "Wishlist Error", description: "Failed to update wishlist.", variant: "destructive" })
    }
    setWishlistLoading(false)
  }

  const addToCart = () => {
    if (!state.user) {
      setShowAuth(true)
      return
    }
    dispatch({
      type: "ADD_ITEM",
      payload: { product: featuredProduct },
    })
    toast({
      title: "Added to Cart",
      description: `${featuredProduct.name} has been added to your cart.`,
    })
  }

  return (
    <div className="space-y-6">
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md">
          <AuthDialog />
        </DialogContent>
      </Dialog>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 tracking-wide mb-2">KIRAN SALES</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            CP STRETCH - FEMALE STRETCH SCRUB SUIT - DSVF - DEEP WINE
          </h3>
          <p className="text-2xl font-bold text-gray-900 mb-4">Rs. 1,500.00</p>
          <p className="text-sm text-gray-600 mb-6">Tax included. Shipping calculated at checkout.</p>
        </div>
        <button
          className={`ml-4 bg-white/90 rounded-full p-2 shadow-lg border border-gray-200 transition-all duration-300 ${
            wishlisted ? "text-pink-500 scale-110" : "text-gray-400 hover:scale-105"
          } ${wishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          disabled={wishlistLoading}
        >
          <Heart className={`transition-transform duration-300 ${wishlisted ? "fill-pink-500 scale-110" : ""}`} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-900 mb-2">COLOR: Deep Wine</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-900 mb-2">SIZE:</p>
          <div className="flex gap-2">
            {["XS", "S", "M", "L", "XL"].map((size) => (
              <Button
                key={size}
                variant={selectedSize === size ? "default" : "outline"}
                size="sm"
                className="w-12 h-12"
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>

        <Button
          onClick={addToCart}
          className="w-full btn-gradient py-3 text-sm font-medium tracking-wide"
        >
          {!state.user ? "LOGIN TO ADD" : "ADD TO CART"}
        </Button>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { state } = useAuth()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)

  // Use SWR for caching and revalidation
  const { data: productsData, error } = useSWR('/api/products', url =>
    fetch(url).then(res => res.json())
  )

  useEffect(() => {
    if (productsData) {
      setProducts(productsData)
      setLoading(false)
    }
    if (error) setLoading(false)
  }, [productsData, error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md">
          <AuthDialog />
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="navbar-glass sticky top-0 z-50 shadow-lg backdrop-blur-md">
        <div className="bg-gradient-to-r from-blue-100 via-pink-100 to-cyan-100 text-center py-2 text-sm text-gray-700 font-semibold tracking-wide shadow">Spend ₹2000+ Get 10% Off</div>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-400 rounded-full shadow-lg"></div>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-pink-400 rounded-full -ml-2 shadow-lg"></div>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-widest drop-shadow-lg">KIRAN SALES</h1>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/products" className="text-gray-700 hover:text-blue-700 font-semibold text-base tracking-wide transition-colors">SHOP</Link>
              <Link href="/products" className="text-gray-700 hover:text-pink-600 font-semibold text-base tracking-wide transition-colors">TEAM ORDERS</Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-700 font-semibold text-base tracking-wide transition-colors">ABOUT</Link>
              <Link href="/contact" className="text-gray-700 hover:text-pink-600 font-semibold text-base tracking-wide transition-colors">FAQS</Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-700 font-semibold text-base tracking-wide transition-colors">CONTACT US</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <AuthSection />
              <CartSheet />
            </div>
          </div>
        </div>
      </header>

      <section className="relative hero-gradient min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-blue-200 via-pink-100 to-cyan-100 rounded-full blur-3xl opacity-60 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight drop-shadow-xl">
                  THE HEALTHWEAR SPECIALISTS
                </h1>
                <p className="text-xl text-gray-700 mb-8 leading-relaxed font-medium">
                  Premium medical uniforms designed for comfort, durability and style.
                </p>
              </div>

              <div className="flex gap-4">
                <Link href="/products?gender=men">
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-3 text-base font-semibold tracking-wide shadow-lg rounded-full transition-all duration-300">
                    MEN
                  </Button>
                </Link>
                <Link href="/products?gender=women">
                  <Button
                    variant="outline"
                    className="border-2 border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white px-8 py-3 text-base font-semibold tracking-wide bg-transparent rounded-full transition-all duration-300 shadow-lg"
                  >
                    WOMEN
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <Image
                src="/medical-professionals-wearing-scrubs-hospital-unif.jpg"
                alt="Healthcare professional in premium scrubs"
                width={600}
                height={700}
                priority
                className="rounded-3xl object-cover w-full h-[500px] shadow-2xl border-4 border-white"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 section-gradient">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link key={index} href={category.link}>
                <Card className="group cursor-pointer glass-card hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      <Image
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        width={300}
                        height={400}
                        priority
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.currentTarget.src = "/placeholder.svg" }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                        <h3 className="text-white font-bold text-lg tracking-wide">{category.name}</h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 section-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">WHAT'S OUR SPECIALITY, YOU ASK?</h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            A decade-long legacy of mastering hospitals, look at environment whether that's your doctors, nurses, front
            desk or housekeeping, we're stocked and loaded to deliver awesome styles to outfit all your hospital teams
            anytime.
          </p>
          <Link href="/about">
            <Button className="mt-8 bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 text-sm font-medium tracking-wide">
              LEARN MORE
            </Button>
          </Link>
        </div>
      </section>

      <section className="relative py-20 hero-gradient">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <Image
                src="/medical-scrubs-uniform-blue.jpg"
                alt="Healthcare professional in motion"
                width={500}
                height={600}
                className="rounded-lg object-cover w-full h-[400px]"
              />
            </div>
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">DESIGNED TO MOVE WITH YOU</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our scrubs are engineered for the demands of healthcare professionals who never stop moving.
              </p>
              <Link href="/products">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-sm font-medium tracking-wide">
                  SHOP NOW
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">SHOP THE LOOK</h2>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <Image
                src="/nurse-uniform-medical-scrubs-pink.jpg"
                alt="Featured uniform"
                width={500}
                height={600}
                className="rounded-lg object-cover w-full h-[500px]"
              />
            </div>

            <FeaturedProductSection />
          </div>
        </div>
      </section>

      <section className="py-20 section-gradient">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Link href="/products?category=scrubs">
              <div className="relative group cursor-pointer glass-card">
                <Image
                  src="/surgical-scrubs-medical-uniform.jpg"
                  alt="Classic Scrubs"
                  width={400}
                  height={500}
                  className="w-full h-80 object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-white font-bold text-xl mb-2">CLASSIC SCRUBS</h3>
                  <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
                    SHOP NOW
                  </Button>
                </div>
              </div>
            </Link>

            <Link href="/products?category=coats">
              <div className="relative group cursor-pointer glass-card">
                <Image
                  src="/white-doctor-coat-medical.jpg"
                  alt="Designer Scrubs"
                  width={400}
                  height={500}
                  className="w-full h-80 object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-white font-bold text-xl mb-2">DESIGNER SCRUBS</h3>
                  <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
                    SHOP NOW
                  </Button>
                </div>
              </div>
            </Link>

            <Link href="/products?category=nurse">
              <div className="relative group cursor-pointer glass-card">
                <Image
                  src="/nurse-uniform-medical-scrubs.jpg"
                  alt="Stretch Scrubs"
                  width={400}
                  height={500}
                  className="w-full h-80 object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-white font-bold text-xl mb-2">STRETCH SCRUBS</h3>
                  <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
                    SHOP NOW
                  </Button>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">HEALTHWEAR SOURCING MADE SIMPLE WITH</h2>
          <h3 className="text-4xl font-bold text-gray-900 mb-8">KIRAN SALES. YOUR HELPLINE TO GREAT STYLES.</h3>
          <Link href="/contact">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 text-sm font-medium tracking-wide">
              CONTACT US
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AWESOME OFFERS</h3>
              <h4 className="text-xl font-semibold text-gray-700 mb-2">FOR INDIVIDUALS</h4>
              <p className="text-gray-600 mb-4">Special pricing for individual orders</p>
              <Link href="/products">
                <Button className="bg-pink-500 hover:bg-pink-600 text-white">SHOP NOW</Button>
              </Link>
            </div>

            <div className="glass-card p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AWESOME OFFERS</h3>
              <h4 className="text-xl font-semibold text-gray-700 mb-2">FOR TEAMS</h4>
              <p className="text-gray-600 mb-4">Bulk discounts for hospitals and clinics</p>
              <Link href="/contact">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">GET QUOTE</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">BEST SELLERS</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-4 text-center text-gray-500">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="col-span-4 text-center text-gray-500">No products found.</div>
            ) : (
              products.slice(0, 8).map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product}
                  onLoginClick={() => setShowAuth(true)}
                />
              ))
            )}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                <div className="w-6 h-6 bg-blue-500 rounded-full -ml-1"></div>
              </div>
              <span className="text-lg font-bold tracking-wide">KIRAN SALES</span>
              <p className="text-gray-400 text-sm mt-2">Premium medical uniforms and hospital linen since 1995.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 tracking-wide">PRODUCTS</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/products?category=scrubs" className="hover:text-white">Surgical Scrubs</Link></li>
                <li><Link href="/products?category=coats" className="hover:text-white">Doctor Coats</Link></li>
                <li><Link href="/products?category=nurse" className="hover:text-white">Nurse Uniforms</Link></li>
                <li><Link href="/products?category=linen" className="hover:text-white">O.T. Linen</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 tracking-wide">COMPANY</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/products" className="hover:text-white">Team Orders</Link></li>
                <li><Link href="/contact" className="hover:text-white">FAQs</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 tracking-wide">CONTACT</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>info@kiransales.com</p>
                <p>+91 98765 43210</p>
                <p>Mumbai, Maharashtra</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Kiran Sales. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}